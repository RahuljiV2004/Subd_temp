import subprocess
import json
import pandas as pd
from bs4 import BeautifulSoup

# ----------------------------
# CONFIG
# ----------------------------

# Paths to tools (edit if needed)
HTTPX_PATH = "httpx.exe"
CURL_PATH = "curl.exe"

# Subdomains to test (replace with yours!)
subdomains = [
    "ee.iitm.ac.in",
    "www.google.com"
]

# ----------------------------
# HELPERS
# ----------------------------

def run_httpx(sub):
    """Run httpx with robust flags"""
    proc = subprocess.run(
        [
            HTTPX_PATH,
            "-silent",
            "-json",
            "-tls-probe",
            "-unsafe",
            "-H", "User-Agent: Mozilla/5.0",
            "-timeout", "15"
        ],
        input=sub.encode(),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=False
    )

    if proc.returncode == 0 and proc.stdout.strip():
        try:
            decoded = proc.stdout.decode(errors='ignore').strip()
            return json.loads(decoded)
        except Exception as e:
            print(f"[!] httpx JSON decode failed for {sub}: {e}")
    return None

def run_curl(sub):
    """Run curl -Ik and parse minimal info"""
    proc = subprocess.run(
        [
            CURL_PATH,
            "-Ik",
            f"https://{sub}"
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    lines = proc.stdout.strip().splitlines()
    result = {}

    for line in lines:
        if line.startswith("HTTP/"):
            result["status_code"] = line.split()[1]
        elif line.lower().startswith("server:"):
            result["server"] = line.split(":", 1)[1].strip()
        elif line.lower().startswith("location:"):
            result["location"] = line.split(":", 1)[1].strip()

    # Optionally, try to fetch page title
    try:
        html_proc = subprocess.run(
            [
                CURL_PATH,
                "-skL",
                f"https://{sub}"
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        soup = BeautifulSoup(html_proc.stdout, 'html.parser')
        title = soup.title.string.strip() if soup.title else ""
        result["title"] = title
    except Exception:
        result["title"] = ""

    return result

# ----------------------------
# MAIN
# ----------------------------

rows = []

for sub in subdomains:
    print(f"🔍 Checking: {sub}")

    entry = {
        "subdomain": sub
    }

    httpx_data = run_httpx(sub)

    if httpx_data:
        print(f"✅ httpx OK: {sub}")
        entry["status_code"] = httpx_data.get("status_code", "")
        entry["server"] = httpx_data.get("server", "")
        entry["location"] = httpx_data.get("location", "")
        entry["title"] = httpx_data.get("title", "")
    else:
        print(f"⚠️ httpx failed, fallback to curl: {sub}")
        curl_data = run_curl(sub)
        entry.update(curl_data)

    rows.append(entry)

# ----------------------------
# SAVE TO EXCEL
# ----------------------------

df = pd.DataFrame(rows)
output_file = "output.xlsx"
df.to_excel(output_file, index=False)
print(f"✅ Results saved to {output_file}")
