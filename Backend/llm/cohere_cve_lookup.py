
# import cohere
# import os
# import json
# import re
# import requests
# import time
# import json

# # === Set your Cohere API key ===
# API_KEY = "fH3TKMrNFPm9hPIaJImizREeUBYqSzzGcwDO9g5h"

# co = cohere.Client(API_KEY)



# def get_cve_info(tech_stack):
#     if not tech_stack:
#         return []

#     base_url = "https://services.nvd.nist.gov/rest/json/cves/2.0"
    
#     final_results = []
#     total_limit = 10  # Max total CVEs

#     # === Clean function: replace colon with space but keep version ===
#     def clean_tech(tech):
#         return tech.replace(":", " ").strip()

#     for tech in tech_stack:
#         cleaned_tech = clean_tech(tech)

#         try:
#             time.sleep(1.6)  # NVD rate limit
#             params = {
#                 "keywordSearch": cleaned_tech,
#                 "resultsPerPage": 3
#             }

#             response = requests.get(base_url,params=params)
#             print("Fetched")
#             if response.status_code == 200:
#                 data = response.json()
#                 for vuln in data.get("vulnerabilities", []):
#                     if len(final_results) >= total_limit:
#                         break

#                     cve_id = vuln["cve"]["id"]
#                     desc = vuln["cve"]["descriptions"][0]["value"]

#                     # Get severity from CVSS (v3.1 preferred)
#                     severity = "Unknown"
#                     metrics = vuln["cve"].get("metrics", {})
#                     if "cvssMetricV31" in metrics:
#                         severity = metrics["cvssMetricV31"][0].get("cvssData", {}).get("baseSeverity", "Unknown")
#                     elif "cvssMetricV2" in metrics:
#                         severity = metrics["cvssMetricV2"][0].get("baseSeverity", "Unknown")

#                     final_results.append({
#                         "cve": cve_id,
#                         "desc": desc,
#                         "severity": severity
#                     })
#             else:
#                 print(f"⚠️ API error for {cleaned_tech}: {response.status_code}")
#         except Exception as e:
#             print(f"❌ Error fetching CVEs for {cleaned_tech}: {str(e)}")

#         if len(final_results) >= total_limit:
#             break

#     return final_results

# def get_risk_score_and_suggestions(subdomain_data):
#     prompt = f"""
# You are a cybersecurity expert. Based on the following subdomain scan data in JSON format, do three things:

# 1. Give a risk score from 0 (no risk) to 10 (critical).
# 2. Explain briefly why this risk score was given.
# 3. List three actionable security recommendations.

# Respond ONLY in this JSON format:
# {{
#   "risk_score": <int>,
#   "reason": "<brief reason>",
#   "suggestions": ["<tip1>", "<tip2>", "<tip3>"]
# }}

# Subdomain data:
# {subdomain_data}
# """

#     try:
#         response = co.generate(
#             model="command-r-plus",
#             prompt=prompt,
#             max_tokens=300,
#             temperature=0.3,
#             stop_sequences=["```", "\n\n"],
#         )

#         text_output = response.generations[0].text.strip()

#         # Try to parse JSON from the response
#         return json.loads(text_output)

#     except Exception as e:
#         print("⚠️ Error:", e)
#         print("🔎 Raw response:", response.generations[0].text if 'response' in locals() else '')
#         return {
#             "risk_score": -1,
#             "reason": "Failed to get a response from LLM",
#             "suggestions": []
#         }

# def generate_scan_comparison_report(previous_scan, latest_scan, subdomain):
#     prompt = f"""
# Compare the following two scans on the subdomain '{subdomain}' and identify:
# - Key differences in subdomains found and vulnerabilities
# - Positive improvements and new risks
# - Suggestions to mitigate new risks

# Previous Scan:
# - Scan ID: {previous_scan.get("scan_id")}
# - Time: {previous_scan.get("scanned_at")}
# - Subdomains Found: {previous_scan.get("subdomain")}
# - Vulnerabilities: {previous_scan.get("vulnerabilities", [])}

# Latest Scan:
# - Scan ID: {latest_scan.get("scan_id")}
# - Time: {latest_scan.get("scanned_at")}
# - Subdomains Found: {latest_scan.get("subdomain")}
# - Vulnerabilities: {latest_scan.get("vulnerabilities", [])}
# """

#     try:
#         response = co.generate(
#             model="command-r-plus",
#             prompt=prompt,
#             temperature=0.7,
#             max_tokens=700,
#         )
#         return response.generations[0].text.strip()
#     except Exception as e:
#         raise RuntimeError(f"Cohere LLM call failed: {e}")
# # === MAIN ===
# if __name__ == "__main__":
#     tech_stack = ["Apache 2.4.49", "PHP 7.4.3", "WordPress 5.7.1"]

#     cves = get_cve_info(tech_stack)

#     if not cves:
#         print("\n⚠️ No CVEs returned.")
#     else:
#         print("\n✅ Suggested CVEs and Impacts:\n")
#         for item in cves:
#             print(f"- {item['cve']} ({item['severity']}): {item['desc']}")
import os
import json
import time
import re
import requests
from openai import OpenAI

# === Set your OpenAI API key ===
api_key = ""  # Replace securely
client = OpenAI(api_key=api_key)


