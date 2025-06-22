
# import subprocess
# import os
# import json
# import datetime

# def run_subfinder_dnsx_httpx_stream(domain, collection):
#     base_dir = os.path.dirname(os.path.abspath(__file__))
#     tools_dir = os.path.join(base_dir, '..', 'tools')

#     suffix = ".exe" if os.name == "nt" else ""

#     subfinder_path = os.path.join(tools_dir, f'subfinder{suffix}')
#     dnsx_path = os.path.join(tools_dir, f'dnsx{suffix}')
#     httpx_path = os.path.join(tools_dir, f'httpx{suffix}')

#     yield log(f"🚀 Starting Subfinder + DNSx + HTTPx scan for: {domain}")
#     print(f"[+] Using: Subfinder={subfinder_path} DNSx={dnsx_path} HTTPx={httpx_path}")

#     try:
#         # ✅ Clear previous data
#         collection.delete_many({})
#         yield log(f"🗑️ Cleared previous records in database.")

#         # ✅ Run Subfinder
#         subfinder_proc = subprocess.run(
#             [subfinder_path, "-d", domain, "-silent"],
#             stdout=subprocess.PIPE,
#             stderr=subprocess.PIPE,
#             text=True,
#             shell=True
#         )

#         if subfinder_proc.returncode != 0:
#             msg = f"❌ Subfinder failed: {subfinder_proc.stderr}"
#             print(msg)
#             yield log(msg, level="error")
#             return

#         subfinder_domains = list(set(subfinder_proc.stdout.strip().splitlines()))
#         yield log(f"✅ Subfinder found {len(subfinder_domains)} domains.")

#         if not subfinder_domains:
#             yield log("⚠️ No domains found by Subfinder.", level="warn")
#             return

#         # ✅ Run DNSx
#         dnsx_proc = subprocess.run(
#             [dnsx_path, "-silent", "-json"],
#             input="\n".join(subfinder_domains),
#             stdout=subprocess.PIPE,
#             stderr=subprocess.PIPE,
#             text=True,
#             shell=True
#         )

#         if dnsx_proc.returncode != 0:
#             msg = f"❌ DNSx failed: {dnsx_proc.stderr}"
#             print(msg)
#             yield log(msg, level="error")
#             return

#         dnsx_lines = dnsx_proc.stdout.strip().splitlines()
#         dnsx_data = {}
#         for idx, line in enumerate(dnsx_lines, 1):
#             try:
#                 entry = json.loads(line)
#                 host = entry.get("host") or entry.get("name")
#                 if host:
#                     dnsx_data[host] = entry
#                     yield log(f"✅ DNSx [{idx}/{len(dnsx_lines)}]: {host}")
#             except Exception as e:
#                 print(f"[!] DNSx parse error: {e}")

#         yield log(f"✅ DNSx validated {len(dnsx_data)} hosts.")

#         if not dnsx_data:
#             yield log("⚠️ No valid hosts after DNSx.", level="warn")
#             return

#         # ✅ Run HTTPx (binary mode)
#         valid_hosts = list(dnsx_data.keys())
#         httpx_proc = subprocess.run(
#             [httpx_path, "-silent", "-json", "-tls-probe"],
#             input="\n".join(valid_hosts).encode('utf-8'),
#             stdout=subprocess.PIPE,
#             stderr=subprocess.PIPE,
#             text=False,
#             shell=True
#         )

#         if httpx_proc.returncode != 0:
#             msg = f"❌ HTTPx failed: {httpx_proc.stderr.decode('utf-8', errors='ignore')}"
#             print(msg)
#             yield log(msg, level="error")
#             return

#         httpx_raw = httpx_proc.stdout.splitlines()
#         httpx_data = {}
#         for idx, line in enumerate(httpx_raw, 1):
#             try:
#                 decoded = line.decode('utf-8', errors='ignore')
#                 entry = json.loads(decoded)
#                 host = entry.get("input") or entry.get("host")
#                 if host:
#                     httpx_data[host] = entry
#                     yield log(f"✅ HTTPx [{idx}/{len(httpx_raw)}]: {host}")
#             except Exception as e:
#                 print(f"[!] HTTPx parse error: {e}")

#         yield log(f"✅ HTTPx processed {len(httpx_data)} hosts.")

#         # ✅ Store + yield each result
#         total_to_store = len(dnsx_data)
#         stored_count = 0

#         for i, dom in enumerate(sorted(dnsx_data.keys()), 1):
#             row = {
#                 "subdomain": dom,
#                 "subfinder_found": dom in subfinder_domains,
#                 "scanned_at": datetime.datetime.utcnow().isoformat()
#             }

