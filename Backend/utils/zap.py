# # import time
# # import sys
# # from pprint import pprint
# # from zapv2 import ZAPv2

# # # ================================
# # # CONFIGURATION
# # # ================================
# # ZAP_ADDRESS = '127.0.0.1'
# # ZAP_PORT = '8080'
# # ZAP_API_KEY = 'vmkqcd8hdro5fc0cct2jv7vvr0'
# # TARGET = 'https://lms.snuchennai.edu.in'  # <-- change this to your subdomain

# # # Timeout (in seconds)
# # MAX_RUNTIME = 240  # 4 minutes

# # # ================================
# # # INIT ZAP API CLIENT
# # # ================================
# # zap = ZAPv2(apikey=ZAP_API_KEY, proxies={'http': f'http://{ZAP_ADDRESS}:{ZAP_PORT}', 'https': f'http://{ZAP_ADDRESS}:{ZAP_PORT}'})

# # start_time = time.time()

# # try:
# #     print(f"⚙️  Scanning target: {TARGET}")

# #     # 1) Configure Spider with reasonable depth
# #     zap.spider.set_option_max_depth(5)
# #     zap.spider.set_option_max_children(10)

# #     # 2) Start Spider
# #     spider_id = zap.spider.scan(TARGET)
# #     time.sleep(2)

# #     while int(zap.spider.status(spider_id)) < 100:
# #         if time.time() - start_time > MAX_RUNTIME:
# #             print("⏰ Timeout reached during Spider. Exiting.")
# #             sys.exit(1)
# #         print(f"🕷️  Spider progress: {zap.spider.status(spider_id)}%")
# #         time.sleep(2)

# #     print(f"✅ Spider completed for {TARGET}")

# #     # 3) Start Active Scan (XSS & SQLi only)
# #     zap.ascan.set_option_thread_per_host(10)
# #     zap.ascan.disable_all_scanners()
# #     zap.ascan.enable_scanners("40012,40018")

# #     ascan_id = zap.ascan.scan(TARGET)
# #     time.sleep(2)

# #     while int(zap.ascan.status(ascan_id)) < 100:
# #         if time.time() - start_time > MAX_RUNTIME:
# #             print("⏰ Timeout reached during Active Scan. Exiting.")
# #             sys.exit(1)
# #         print(f"⚡ Active Scan progress: {zap.ascan.status(ascan_id)}%")
# #         time.sleep(2)

# #     print(f"✅ Active Scan completed for {TARGET}")

# #     # 4) Fetch Alerts
# #     alerts = zap.core.alerts(baseurl=TARGET)
# #     print(f"🔍 Found {len(alerts)} alerts")
# #     pprint(alerts)

# # except Exception as e:
# #     print(f"❌ Error: {str(e)}")
# #     sys.exit(1)

# # print(f"🎉 Total time: {round(time.time() - start_time, 2)} seconds")
# import time
# import sys
# import json
# from zapv2 import ZAPv2

# # ================================
# # CONFIGURATION
# # ================================
# ZAP_ADDRESS = '127.0.0.1'
# ZAP_PORT = '8080'
# ZAP_API_KEY = 'vmkqcd8hdro5fc0cct2jv7vvr0'
# TARGET = 'https://tvk.family'  # <-- change this to your subdomain


# # Timeout for entire script (seconds)
# MAX_RUNTIME = 240  # 4 mins

# OUTPUT_FILE = 'zap_alerts.json'

# # ================================
# # INIT ZAP API CLIENT
# # ================================
# zap = ZAPv2(apikey=ZAP_API_KEY, proxies={
#     'http': f'http://{ZAP_ADDRESS}:{ZAP_PORT}',
#     'https': f'http://{ZAP_ADDRESS}:{ZAP_PORT}'
# })

# start_time = time.time()

# try:
#     print(f"⚙️  Starting scan for: {TARGET}")

#     # 1️⃣ Configure Spider
#     zap.spider.set_option_max_depth(5)
#     zap.spider.set_option_max_children(10)

#     # 2️⃣ Start Spider
#     spider_id = zap.spider.scan(TARGET)
#     time.sleep(2)

#     while int(zap.spider.status(spider_id)) < 100:
#         if time.time() - start_time > MAX_RUNTIME:
#             print("⏰ Timeout during Spider. Exiting.")
#             sys.exit(1)
#         print(f"🕷️  Spider progress: {zap.spider.status(spider_id)}%")
#         time.sleep(2)

#     print(f"✅ Spider finished for: {TARGET}")

#     # 3️⃣ Start Active Scan (XSS & SQLi)
#     zap.ascan.set_option_thread_per_host(10)
#     zap.ascan.disable_all_scanners()
#     zap.ascan.enable_scanners("40012,40018")

#     ascan_id = zap.ascan.scan(TARGET)
#     time.sleep(2)

#     while int(zap.ascan.status(ascan_id)) < 100:
#         if time.time() - start_time > MAX_RUNTIME:
#             print("⏰ Timeout during Active Scan. Exiting.")
#             sys.exit(1)
#         print(f"⚡ Active Scan progress: {zap.ascan.status(ascan_id)}%")
#         time.sleep(2)

#     print(f"✅ Active Scan finished for: {TARGET}")

#     # 4️⃣ Fetch Alerts
#     alerts = zap.core.alerts(baseurl=TARGET)
#     print(f"🔍 Found {len(alerts)} alerts")

#     # 5️⃣ Save to JSON
#     with open(OUTPUT_FILE, 'w') as f:
#         json.dump(alerts, f, indent=2)

