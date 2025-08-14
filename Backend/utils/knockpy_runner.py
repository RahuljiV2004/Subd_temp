
import uuid
import ssl
import socket
import datetime
import time
import requests
import json
import subprocess
import traceback
import os
from zapv2 import ZAPv2
import pytz

# ✅ Path to tools
TOOLS_DIR = os.path.join(os.path.dirname(__file__), "..", "tools")
HTTPX_BIN = os.path.join(TOOLS_DIR, "httpx")
DNSX_BIN = os.path.join(TOOLS_DIR, "dnsx")
IST = pytz.timezone("Asia/Kolkata")
scan_id = datetime.datetime.now(IST).strftime("%Y%m%d%H%M%S") + "_" + str(uuid.uuid4())

def log(message, level="info"):
    return json.dumps({
        "type": "log",
        "message": message,
        "level": level,
        "timestamp": datetime.datetime.utcnow().isoformat()
    })

# 🔐 SSL certificate info
def get_full_certificate(domain):
    try:
        context = ssl.create_default_context()
        with socket.create_connection((domain, 443), timeout=3) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                return {
                    "subject_common_name": next((t[0][1] for t in cert["subject"] if t[0][0] == "commonName"), None),
                    "issuer_common_name": next((t[0][1] for t in cert["issuer"] if t[0][0] == "commonName"), None),
                    "valid_from": cert.get("notBefore"),
                    "valid_to": cert.get("notAfter"),
                    "serial_number": cert.get("serialNumber", None),
                    "full_raw": cert
                }
    except Exception as e:
        return {"error": str(e)}

# 📡 MXToolbox API
def get_mxtoolbox_data(domain, api_key):
    try:
        url = f"https://api.mxtoolbox.com/api/v1/lookup/dns/{domain}?authorization={api_key}"
        response = requests.get(url)
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": True, "status": response.status_code, "message": response.text}
    except Exception as e:
        return {"error": True, "message": str(e)}

# ⚡ Check live subdomains + detect tech
def run_httpx_and_parse(subdomains):
    httpx_data = []
    try:
        input_data = "\n".join(subdomains).encode()
        result = subprocess.run(
            [HTTPX_BIN, "-silent", "-json", "-tls-probe"],
            input=input_data,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True
        )
        for line in result.stdout.decode(errors='ignore').splitlines():
            try:
                httpx_entry = json.loads(line)
                row = {}
                for k, v in httpx_entry.items():
                    if k == "tls" and isinstance(v, dict):
                        for subk, subv in v.items():
                            row[f"httpx_tls_{subk}"] = subv
                    elif k != "tls":
                        row[f"httpx_{k}"] = v
                row["input"] = httpx_entry.get("input")
                httpx_data.append(row)
            except Exception as e:
                print(log(f"⚠️ HTTPx parse error: {str(e)}", "warn"))
    except Exception as e:
        print(log(f"❌ HTTPx failed: {str(e)}", "error"))
    return httpx_data

def run_dnsx(domain):
    try:
        input_data = domain.encode()
        result = subprocess.run(
            [DNSX_BIN, "-silent", "-json"],
            input=input_data,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True
        )
        return [json.loads(line) for line in result.stdout.decode().splitlines()]
    except Exception as e:
        print(log(f"❌ DNSx failed: {str(e)}", "error"))
        return []