#             dnsx_entry = dnsx_data.get(dom)
#             if dnsx_entry:
#                 row.update({f"dnsx_{k}": v for k, v in dnsx_entry.items()})
#                 row.setdefault("dnsx_a", [])

#             httpx_entry = httpx_data.get(dom)
#             if httpx_entry:
#                 for k, v in httpx_entry.items():
#                     if k == "tls" and isinstance(v, dict):
#                         row.update({f"httpx_tls_{subk}": subv for subk, subv in v.items()})
#                     elif k != "tls":
#                         row[f"httpx_{k}"] = v
#                 row.setdefault("httpx_a", [])

#             # Store to DB
#             collection.update_one({"subdomain": dom}, {"$set": row}, upsert=True)
#             stored_count += 1

#             # ✅ 1) Log message
#             yield log(f"✅ Stored [{i}/{total_to_store}]: {dom}")

#             # ✅ 2) Actual result for card
#             yield result(row)

#         yield log(f"🏁 Finished. Total stored: {stored_count}", level="success")

#     except Exception as e:
#         yield log(f"❌ Pipeline failed: {str(e)}", level="error")


# # def log(message, level="info"):
# #     """Format log for SSE"""
# #     return f"data: {json.dumps({ 'type': 'log', 'message': message, 'level': level, 'timestamp': datetime.datetime.utcnow().isoformat() })}\n\n"

# # def result(data):
# #     """Format result for SSE"""
# #     return f"data: {json.dumps(data)}\n\n"
# def log(message, level="info"):
#     """Format log for SSE"""
#     return f"data: {json.dumps({ 'type': 'log', 'message': message, 'level': level, 'timestamp': datetime.datetime.utcnow().isoformat() })}\n\n"

# def result(data):
#     """Format result for SSE"""
#     return f"data: {json.dumps(data)}\n\n"
import subprocess
import os
import json
import datetime


def log(message, level="info"):
    """Format log for SSE"""
    return f"data: {json.dumps({ 'type': 'log', 'message': message, 'level': level, 'timestamp': datetime.datetime.utcnow().isoformat() })}\n\n"

def result(data):
    """Format result for SSE"""
    return f"data: {json.dumps(data)}\n\n"


def run_subfinder_dnsx_httpx_stream(domain, collection):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    tools_dir = os.path.join(base_dir, '..', 'tools')
    suffix = ".exe" if os.name == "nt" else ""

    subfinder = os.path.join(tools_dir, f"subfinder{suffix}")
    dnsx = os.path.join(tools_dir, f"dnsx{suffix}")
    httpx = os.path.join(tools_dir, f"httpx{suffix}")

    yield log(f"🚀 Starting per-subdomain pipeline for: {domain}")

    try:
        # ✅ 1) Subfinder: get all first
        collection.delete_many({})
        yield log("🗑️ Cleared previous data.")

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

        # ✅ 2) For each subdomain: DNSx -> HTTPx -> store
        for i, sub in enumerate(subdomains, 1):
            row = {
                "subdomain": sub,
                "subfinder_found": True,
                "scanned_at": datetime.datetime.utcnow().isoformat()
            }

            # DNSx for single subdomain
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
                # skip HTTPx for non-resolving subdomain
                collection.update_one({"subdomain": sub}, {"$set": row}, upsert=True)
                yield result(row)
                continue

            # HTTPx for single subdomain
            httpx_proc = subprocess.run(
                [httpx, "-silent", "-json", "-tls-probe"],
                input=sub.encode(),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=False,
                shell=True
            )

            if httpx_proc.returncode == 0 and httpx_proc.stdout.strip():
                try:
                    decoded = httpx_proc.stdout.decode(errors='ignore').strip()
                    httpx_entry = json.loads(decoded)
                    for k, v in httpx_entry.items():
                        if k == "tls" and isinstance(v, dict):
                            for subk, subv in v.items():
                                row[f"httpx_tls_{subk}"] = subv
                        elif k != "tls":
                            row[f"httpx_{k}"] = v
                    yield log(f"✅ [{i}/{len(subdomains)}] HTTPx: {sub}")
                except Exception as e:
                    yield log(f"⚠️ [{i}/{len(subdomains)}] HTTPx parse error for {sub}: {str(e)}", "warn")

            # Store merged data
            collection.update_one({"subdomain": sub}, {"$set": row}, upsert=True)
            yield log(f"✅ [{i}/{len(subdomains)}] Stored: {sub}")
            yield result(row)

        yield log(f"🏁 Done. Processed {len(subdomains)} subdomains.", "success")

    except Exception as e:
        yield log(f"❌ Pipeline error: {str(e)}", "error")