#     print(f"📁 Alerts saved to {OUTPUT_FILE}")

# except Exception as e:
#     print(f"❌ Error: {str(e)}")
#     sys.exit(1)

# print(f"🎉 Done in {round(time.time() - start_time, 2)} seconds")
# import re
# import time
# from zapv2 import ZAPv2

# # -----------------------------------------------
# # ZAP CONFIG
# ZAP_ADDRESS = '127.0.0.1'
# ZAP_PORT = '8080'
# ZAP_API_KEY = 'vmkqcd8hdro5fc0cct2jv7vvr0'

# # -----------------------------------------------
# # Helpers

# def is_valid_domain(domain):
#     return bool(re.match(r"^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z]{2,})+$", domain))

# def is_valid_ip(ip):
#     return bool(re.match(r"^\d{1,3}(\.\d{1,3}){3}$", ip))

# # -----------------------------------------------
# # Run single ZAP scan for given subdomain

# def run_single_zap_scan(subdomain):
#     """
#     Connect to ZAP, run Spider + Active Scan on the subdomain, return alerts.
#     """
#     # ✅ Validate target
#     if not (is_valid_domain(subdomain) or is_valid_ip(subdomain)):
#         return {"error": f"Invalid target: {subdomain}"}

#     try:
#         # ✅ Connect ZAP API
#         zap = ZAPv2(
#             apikey=ZAP_API_KEY,
#             proxies={
#                 'http': f'http://{ZAP_ADDRESS}:{ZAP_PORT}',
#                 'https': f'http://{ZAP_ADDRESS}:{ZAP_PORT}'
#             }
#         )
#         zap_version = zap.core.version
#     except Exception as conn_err:
#         return {"error": f"Failed to connect to ZAP: {str(conn_err)}"}

#     target_url = f"http://{subdomain}"

#     try:
#         # ✅ Spider
#         zap.spider.set_option_max_children(1)
#         zap.spider.set_option_max_depth(1)
#         spider_id = zap.spider.scan(target_url)
#         time.sleep(2)

#         while int(zap.spider.status(spider_id)) < 100:
#             print(f"[ZAP] Spider progress: {zap.spider.status(spider_id)}%")
#             time.sleep(1)

#         # ✅ Active Scan
#         zap.ascan.set_option_thread_per_host(20)
#         zap.ascan.disable_all_scanners()
#         zap.ascan.enable_scanners("40012,40018")  # XSS + SQLi

#         ascan_id = zap.ascan.scan(target_url)
#         time.sleep(2)

#         while int(zap.ascan.status(ascan_id)) < 100:
#             print(f"[ZAP] Active Scan progress: {zap.ascan.status(ascan_id)}%")
#             time.sleep(2)

#         # ✅ Get Alerts
#         alerts = zap.core.alerts(baseurl=target_url)

#         return {
#             "target": subdomain,
#             "zap_version": zap_version,
#             "alerts": alerts
#         }

#     except Exception as scan_err:
#         return {"error": f"ZAP scan failed: {str(scan_err)}"}
import time
import re
from zapv2 import ZAPv2

def run_zap_scan(domain, zap_api_key='changeme', zap_address='127.0.0.1', zap_port='8080'):
    """
    Run OWASP ZAP spider and active scan on the given domain (depth=2).
    Returns a dict of alerts or error messages.
    """

    # Simple domain validation
    def is_valid_domain(d):
        return bool(re.match(r"^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z]{2,})+$", d))

    if not is_valid_domain(domain):
        return {"error": f"Invalid domain: {domain}"}

    target_url = f"http://{domain}"

    try:
        zap = ZAPv2(
            apikey=zap_api_key,
            proxies={
                'http': f'http://{zap_address}:{zap_port}',
                'https': f'http://{zap_address}:{zap_port}',
            }
        )

        print(f"[ZAP] Connected to ZAP (version: {zap.core.version})")
    except Exception as e:
        return {"error": f"ZAP connection failed: {e}"}

    try:
        # Configure Spider
        zap.spider.set_option_max_depth(2)
        zap.spider.set_option_max_children(5)

        print(f"[ZAP] Starting Spider on: {target_url}")
        spider_id = zap.spider.scan(target_url)
        time.sleep(2)

        while int(zap.spider.status(spider_id)) < 100:
            print(f"[ZAP] Spider progress: {zap.spider.status(spider_id)}%")
            time.sleep(1)

        print("[ZAP] Spider completed.")

        # Active Scan
        zap.ascan.set_option_thread_per_host(10)
        zap.ascan.disable_all_scanners()
        zap.ascan.enable_scanners("40012,40018")  # Reflected XSS + SQLi

        print(f"[ZAP] Starting Active Scan on: {target_url}")
        ascan_id = zap.ascan.scan(target_url)
        time.sleep(2)

        while int(zap.ascan.status(ascan_id)) < 100:
            print(f"[ZAP] Active Scan progress: {zap.ascan.status(ascan_id)}%")
            time.sleep(2)

        print("[ZAP] Active Scan completed.")

        alerts = zap.core.alerts(baseurl=target_url)

        return {
            "domain": domain,
            "zap_version": zap.core.version,
            "alerts": alerts
        }

    except Exception as e:
        return {"error": f"Scan failed: {e}"}

result = run_zap_scan("testphp.vulnweb.com", zap_api_key="vmkqcd8hdro5fc0cct2jv7vvr0")
print(result)
