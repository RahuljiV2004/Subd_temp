import subprocess
import os
import json
import datetime
import uuid
import pytz
import requests
import ssl
import socket
import hashlib
import time
import re
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import dns.resolver
from llm.cohere_cve_lookup import get_cve_info, get_risk_score_and_suggestions

# Constant for IST
IST = pytz.timezone("Asia/Kolkata")

def log(message, level="info"):
    ist_time = datetime.datetime.now(IST).isoformat()
    return f"data: {json.dumps({ 'type': 'log', 'message': message, 'level': level, 'timestamp': ist_time })}\n\n"

def result(data):
    return f"data: {json.dumps(data)}\n\n"

def get_tls_info(hostname, port=443):
    """Get comprehensive TLS certificate information"""
    try:
        # Create SSL context
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
        
        # Connect and get certificate
        with socket.create_connection((hostname, port), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert(binary_form=True)
                cert_der = cert
                cert_info = ssock.getpeercert()
                
                # Get cipher and TLS version
                cipher = ssock.cipher()
                tls_version = ssock.version()
                
                # Generate fingerprint hashes
                md5_hash = hashlib.md5(cert_der).hexdigest()
                sha1_hash = hashlib.sha1(cert_der).hexdigest()
                sha256_hash = hashlib.sha256(cert_der).hexdigest()
                
                # Parse certificate dates
                not_before = datetime.datetime.strptime(cert_info['notBefore'], '%b %d %H:%M:%S %Y %Z').isoformat()
                not_after = datetime.datetime.strptime(cert_info['notAfter'], '%b %d %H:%M:%S %Y %Z').isoformat()
                
                # Extract subject and issuer info
                subject_dict = dict(x[0] for x in cert_info['subject'])
                issuer_dict = dict(x[0] for x in cert_info['issuer'])
                
                # Get Subject Alternative Names
                san_list = []
                if 'subjectAltName' in cert_info:
                    san_list = [name[1] for name in cert_info['subjectAltName'] if name[0] == 'DNS']
                
                return {
                    'httpx_tls_host': hostname,
                    'httpx_tls_port': str(port),
                    'httpx_tls_probe_status': True,
                    'httpx_tls_tls_version': tls_version,
                    'httpx_tls_cipher': cipher[0] if cipher else None,
                    'httpx_tls_not_before': not_before,
                    'httpx_tls_not_after': not_after,
                    'httpx_tls_subject_dn': ', '.join([f"{k}={v}" for k, v in subject_dict.items()]),
                    'httpx_tls_subject_cn': subject_dict.get('commonName'),
                    'httpx_tls_subject_an': san_list,
                    'httpx_tls_serial': str(cert_info.get('serialNumber', '')),
                    'httpx_tls_issuer_dn': ', '.join([f"{k}={v}" for k, v in issuer_dict.items()]),
                    'httpx_tls_issuer_cn': issuer_dict.get('commonName'),
                    'httpx_tls_issuer_org': [issuer_dict.get('organizationName', '')],
                    'httpx_tls_fingerprint_hash': {
                        'md5': md5_hash,
                        'sha1': sha1_hash,
                        'sha256': sha256_hash
                    },
                    'httpx_tls_tls_connection': f"{tls_version}-{cipher[0]}" if cipher else tls_version,
                    'httpx_tls_sni': hostname
                }
    except Exception as e:
        return {
            'httpx_tls_probe_status': False,
            'httpx_tls_host': hostname,
            'httpx_tls_port': str(port)
        }

def detect_technologies(response, soup):
    """Detect web technologies from response headers and HTML"""
    technologies = []
    
    # Server header
    server = response.headers.get('Server', '')
    if server:
        technologies.append(server)
    
    # X-Powered-By header
    powered_by = response.headers.get('X-Powered-By', '')
    if powered_by:
        technologies.append(powered_by)
    
    # Common technology patterns in HTML
    html_content = str(soup).lower()
    
    tech_patterns = {
        'wordpress': ['wp-content', 'wp-includes', 'wordpress'],
        'drupal': ['drupal', 'sites/default/files'],
        'joomla': ['joomla', 'administrator/components'],
        'react': ['react', '_react'],
        'angular': ['angular', 'ng-'],
        'vue': ['vue.js', '__vue__'],
        'jquery': ['jquery', 'ajax.googleapis.com/ajax/libs/jquery'],
        'bootstrap': ['bootstrap', 'cdn.jsdelivr.net/npm/bootstrap'],
        'apache': ['apache'],
        'nginx': ['nginx'],
        'php': ['<?php', '.php'],
        'asp.net': ['aspnet', '__viewstate'],
        'laravel': ['laravel', 'laravel_session']
    }
    
    for tech, patterns in tech_patterns.items():
        if any(pattern in html_content for pattern in patterns):
            technologies.append(tech)
    
    return list(set(technologies))

def detect_cdn(response, hostname):
    """Detect CDN from response headers and CNAME records"""
    cdn_info = {'httpx_cdn_name': None, 'httpx_cdn_type': None}
    
    # CDN detection patterns
    cdn_patterns = {
        'cloudflare': ['cloudflare', 'cf-ray'],
        'fastly': ['fastly', 'x-served-by'],
        'amazon': ['cloudfront', 'x-amz'],
        'akamai': ['akamai', 'x-akamai'],
        'maxcdn': ['maxcdn', 'x-cdn'],
        'keycdn': ['keycdn'],
        'bunnycdn': ['bunnycdn'],
        'jsdelivr': ['jsdelivr']
    }
    
    # Check headers
    headers_str = str(response.headers).lower()
    for cdn, patterns in cdn_patterns.items():
        if any(pattern in headers_str for pattern in patterns):
            cdn_info['httpx_cdn_name'] = cdn
            cdn_info['httpx_cdn_type'] = 'reverse_proxy'
            break
    
    # Check CNAME records
    try:
        answers = dns.resolver.resolve(hostname, 'CNAME')
        for answer in answers:
            cname = str(answer.target).lower()
            for cdn, patterns in cdn_patterns.items():
                if any(pattern in cname for pattern in patterns):
                    cdn_info['httpx_cdn_name'] = cdn
                    cdn_info['httpx_cdn_type'] = 'dns'
                    break
    except:
        pass
    
    return cdn_info

def get_dns_records(hostname):
    """Get DNS A records"""
    try:
        answers = dns.resolver.resolve(hostname, 'A')
        return [str(answer) for answer in answers]
    except:
        return []

def calculate_page_hash(content):
    """Calculate a simple page hash for knowledge base"""
    # Simple hash based on content structure
    cleaned_content = re.sub(r'<[^>]+>', '', content)  # Remove HTML tags
    cleaned_content = re.sub(r'\s+', ' ', cleaned_content)  # Normalize whitespace
    return hash(cleaned_content) % (2**31)  # Keep it as 32-bit integer

def get_page_type(soup, url):
    """Determine page type based on content"""
    # Simple heuristics for page type detection
    if soup.find('form', {'action': re.compile(r'login|signin')}):
        return 'login'
    elif soup.find('title') and 'admin' in soup.find('title').text.lower():
        return 'admin'
    elif soup.find('form'):
        return 'form'
    elif len(soup.find_all('a')) > 20:
        return 'portal'
    else:
        return 'content'

def perform_http_scan(subdomain):
    """Perform comprehensive HTTP scan similar to HTTPx"""
    start_time = time.time()
    
    # Initialize result with default values
    result = {
        'httpx_timestamp': datetime.datetime.now(IST).isoformat(),
        'httpx_input': subdomain,
        'httpx_failed': False
    }
    
    # Try both HTTP and HTTPS
    schemes = ['https', 'http']
    
    for scheme in schemes:
        try:
            url = f"{scheme}://{subdomain}"
            
            # Setup session with retries
            session = requests.Session()
            retry_strategy = Retry(
                total=2,
                backoff_factor=1,
                status_forcelist=[429, 500, 502, 503, 504],
            )
            adapter = HTTPAdapter(max_retries=retry_strategy)
            session.mount("http://", adapter)
            session.mount("https://", adapter)
            
            # Make request
            response = session.get(
                url,
                timeout=10,
                allow_redirects=True,
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
            )
            
            # Parse HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Calculate timing
            end_time = time.time()
            duration = f"{end_time - start_time:.2f}s"
            
            # Extract title
            title = soup.find('title')
            title_text = title.text.strip() if title else ""
            
            # Count words and lines
            text_content = soup.get_text()
            words = len(text_content.split())
            lines = len(text_content.splitlines())
            
            # Get parsed URL components
            parsed_url = urlparse(response.url)
            
            # Fill in the result
            result.update({
                'httpx_url': response.url,
                'httpx_scheme': scheme,
                'httpx_host': parsed_url.hostname,
                'httpx_port': str(parsed_url.port) if parsed_url.port else ('443' if scheme == 'https' else '80'),
                'httpx_path': parsed_url.path or '/',
                'httpx_method': 'GET',
                'httpx_status_code': response.status_code,
                'httpx_content_length': len(response.content),
                'httpx_content_type': response.headers.get('Content-Type', ''),
                'httpx_webserver': response.headers.get('Server', ''),
                'httpx_title': title_text,
                'httpx_time': duration,
                'httpx_words': words,
                'httpx_lines': lines,
                'httpx_a': get_dns_records(subdomain),
                'httpx_resolvers': ['8.8.8.8'],  # Default resolver
                'httpx_knowledgebase': {
                    'PageType': get_page_type(soup, response.url),
                    'pHash': calculate_page_hash(response.text)
                }
            })
            
            # Detect technologies
            technologies = detect_technologies(response, soup)
            result['httpx_tech'] = technologies
            
            # Detect CDN
            cdn_info = detect_cdn(response, subdomain)
            result.update(cdn_info)
            
            # Get TLS info for HTTPS
            if scheme == 'https':
                port = parsed_url.port or 443
                tls_info = get_tls_info(parsed_url.hostname, port)
                result.update(tls_info)
            
            # Success - break out of scheme loop
            break
            
        except requests.exceptions.SSLError:
            # Try HTTP if HTTPS fails
            if scheme == 'https':
                continue
            else:
                result['httpx_failed'] = True
                break
        except Exception as e:
            if scheme == 'http':  # Last attempt failed
                result['httpx_failed'] = True
                break
            continue
    
    return result

def run_subfinder_dnsx_httpx_stream1(domain, collection):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    tools_dir = os.path.join(base_dir, '..', 'tools')
    suffix = ".exe" if os.name == "nt" else ""

    subfinder = os.path.join(tools_dir, f"subfinder{suffix}")
    dnsx = os.path.join(tools_dir, f"dnsx{suffix}")
    nuclei = os.path.join(tools_dir, f"nuclei{suffix}")

    scan_id = datetime.datetime.now(IST).strftime("%Y%m%d%H%M%S") + "_" + str(uuid.uuid4())
    yield log(f"\U0001F680 Starting subdomain scan session: {scan_id} for {domain}")

    try:
        proc = subprocess.run(
            [subfinder, "-d", domain, "-silent"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            shell=True
        )

        if proc.returncode != 0:
            yield log(f"❌ Subfinder failed: {proc.stderr}", "error")
            return

        subdomains = list(set(proc.stdout.strip().splitlines()))
        yield log(f"✅ Subfinder found {len(subdomains)} subdomains.")

        if not subdomains:
            yield log("⚠️ No subdomains found.", "warn")
            return

        for i, sub in enumerate(subdomains, 1):
            row = {
                "scan_id": scan_id,
                "subdomain": sub,
                "subfinder_found": True,
                "domain": domain,
                "scanned_at": datetime.datetime.now(IST).isoformat()
            }

            # DNSx scan
            dnsx_proc = subprocess.run(
                [dnsx, "-silent", "-json"],
                input=sub,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                shell=True
            )

            if dnsx_proc.returncode == 0 and dnsx_proc.stdout.strip():
                try:
                    dnsx_entry = json.loads(dnsx_proc.stdout.strip())
                    row.update({f"dnsx_{k}": v for k, v in dnsx_entry.items()})
                    yield log(f"✅ [{i}/{len(subdomains)}] DNSx: {sub}")
                except Exception as e:
                    yield log(f"⚠️ [{i}/{len(subdomains)}] DNSx parse error for {sub}: {str(e)}", "warn")
                    continue
            else:
                yield log(f"❌ [{i}/{len(subdomains)}] DNSx failed or no result for {sub}", "warn")
                collection.insert_one(row)
                row_to_send = dict(row)
                row_to_send.pop("_id", None)
                yield result(row_to_send)
                continue

            # === 🔄 CUSTOM HTTP SCAN (replacing HTTPx) ===
            try:
                yield log(f"🔍 [{i}/{len(subdomains)}] Starting HTTP scan for {sub}")
                http_data = perform_http_scan(sub)
                row.update(http_data)
                
                if not http_data.get('httpx_failed', True):
                    yield log(f"✅ [{i}/{len(subdomains)}] HTTP scan: {sub} -> {http_data.get('httpx_url', 'N/A')}")
                else:
                    yield log(f"❌ [{i}/{len(subdomains)}] HTTP scan failed for {sub}", "warn")
                    
            except Exception as e:
                yield log(f"⚠️ [{i}/{len(subdomains)}] HTTP scan error for {sub}: {str(e)}", "warn")
                row['httpx_failed'] = True

            # === 🔍 NUCLEI SCANNING ===
            if "httpx_url" in row and not row.get('httpx_failed', False):
                try:
                    nuclei_proc = subprocess.run(
                        [nuclei, "-u", row["httpx_url"], "-json", "-silent"],
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        text=True,
                        shell=True
                    )

                    if nuclei_proc.returncode == 0 and nuclei_proc.stdout.strip():
                        nuclei_results = [json.loads(line) for line in nuclei_proc.stdout.strip().splitlines()]
                        row["vulnerabilities"] = nuclei_results
                        yield log(f"⚠️ [{i}/{len(subdomains)}] Nuclei found {len(nuclei_results)} issues on {row['httpx_url']}")
                    else:
                        yield log(f"✅ [{i}/{len(subdomains)}] No Nuclei issues found on {row['httpx_url']}")
                except Exception as e:
                    yield log(f"❌ Nuclei error on {row['httpx_url']}: {str(e)}", "error")
            
            # === 💡 Add Cohere CVE Suggestion based on httpx_tech ===
            if "httpx_tech" in row and isinstance(row["httpx_tech"], list):
                try:
                    cve_suggestions = get_cve_info(row["httpx_tech"])
                    row["cohere_cves"] = cve_suggestions
                    yield log(f"📌 [{i}/{len(subdomains)}] Cohere suggested {len(cve_suggestions)} CVEs for {sub}")
                except Exception as e:
                    yield log(f"⚠️ Cohere CVE enrichment failed for {sub}: {str(e)}", "warn")
            
            # === 💡 Add Cohere Risk Scoring ===
            try:
                risk_summary = get_risk_score_and_suggestions(row)
                row["risk_score"] = risk_summary.get("risk_score")
                row["risk_reason"] = risk_summary.get("reason")
                row["risk_suggestions"] = risk_summary.get("suggestions")
                yield log(f"🔐 [{i}/{len(subdomains)}] Cohere risk score: {row['risk_score']} — {row['risk_reason']}")
            except Exception as e:
                yield log(f"⚠️ Risk scoring failed for {sub}: {str(e)}", "warn")

            collection.insert_one(row)
            row_to_send = dict(row)
            row_to_send.pop("_id", None)
            yield log(f"✅ [{i}/{len(subdomains)}] Stored: {sub}")
            yield result(row_to_send)

        yield log(f"🏁 Done. Processed {len(subdomains)} subdomains. Scan ID: {scan_id}", "success")

    except Exception as e:
        yield log(f"❌ Pipeline error: {str(e)}", "error")