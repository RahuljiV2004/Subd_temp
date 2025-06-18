
# import ssl, socket, datetime, requests, json
# from knock import KNOCKPY
# import subprocess

# def run_whatweb_scan(domain):
#     """
#     Run WhatWeb on a domain and return JSON output.
#     """
#     try:
#         # --log-json=- means output JSON to stdout
#         result = subprocess.run(
#             ["whatweb", "--log-json=-", domain],
#             stdout=subprocess.PIPE,
#             stderr=subprocess.PIPE,
#             timeout=10,  # prevent long hangs
#             check=True
#         )
#         output = result.stdout.decode("utf-8").strip()
#         lines = output.splitlines()
#         if lines:
#             return json.loads(lines[0])
#         else:
#             return {"error": "No JSON output from WhatWeb"}
#     except subprocess.TimeoutExpired:
#         return {"error": "WhatWeb timed out"}
#     except subprocess.CalledProcessError as e:
#         return {"error": f"WhatWeb error: {e.stderr.decode('utf-8')}"}
#     except Exception as e:
#         return {"error": f"Exception: {str(e)}"}

# def log(message, level="info"):
#     return json.dumps({
#         "type": "log",
#         "message": message,
#         "level": level,
#         "timestamp": datetime.datetime.utcnow().isoformat()
#     })

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
#         headers = { "X-API-Key": api_key }
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

#             # Fetch SSL Certificate
#             cert_data = get_full_certificate(subdomain)
#             if "error" in cert_data:
#                 warning = f"⚠️ SSL Fetch Failed: {cert_data['error']}"
#                 print(f"   {warning}")
#                 yield log(warning, level="warn")
#             else:
#                 cert_msg = f"🔐 SSL Cert: CN={cert_data.get('subject_common_name')}"
#                 print(f"   {cert_msg}")
#                 yield log(cert_msg, level="info")

#             # Fetch MXToolbox
#             mxtoolbox_data = get_mxtoolbox_data(subdomain, mxtoolbox_api_key)
#             if mxtoolbox_data.get("error"):
#                 warning = f"⚠️ MXToolbox Failed: {mxtoolbox_data.get('message')}"
#                 print(f"   {warning}")
#                 yield log(warning, level="warn")
#             else:
#                 success_msg = f"📡 MXToolbox Lookup Success"
#                 print(f"   {success_msg}")
#                 yield log(success_msg, level="info")

#             # Fetch DNSDumpster
#             dnsdumpster_data = get_dnsdumpster_data(subdomain, dnsdumpster_api_key)
#             if dnsdumpster_data.get("error"):
#                 warning = f"⚠️ DNSDumpster Failed: {dnsdumpster_data.get('message')}"
#                 print(f"   {warning}")
#                 yield log(warning, level="warn")
#             else:
#                 success_msg = f"🔎 DNSDumpster Lookup Success"
#                 print(f"   {success_msg}")
#                 yield log(success_msg, level="info")

#             # Enrich the entry
#             entry["cert_details"] = cert_data
#             entry["mxtoolbox"] = mxtoolbox_data
#             entry["dnsdumpster"] = dnsdumpster_data
#             entry["scanned_at"] = datetime.datetime.utcnow().isoformat()

#             # Save to DB
#             try:
#                 res = collection.update_one({"domain": subdomain}, {"$set": entry}, upsert=True)
#                 if res.acknowledged:
#                     mongo_msg = f"✅ MongoDB Updated: {subdomain}"
#                     print(f"   {mongo_msg}")
#                     yield log(mongo_msg, level="success")
#                 else:
#                     warn_msg = f"⚠️ MongoDB update not acknowledged for: {subdomain}"
#                     print(f"   {warn_msg}")
#                     yield log(warn_msg, level="warn")
#             except Exception as db_err:
#                 error_msg = f"❌ MongoDB Error: {str(db_err)}"
#                 print(f"   {error_msg}")
#                 yield log(error_msg, level="error")
#                 continue

#             # Yield result data for frontend (optional)
#             yield json.dumps(entry)

#         except Exception as entry_err:
#             error_msg = f"❌ Error processing {entry.get('domain', 'unknown')}: {str(entry_err)}"
#             print(f"   {error_msg}")
#             yield log(error_msg, level="error")
#             continue

#     print("🏁 Scan & enrichment complete.")
#     yield log("🏁 Scan & enrichment complete.", level="success")

import ssl, socket, datetime, requests, json, subprocess
from knock import KNOCKPY

def log(message, level="info"):
    return json.dumps({
        "type": "log",
        "message": message,
        "level": level,
        "timestamp": datetime.datetime.utcnow().isoformat()
    })

def run_whatweb_scan(domain):
    try:
        whatweb_script = r"C:\Users\rahul\WhatWeb-master\whatweb"
        result = subprocess.run(
            ["ruby", r"C:\Users\rahul\WhatWeb-master\whatweb", "--log-json=-", domain],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True
        )
        output = result.stdout.decode("utf-8").strip()
        lines = output.splitlines()

        # Try each line until valid JSON is found
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

            # ✅ Save all to entry
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

            # ✅ Yield raw JSON too
            yield json.dumps(entry)

        except Exception as entry_err:
            error_msg = f"❌ Error processing {entry.get('domain', 'unknown')}: {str(entry_err)}"
            print(f"   {error_msg}")
            yield log(error_msg, level="error")
            continue

    print("🏁 Scan & enrichment complete.")
    yield log("🏁 Scan & enrichment complete.", level="success")
