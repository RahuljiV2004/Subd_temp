
# import ssl, socket, datetime, requests, json, subprocess
# from knock import KNOCKPY

# def log(message, level="info"):
#     return json.dumps({
#         "type": "log",
#         "message": message,
#         "level": level,
#         "timestamp": datetime.datetime.utcnow().isoformat()
#     })

# def run_whatweb_scan(domain):
#     try:
#         whatweb_script = r"C:\Users\rahul\WhatWeb-master\whatweb"
#         result = subprocess.run(
#             ["ruby", r"C:\Users\rahul\WhatWeb-master\whatweb", "--log-json=-", domain],
#             stdout=subprocess.PIPE,
#             stderr=subprocess.PIPE,
#             check=True
#         )
#         output = result.stdout.decode("utf-8").strip()
#         lines = output.splitlines()

#         # Try each line until valid JSON is found
#         for line in lines:
#             line = line.strip()
#             if not line:
#                 continue
#             try:
#                 data = json.loads(line)
#                 return data
#             except json.JSONDecodeError:
#                 continue

#         return {"error": "No valid JSON output from WhatWeb"}

#     except subprocess.CalledProcessError as e:
#         return {"error": f"WhatWeb error: {e.stderr.decode('utf-8')}"}
#     except Exception as e:
#         return {"error": f"Exception: {str(e)}"}


# def get_full_certificate(domain):
#     try:
#         context = ssl.create_default_context()
#         with socket.create_connection((domain, 443), timeout=3) as sock:
#             with context.wrap_socket(sock, server_hostname=domain) as ssock:
#                 cert = ssock.getpeercert()
#                 return {
#                     "subject_common_name": next((t[0][1] for t in cert["subject"] if t[0][0] == "commonName"), None),
#                     "issuer_common_name": next((t[0][1] for t in cert["issuer"] if t[0][0] == "commonName"), None),
#                     "valid_from": cert.get("notBefore"),
#                     "valid_to": cert.get("notAfter"),
#                     "serial_number": cert.get("serialNumber", None),
#                     "full_raw": cert
#                 }
#     except Exception as e:
#         return {"error": str(e)}

# def get_mxtoolbox_data(domain, api_key):
#     try:
#         url = f"https://api.mxtoolbox.com/api/v1/lookup/dns/{domain}?authorization={api_key}"
#         response = requests.get(url)
#         if response.status_code == 200:
#             return response.json()
#         else:
#             return {"error": True, "status": response.status_code, "message": response.text}
#     except Exception as e:
#         return {"error": True, "message": str(e)}

# def get_dnsdumpster_data(domain, api_key):
#     try:
#         url = f"https://api.dnsdumpster.com/domain/{domain}"
#         headers = {"X-API-Key": api_key}
#         response = requests.get(url, headers=headers)
#         if response.status_code == 200:
#             return response.json()
#         else:
#             return {"error": True, "status": response.status_code, "message": response.text}
#     except Exception as e:
#         return {"error": True, "message": str(e)}

# def run_knockpy_and_enhance_streaming(domain, collection, mxtoolbox_api_key, dnsdumpster_api_key):
#     yield log(f"Starting Knockpy scan on: {domain}", level="info")
#     print(f"🚀 Starting Knockpy scan on: {domain}")

#     try:
#         results = KNOCKPY(domain, recon=True, bruteforce=True)
#     except Exception as e:
#         yield log(f"❌ Knockpy failed: {str(e)}", level="error")
#         print(f"❌ Knockpy failed: {str(e)}")
#         return

#     yield log(f"✅ Knockpy completed. {len(results)} subdomains found.", level="info")
#     print(f"✅ Knockpy completed. {len(results)} subdomains found.")

#     try:
#         collection.delete_many({})
#         yield log("🗑️ Cleared existing subdomain records in DB", level="warn")
#         print("🗑️ Cleared existing subdomain records in DB")
#     except Exception as clear_err:
#         err_msg = f"❌ Failed to clear old records: {str(clear_err)}"
#         yield log(err_msg, level="error")
#         print(err_msg)
#         return