# 🔁 Main enrichment runner
def run_knockpy_and_enhance_streaming(domain, collection, mxtoolbox_api_key, DNSDUMPSTER_API_KEY):
    from knock import KNOCKPY
    yield log(f"🚀 Starting Knockpy scan on: {domain}")

    try:
        results = KNOCKPY(domain, recon=True, bruteforce=True)
    except Exception as e:
        yield log(f"❌ Knockpy failed: {str(e)}", level="error")
        return

    all_subdomains = [entry["domain"] for entry in results]
    yield log("🔎 Probing live subdomains and detecting tech with httpx...")

    httpx_results = run_httpx_and_parse(all_subdomains)
    alive_map = {entry['input']: entry for entry in httpx_results}
    alive_domains = list(alive_map.keys())
    yield log(f"✅ {len(alive_domains)} live subdomains detected.")

    dnsx_results = run_dnsx(domain)
    dns_map = {entry['host']: entry for entry in dnsx_results}

    ZAP_ADDRESS = 'zap'      # service name from docker-compose.yml
    ZAP_PORT = '8085'        # the port you set in ZAP container

    ZAP_API_KEY = 'vmkqcd8hdro5fc0cct2jv7vvr0'

    try:
        zap = ZAPv2(apikey=ZAP_API_KEY, proxies={
            'http': f'http://{ZAP_ADDRESS}:{ZAP_PORT}',
            'https': f'http://{ZAP_ADDRESS}:{ZAP_PORT}'
        })
        zap_version = zap.core.version
        yield log(f"Connected to ZAP version: {zap_version}", level="info")
    except Exception as zap_err:
        zap = None
        yield log(f"[❌] Failed to connect to ZAP: {str(zap_err)}", level="warn")

    for entry in results:
        try:
            subdomain = entry["domain"]
            if subdomain not in alive_map:
                continue

            yield log(f"🔄 Processing: {subdomain}")

            cert_data = get_full_certificate(subdomain)
            yield log(f"🔐 SSL CN: {cert_data.get('subject_common_name', 'N/A')}")

            mxtoolbox_data = get_mxtoolbox_data(subdomain, mxtoolbox_api_key)
            yield log("📡 MXToolbox lookup success" if not mxtoolbox_data.get("error") else f"⚠️ MXToolbox error: {mxtoolbox_data.get('message')}", level="warn" if mxtoolbox_data.get("error") else "info")

            httpx_info = alive_map[subdomain]
            dns_info = dns_map.get(subdomain, {})

            if zap:
                try:
                    zap.spider.set_option_max_children(1)
                    zap.spider.set_option_max_depth(1)
                    spider_id = zap.spider.scan(f"http://{subdomain}")
                    time.sleep(1)
                    while int(zap.spider.status(spider_id)) < 100:
                        time.sleep(1)
                    zap.ascan.set_option_thread_per_host(20)
                    zap.ascan.disable_all_scanners()
                    zap.ascan.enable_scanners("40012,40018")
                    ascan_id = zap.ascan.scan(f"http://{subdomain}")
                    time.sleep(2)
                    while int(zap.ascan.status(ascan_id)) < 100:
                        time.sleep(2)
                    zap_alerts = zap.core.alerts(baseurl=f"http://{subdomain}")
                    entry["zap_alerts"] = zap_alerts
                    yield log(f"🛡️ ZAP found {len(zap_alerts)} alerts for: {subdomain}", level="info")
                except Exception as zap_scan_err:
                    yield log(f"⚠️ ZAP scan failed for {subdomain}: {str(zap_scan_err)}", level="warn")
            else:
                yield log("⚠️ ZAP not connected; skipping ZAP scan.", level="warn")

            entry.update({
                "cert_details": cert_data,
                "mxtoolbox": mxtoolbox_data,
                "httpx": httpx_info,
                "dnsx": dns_info,
                "detected_technologies": httpx_info.get("httpx_tech", []),
                "scanned_at": datetime.datetime.utcnow().isoformat()
            })

            res = collection.insert_one(entry)
            if res.acknowledged:
                yield log(f"✅ MongoDB Updated: {subdomain}", level="success")
            else:
                yield log(f"⚠️ MongoDB insert not acknowledged for: {subdomain}", level="warn")

            entry["_id"] = str(entry["_id"])
            yield json.dumps(entry)

        except Exception as err:
            yield log(f"❌ Error on {entry.get('domain', 'unknown')}: {str(err)}\n{traceback.format_exc()}", level="error")
            continue

    yield log("🏁 Scan & enrichment complete.", level="success")