# === Fetch CVEs from NVD ===
def get_cve_info(tech_stack):
    if not tech_stack:
        return []

    base_url = "https://services.nvd.nist.gov/rest/json/cves/2.0"
    final_results = []
    total_limit = 10

    def clean_tech(tech):
        return tech.replace(":", " ").strip()

    for tech in tech_stack:
        cleaned_tech = clean_tech(tech)

        try:
            time.sleep(1.6)  # Respect NVD rate limit
            params = {
                "keywordSearch": cleaned_tech,
                "resultsPerPage": 3
            }

            response = requests.get(base_url, params=params)
            print("Fetched:", cleaned_tech)
            if response.status_code == 200:
                data = response.json()
                for vuln in data.get("vulnerabilities", []):
                    if len(final_results) >= total_limit:
                        break

                    cve_id = vuln["cve"]["id"]
                    desc = vuln["cve"]["descriptions"][0]["value"]

                    severity = "Unknown"
                    metrics = vuln["cve"].get("metrics", {})
                    if "cvssMetricV31" in metrics:
                        severity = metrics["cvssMetricV31"][0].get("cvssData", {}).get("baseSeverity", "Unknown")
                    elif "cvssMetricV2" in metrics:
                        severity = metrics["cvssMetricV2"][0].get("baseSeverity", "Unknown")

                    final_results.append({
                        "cve": cve_id,
                        "desc": desc,
                        "severity": severity
                    })
            else:
                print(f"⚠️ API error for {cleaned_tech}: {response.status_code}")
        except Exception as e:
            print(f"❌ Error fetching CVEs for {cleaned_tech}: {str(e)}")

        if len(final_results) >= total_limit:
            break

    return final_results


# === Risk Score + Recommendations ===
def get_risk_score_and_suggestions(subdomain_data):
    prompt = f"""
You are a cybersecurity expert evaluating a subdomain based on scan data. Analyze the provided JSON input and perform the following tasks:

1. Assign a **risk score from 0 to 10**:
   - 0 = No risk
   - 10 = Critical risk (e.g., RCEs, exposed admin panels, misconfigured services)

2. Provide a **clear justification**. Mention key risks such as:
   - Vulnerable technologies (e.g., Apache 2.4.49, WordPress 5.7.1)
   - Open ports (e.g., 21, 22, 80, 443, 445)
   - Exposed services (e.g., FTP, SMB, MySQL, MongoDB, WordPress)

3. Suggest **three actionable security recommendations**, such as:
   - Patch outdated software
   - Restrict SSH or SMB to trusted IPs
   - Enable security headers

4. Recommend **three specific security tests** to perform next:
   - If WordPress is detected: suggest `wpscan`
   - If SMB (port 445) is open: suggest `enum4linux` or `smbclient`
   - If port 3306 is open: suggest MySQL `nmap` script or audit config
   - If SSL issues: suggest `sslyze` or `testssl.sh`
   - If Apache exposed: suggest `nikto` or `OWASP ZAP`

Respond ONLY in valid JSON format:
{{
  "risk_score": <int>,
  "reason": "<brief reason>",
  "suggestions": ["<tip1>", "<tip2>", "<tip3>"],
  "tests": ["<test1>", "<test2>", "<test3>"]
}}

Scan data:
{subdomain_data}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=500
        )

        raw = response.choices[0].message.content.strip()
        print("🔎 Raw LLM Response:\n", raw)

        # Extract valid JSON inside code blocks if present
        match = re.search(r"\{[\s\S]*\}", raw)
        if match:
            return json.loads(match.group())
        else:
            raise ValueError("No valid JSON found.")

    except Exception as e:
        print("⚠️ Error:", e)
        return {
            "risk_score": -1,
            "reason": "Failed to get a response",
            "suggestions": [],
            "tests": []
        }


# === Scan Comparison ===
def generate_scan_comparison_report(previous_scan, latest_scan, subdomain):
    prompt = f"""
Compare the following two scans for the subdomain '{subdomain}'. Highlight:
- Key differences in subdomains and vulnerabilities
- Improvements and new risks
- Suggestions to mitigate new risks

Previous Scan:
{json.dumps(previous_scan, indent=2)}

Latest Scan:
{json.dumps(latest_scan, indent=2)}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,
            max_tokens=700
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        raise RuntimeError(f"OpenAI GPT-4o call failed: {e}")


# === MAIN TEST ===
if __name__ == "__main__":
    # Sample tech stack
    tech_stack = ["Apache 2.4.49", "PHP 7.4.3", "WordPress 5.7.1"]
    cves = get_cve_info(tech_stack)

    if not cves:
        print("\n⚠️ No CVEs returned.")
    else:
        print("\n✅ Suggested CVEs and Impacts:\n")
        for item in cves:
            print(f"- {item['cve']} ({item['severity']}): {item['desc']}")

    # Simulated scan input
    sample_scan_data = {
        "subdomain": "dev.example.com",
        "open_ports": [22, 80, 445],
        "technologies": ["Apache 2.4.49", "WordPress 5.7.1"],
        "vulnerabilities": ["CVE-2021-41773"]
    }

    print("\n🔍 Getting risk score...\n")
    result = get_risk_score_and_suggestions(json.dumps(sample_scan_data, indent=2))
    print(json.dumps(result, indent=2))
