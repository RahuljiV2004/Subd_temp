
# import os
# import json
# import time
# import re
# import requests
# from openai import OpenAI



# # === Fetch CVEs from NVD ===
# def get_cve_info(tech_stack):
#     if not tech_stack:
#         return []

#     base_url = "https://services.nvd.nist.gov/rest/json/cves/2.0"
#     final_results = []
#     total_limit = 10

#     def clean_tech(tech):
#         return tech.replace(":", " ").strip()

#     for tech in tech_stack:
#         cleaned_tech = clean_tech(tech)

#         try:
#             time.sleep(1.6)  # Respect NVD rate limit
#             params = {
#                 "keywordSearch": cleaned_tech,
#                 "resultsPerPage": 3
#             }

#             response = requests.get(base_url, params=params)
#             print("Fetched:", cleaned_tech)
#             if response.status_code == 200:
#                 data = response.json()
#                 for vuln in data.get("vulnerabilities", []):
#                     if len(final_results) >= total_limit:
#                         break

#                     cve_id = vuln["cve"]["id"]
#                     desc = vuln["cve"]["descriptions"][0]["value"]

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


# # === Risk Score + Recommendations ===
# def get_risk_score_and_suggestions(subdomain_data):
#     prompt = f"""
# You are a cybersecurity expert evaluating a subdomain based on scan data. Analyze the provided JSON input and perform the following tasks:

# 1. Assign a **risk score from 0 to 10**:
#    - 0 = No risk
#    - 10 = Critical risk (e.g., RCEs, exposed admin panels, misconfigured services)

# 2. Provide a **clear justification**. Mention key risks such as:
#    - Vulnerable technologies (e.g., Apache 2.4.49, WordPress 5.7.1)
#    - Open ports (e.g., 21, 22, 80, 443, 445)
#    - Exposed services (e.g., FTP, SMB, MySQL, MongoDB, WordPress)

# 3. Suggest **three actionable security recommendations**, such as:
#    - Patch outdated software
#    - Restrict SSH or SMB to trusted IPs
#    - Enable security headers

# 4. Recommend **three specific security tests** to perform next:
#    - If WordPress is detected: suggest `wpscan`
#    - If SMB (port 445) is open: suggest `enum4linux` or `smbclient`
#    - If port 3306 is open: suggest MySQL `nmap` script or audit config
#    - If SSL issues: suggest `sslyze` or `testssl.sh`
#    - If Apache exposed: suggest `nikto` or `OWASP ZAP`

# Respond ONLY in valid JSON format:
# {{
#   "risk_score": <int>,
#   "reason": "<brief reason>",
#   "suggestions": ["<tip1>", "<tip2>", "<tip3>"],
#   "tests": ["<test1>", "<test2>", "<test3>"]
# }}

# Scan data:
# {subdomain_data}
# """

#     try:
#         response = client.chat.completions.create(
#             model="gpt-4o",
#             messages=[{"role": "user", "content": prompt}],
#             temperature=0.3,
#             max_tokens=500
#         )

#         raw = response.choices[0].message.content.strip()
#         # print("🔎 Raw LLM Response:\n", raw)

#         # Extract valid JSON inside code blocks if present
#         match = re.search(r"\{[\s\S]*\}", raw)
#         if match:
#             return json.loads(match.group())
#         else:
#             raise ValueError("No valid JSON found.")

#     except Exception as e:
#         print("⚠️ Error:", e)
#         return {
#             "risk_score": -1,
#             "reason": "Failed to get a response",
#             "suggestions": [],
#             "tests": []
#         }


# # === Scan Comparison ===
# def generate_scan_comparison_report(previous_scan, latest_scan, subdomain):
#     prompt = f"""
# Compare the following two scans for the subdomain '{subdomain}'. Highlight:
# - Key differences in subdomains and vulnerabilities
# - Improvements and new risks
# - Suggestions to mitigate new risks

# Previous Scan:
# {json.dumps(previous_scan, indent=2)}

# Latest Scan:
# {json.dumps(latest_scan, indent=2)}
# """

#     try:
#         response = client.chat.completions.create(
#             model="gpt-4o",
#             messages=[{"role": "user", "content": prompt}],
#             temperature=0.6,
#             max_tokens=700
#         )
#         return response.choices[0].message.content.strip()
#     except Exception as e:
#         raise RuntimeError(f"OpenAI GPT-4o call failed: {e}")


# # === MAIN TEST ===
# if __name__ == "__main__":
#     # Sample tech stack
#     tech_stack = ["Apache 2.4.49", "PHP 7.4.3", "WordPress 5.7.1"]
#     cves = get_cve_info(tech_stack)

#     if not cves:
#         print("\n⚠️ No CVEs returned.")
#     else:
#         print("\n✅ Suggested CVEs and Impacts:\n")
#         for item in cves:
#             print(f"- {item['cve']} ({item['severity']}): {item['desc']}")

#     # Simulated scan input
#     sample_scan_data = {
#         "subdomain": "dev.example.com",
#         "open_ports": [22, 80, 445],
#         "technologies": ["Apache 2.4.49", "WordPress 5.7.1"],
#         "vulnerabilities": ["CVE-2021-41773"]
#     }

#     print("\n🔍 Getting risk score...\n")
#     result = get_risk_score_and_suggestions(json.dumps(sample_scan_data, indent=2))
#     print(json.dumps(result, indent=2))

