
import subprocess
import os
import json
import datetime
import uuid
import pytz  # ✅ For timezone support in Python 3.8
from llm.cohere_cve_lookup import get_cve_info,get_risk_score_and_suggestions
# Constant for IST
IST = pytz.timezone("Asia/Kolkata")

def log(message, level="info"):
    ist_time = datetime.datetime.now(IST).isoformat()
    return f"data: {json.dumps({ 'type': 'log', 'message': message, 'level': level, 'timestamp': ist_time })}\n\n"

def result(data):
    return f"data: {json.dumps(data)}\n\n"

def run_subfinder_dnsx_httpx_stream(domain, collection):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    tools_dir = os.path.join(base_dir, '..', 'tools')
    suffix = ".exe" if os.name == "nt" else ""

    subfinder = os.path.join(tools_dir, f"subfinder{suffix}")
    dnsx = os.path.join(tools_dir, f"dnsx{suffix}")
    httpx = os.path.join(tools_dir, f"httpx{suffix}")
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

            if "httpx_url" in row:
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