#     for idx, entry in enumerate(results):
#         try:
#             subdomain = entry.get("domain")
#             message = f"[{idx+1}/{len(results)}] ▶️ Processing: {subdomain}"
#             print(message)
#             yield log(message, level="info")

#             # ✅ SSL Cert
#             cert_data = get_full_certificate(subdomain)
#             if "error" in cert_data:
#                 warning = f"⚠️ SSL Fetch Failed: {cert_data['error']}"
#                 print(f"   {warning}")
#                 yield log(warning, level="warn")
#             else:
#                 cert_msg = f"🔐 SSL Cert: CN={cert_data.get('subject_common_name')}"
#                 print(f"   {cert_msg}")
#                 yield log(cert_msg, level="info")

#             # ✅ MXToolbox
#             mxtoolbox_data = get_mxtoolbox_data(subdomain, mxtoolbox_api_key)
#             if mxtoolbox_data.get("error"):
#                 warning = f"⚠️ MXToolbox Failed: {mxtoolbox_data.get('message')}"
#                 print(f"   {warning}")
#                 yield log(warning, level="warn")
#             else:
#                 success_msg = f"📡 MXToolbox Lookup Success"
#                 print(f"   {success_msg}")
#                 yield log(success_msg, level="info")

#             # ✅ DNSDumpster
#             dnsdumpster_data = get_dnsdumpster_data(subdomain, dnsdumpster_api_key)
#             if dnsdumpster_data.get("error"):
#                 warning = f"⚠️ DNSDumpster Failed: {dnsdumpster_data.get('message')}"
#                 print(f"   {warning}")
#                 yield log(warning, level="warn")
#             else:
#                 success_msg = f"🔎 DNSDumpster Lookup Success"
#                 print(f"   {success_msg}")
#                 yield log(success_msg, level="info")

#             # ✅ WhatWeb
#             whatweb_data = run_whatweb_scan(subdomain)
#             if whatweb_data.get("error"):
#                 warning = f"⚠️ WhatWeb Failed: {whatweb_data['error']}"
#                 print(f"   {warning}")
#                 yield log(warning, level="warn")
#             else:
#                 success_msg = f"🕵️ WhatWeb Fingerprint Success"
#                 print(f"   {success_msg}")
#                 yield log(success_msg, level="info")

#             # ✅ Save all to entry
#             entry["cert_details"] = cert_data
#             entry["mxtoolbox"] = mxtoolbox_data
#             entry["dnsdumpster"] = dnsdumpster_data
#             entry["whatweb"] = whatweb_data
#             entry["scanned_at"] = datetime.datetime.utcnow().isoformat()

#             # ✅ Store in MongoDB
#             res = collection.update_one({"domain": subdomain}, {"$set": entry}, upsert=True)
#             if res.acknowledged:
#                 mongo_msg = f"✅ MongoDB Updated: {subdomain}"
#                 print(f"   {mongo_msg}")
#                 yield log(mongo_msg, level="success")
#             else:
#                 warn_msg = f"⚠️ MongoDB update not acknowledged for: {subdomain}"
#                 print(f"   {warn_msg}")
#                 yield log(warn_msg, level="warn")

#             # ✅ Yield raw JSON too
#             yield json.dumps(entry)

#         except Exception as entry_err:
#             error_msg = f"❌ Error processing {entry.get('domain', 'unknown')}: {str(entry_err)}"
#             print(f"   {error_msg}")
#             yield log(error_msg, level="error")
#             continue

#     print("🏁 Scan & enrichment complete.")
#     yield log("🏁 Scan & enrichment complete.", level="success")
import ssl, socket, datetime, requests, json, subprocess, time
from knock import KNOCKPY
from zapv2 import ZAPv2

def log(message, level="info"):
    return json.dumps({
        "type": "log",
        "message": message,
        "level": level,
        "timestamp": datetime.datetime.utcnow().isoformat()
    })