# def get_next_commands(scan_data):
#     import json

#     prompt = f"""
# You are an expert in offensive security automation.

# Based on the following scan results, suggest the next 1 to 3 specific CLI commands a penetration tester should run **strictly using only** the following tools:

# - nikto
# - testssl.sh
# - nmap (without using .nse scripts that require manual installation)
# - curl
# - dig
# - sqlmap
# - wpscan

# Do **not** suggest tools outside this list. Prioritize built-in functionality. The commands must work as-is on most Linux systems or Kali setups without needing extra setup.

# Output format (no JSON, no markdown):

# <command 1>
# <command 2>
# <command 3>

# <short explanation paragraph on why these commands are chosen>

# Scan data:
# {json.dumps(scan_data, indent=2)}
# """

#     try:
#         response = client.chat.completions.create(
#             model="gpt-4o",
#             messages=[{"role": "user", "content": prompt}],
#             temperature=0.2,
#             max_tokens=600
#         )

#         raw = response.choices[0].message.content.strip()

#         # Split lines
#         lines = raw.splitlines()
#         commands = []
#         explanation_lines = []

#         for line in lines:
#             if line.strip() == "":
#                 break
#             commands.append(line.strip())

#         explanation_start = len(commands) + 1  # Skip blank line
#         explanation = "\n".join(lines[explanation_start:]).strip()

#         return {
#             "commands": commands,
#             "explanation": explanation
#         }

#     except Exception as e:
#         print("⚠️ Error parsing commands and explanation:", e)
#         return {
#             "commands": [],
#             "explanation": "No explanation available due to error."
#         }

import os
import json
import time
import re
import requests
import cohere

# === Set your Cohere API key ===
cohere_api_key = ""  # Replace with your actual API key
client = cohere.Client(cohere_api_key)

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



Respond ONLY in valid JSON format:
{{
  "risk_score": <int>,
  "reason": "<brief reason>",
  "suggestions": ["<tip1>", "<tip2>", "<tip3>"],
  
}}

Scan data:
{subdomain_data}
"""

    try:
        response = client.generate(
            model="command-r-plus",
            prompt=prompt,
            temperature=0.3,
            max_tokens=500
        )

        raw = response.generations[0].text.strip()
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
        response = client.generate(
            model="command-r-plus",
            prompt=prompt,
            temperature=0.6,
            max_tokens=700
        )
        return response.generations[0].text.strip()
    except Exception as e:
        raise RuntimeError(f"Cohere call failed: {e}")

# === MAIN TEST ===
if __name__ == "__main__":
    tech_stack = ["Apache 2.4.49", "PHP 7.4.3", "WordPress 5.7.1"]
    cves = get_cve_info(tech_stack)

    if not cves:
        print("\n⚠️ No CVEs returned.")
    else:
        print("\n✅ Suggested CVEs and Impacts:\n")
        for item in cves:
            print(f"- {item['cve']} ({item['severity']}): {item['desc']}")

    sample_scan_data = {
        "subdomain": "dev.example.com",
        "open_ports": [22, 80, 445],
        "technologies": ["Apache 2.4.49", "WordPress 5.7.1"],
        "vulnerabilities": ["CVE-2021-41773"]
    }

    print("\n🔍 Getting risk score...\n")
    result = get_risk_score_and_suggestions(json.dumps(sample_scan_data, indent=2))
    print(json.dumps(result, indent=2))

# === Get Next Commands ===
def get_next_commands(scan_data):
    prompt = f"""
You are an expert in offensive security automation.

You are given scan results with detected technologies, versions, ports, and services.

**Your task:**
Suggest the next 1 to 3 specific CLI commands a penetration tester should run, chosen **strictly from this toolset**:

- nikto
- testssl.sh
- nmap (avoid .nse scripts requiring manual install)
- curl
- dig
- sqlmap
- wpscan=`wpscan --url <target> --enumerate vp`

**Rules:**
- Use only the tools above.  
- Commands must be fully runnable on Linux/Kali without extra installation.  
- For each command, **explicitly reference the finding and the tool that detected it** (e.g., “Nmap found port 3306 open → indicates MySQL service → use sqlmap to test for SQLi”).  
- Justify why each command is relevant to investigate or exploit that finding.  
- Do not suggest unrelated tools or generic scans.  

**Output format (no JSON, no markdown):**

<command 1>  
<command 2>  
<command 3>  

<explanation paragraph that explicitly states:>  
- Which finding triggered each command  
- Which tool reported it  
- Why this command is the next logical step to investigate or exploit


Scan data:
{json.dumps(scan_data, indent=2)}
"""


    try:
        response = client.generate(
            model="command-r-plus",
            prompt=prompt,
            temperature=0.2,
            max_tokens=600
        )

        raw = response.generations[0].text.strip()
        lines = raw.splitlines()
        commands = []
        explanation_lines = []

        for line in lines:
            if line.strip() == "":
                break
            commands.append(line.strip())
        print(commands)
        explanation_start = len(commands) + 1
        explanation = "\n".join(lines[explanation_start:]).strip()
        print(explanation)
        return {
            "commands": commands,
            "explanation": explanation
        }

    except Exception as e:
        print("⚠️ Error parsing commands and explanation:", e)
        return {
            "commands": [],
            "explanation": "No explanation available due to error."
        }