def run_whatweb_scan(domain):
    try:
        result = subprocess.run(
            ["ruby", r"C:\Users\rahul\WhatWeb-master\whatweb", "--log-json=-", domain],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True
        )
        output = result.stdout.decode("utf-8").strip()
        lines = output.splitlines()
        for line in lines:
            line = line.strip()
            if not line:
                continue
            try:
                data = json.loads(line)
                return data
            except json.JSONDecodeError:
                continue
        return {"error": "No valid JSON output from WhatWeb"}
    except subprocess.CalledProcessError as e:
        return {"error": f"WhatWeb error: {e.stderr.decode('utf-8')}"}
    except Exception as e:
        return {"error": f"Exception: {str(e)}"}

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

def get_dnsdumpster_data(domain, api_key):
    try:
        url = f"https://api.dnsdumpster.com/domain/{domain}"
        headers = {"X-API-Key": api_key}
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": True, "status": response.status_code, "message": response.text}
    except Exception as e:
        return {"error": True, "message": str(e)}

def run_knockpy_and_enhance_streaming(domain, collection, mxtoolbox_api_key, dnsdumpster_api_key):
    yield log(f"Starting Knockpy scan on: {domain}", level="info")
    print(f"🚀 Starting Knockpy scan on: {domain}")

    try:
        results = KNOCKPY(domain, recon=True, bruteforce=True)
    except Exception as e:
        yield log(f"❌ Knockpy failed: {str(e)}", level="error")
        print(f"❌ Knockpy failed: {str(e)}")
        return

    yield log(f"✅ Knockpy completed. {len(results)} subdomains found.", level="info")
    print(f"✅ Knockpy completed. {len(results)} subdomains found.")

    try:
        collection.delete_many({})
        yield log("🗑️ Cleared existing subdomain records in DB", level="warn")
        print("🗑️ Cleared existing subdomain records in DB")
    except Exception as clear_err:
        err_msg = f"❌ Failed to clear old records: {str(clear_err)}"
        yield log(err_msg, level="error")
        print(err_msg)
        return

    # ✅ Setup ZAP once
    ZAP_ADDRESS = '127.0.0.1'
    ZAP_PORT = '8080'
    ZAP_API_KEY = 'vmkqcd8hdro5fc0cct2jv7vvr0'

    try:
        zap = ZAPv2(apikey=ZAP_API_KEY, proxies={
            'http': f'http://{ZAP_ADDRESS}:{ZAP_PORT}',
            'https': f'http://{ZAP_ADDRESS}:{ZAP_PORT}'
        })
        zap_version = zap.core.version
        print(f"[+] Connected to ZAP version: {zap_version}")
        yield log(f"Connected to ZAP version: {zap_version}", level="info")
    except Exception as zap_err:
        zap = None
        warn_msg = f"[❌] Failed to connect to ZAP: {str(zap_err)}"
        print(warn_msg)
        yield log(warn_msg, level="warn")

    for idx, entry in enumerate(results):
        try:
            subdomain = entry.get("domain")
            message = f"[{idx+1}/{len(results)}] ▶️ Processing: {subdomain}"
            print(message)
            yield log(message, level="info")

            # ✅ SSL Cert
            cert_data = get_full_certificate(subdomain)
            if "error" in cert_data:
                warning = f"⚠️ SSL Fetch Failed: {cert_data['error']}"
                print(f"   {warning}")
                yield log(warning, level="warn")
            else:
                cert_msg = f"🔐 SSL Cert: CN={cert_data.get('subject_common_name')}"
                print(f"   {cert_msg}")
                yield log(cert_msg, level="info")

            # ✅ MXToolbox
            mxtoolbox_data = get_mxtoolbox_data(subdomain, mxtoolbox_api_key)
            if mxtoolbox_data.get("error"):
                warning = f"⚠️ MXToolbox Failed: {mxtoolbox_data.get('message')}"
                print(f"   {warning}")
                yield log(warning, level="warn")
            else:
                success_msg = f"📡 MXToolbox Lookup Success"
                print(f"   {success_msg}")
                yield log(success_msg, level="info")

            # ✅ DNSDumpster
            dnsdumpster_data = get_dnsdumpster_data(subdomain, dnsdumpster_api_key)
            if dnsdumpster_data.get("error"):
                warning = f"⚠️ DNSDumpster Failed: {dnsdumpster_data.get('message')}"
                print(f"   {warning}")
                yield log(warning, level="warn")
            else:
                success_msg = f"🔎 DNSDumpster Lookup Success"
                print(f"   {success_msg}")
                yield log(success_msg, level="info")

            # ✅ WhatWeb
            whatweb_data = run_whatweb_scan(subdomain)
            if whatweb_data.get("error"):
                warning = f"⚠️ WhatWeb Failed: {whatweb_data['error']}"
                print(f"   {warning}")
                yield log(warning, level="warn")
            else:
                success_msg = f"🕵️ WhatWeb Fingerprint Success"
                print(f"   {success_msg}")
                yield log(success_msg, level="info")

            # ✅ ZAP Scan
            if zap:
                try:
                    zap.spider.set_option_max_children(1)
                    zap.spider.set_option_max_depth(1)
                    spider_id = zap.spider.scan(f"http://{subdomain}")
                    time.sleep(1)
                    while int(zap.spider.status(spider_id)) < 100:
                        print(f"   🕷️ Spider progress: {zap.spider.status(spider_id)}%")
                        time.sleep(1)
                    print(f"   ✅ Spider done for: {subdomain}")

                    zap.ascan.set_option_thread_per_host(20)
                    zap.ascan.disable_all_scanners()
                    zap.ascan.enable_scanners("40012,40018")  # XSS & SQLi
                    ascan_id = zap.ascan.scan(f"http://{subdomain}")
                    time.sleep(2)
                    while int(zap.ascan.status(ascan_id)) < 100:
                        print(f"   ⚡ Active Scan progress: {zap.ascan.status(ascan_id)}%")
                        time.sleep(2)
                    print(f"   ✅ Active Scan done for: {subdomain}")

                    zap_alerts = zap.core.alerts(baseurl=f"http://{subdomain}")
                    zap_msg = f"🛡️ ZAP found {len(zap_alerts)} alerts for: {subdomain}"
                    print(f"   {zap_msg}")
                    yield log(zap_msg, level="info")

                    entry["zap_alerts"] = zap_alerts

                except Exception as zap_scan_err:
                    zap_err_msg = f"⚠️ ZAP scan failed for {subdomain}: {str(zap_scan_err)}"
                    print(f"   {zap_err_msg}")
                    yield log(zap_err_msg, level="warn")
            else:
                warn_nozap = "⚠️ ZAP not connected; skipping ZAP scan."
                print(f"   {warn_nozap}")
                yield log(warn_nozap, level="warn")

            # ✅ Add everything
            entry["cert_details"] = cert_data
            entry["mxtoolbox"] = mxtoolbox_data
            entry["dnsdumpster"] = dnsdumpster_data
            entry["whatweb"] = whatweb_data
            entry["scanned_at"] = datetime.datetime.utcnow().isoformat()

            # ✅ Store in MongoDB
            res = collection.update_one({"domain": subdomain}, {"$set": entry}, upsert=True)
            if res.acknowledged:
                mongo_msg = f"✅ MongoDB Updated: {subdomain}"
                print(f"   {mongo_msg}")
                yield log(mongo_msg, level="success")
            else:
                warn_msg = f"⚠️ MongoDB update not acknowledged for: {subdomain}"
                print(f"   {warn_msg}")
                yield log(warn_msg, level="warn")

            yield json.dumps(entry)

        except Exception as entry_err:
            error_msg = f"❌ Error processing {entry.get('domain', 'unknown')}: {str(entry_err)}"
            print(f"   {error_msg}")
            yield log(error_msg, level="error")
            continue

    print("🏁 Scan & enrichment complete.")
    yield log("🏁 Scan & enrichment complete.", level="success")