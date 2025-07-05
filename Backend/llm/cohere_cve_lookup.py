
import cohere
import os
import json
import re

# === Set your Cohere API key ===
API_KEY = "fH3TKMrNFPm9hPIaJImizREeUBYqSzzGcwDO9g5h"

co = cohere.Client(API_KEY)

def get_cve_info(tech_stack):
    if not tech_stack:
        return []

    prompt = f"""You are a cybersecurity assistant.

For each technology in the following list, return up to 3 known CVEs per tech (max 10 total). Each item must contain:
1. CVE ID
2. Short description
3. Severity (Low/Medium/High)

Tech stack:
{', '.join(tech_stack)}

Respond ONLY in JSON list format like this:
[
  {{
    "cve": "CVE-2021-41773",
    "desc": "Apache Path Traversal in version 2.4.49",
    "severity": "High"
  }}
]
"""

    try:
        response = co.generate(
            model="command-r-plus",
            prompt=prompt,
            max_tokens=700,  # increased token limit
            temperature=0.3
        )

        raw_output = response.generations[0].text.strip()
        print("\n🔎 Raw Cohere Output:\n", raw_output)

        # === Extract all individual JSON objects within the array ===
        json_items = re.findall(r'{[^{}]+}', raw_output)

        valid_cves = []
        for item in json_items:
            try:
                fixed_item = item + "}" if not item.strip().endswith("}") else item
                valid_cves.append(json.loads(fixed_item))
            except:
                continue

        return valid_cves

    except Exception as e:
        print(f"\n❌ Error parsing Cohere response: {e}")
        return []

def get_risk_score_and_suggestions(subdomain_data):
    prompt = f"""
You are a cybersecurity expert. Based on the following subdomain scan data in JSON format, do three things:

1. Give a risk score from 0 (no risk) to 10 (critical).
2. Explain briefly why this risk score was given.
3. List three actionable security recommendations.

Respond ONLY in this JSON format:
{{
  "risk_score": <int>,
  "reason": "<brief reason>",
  "suggestions": ["<tip1>", "<tip2>", "<tip3>"]
}}

Subdomain data:
{subdomain_data}
"""

    try:
        response = co.generate(
            model="command-r-plus",
            prompt=prompt,
            max_tokens=300,
            temperature=0.3,
            stop_sequences=["```", "\n\n"],
        )

        text_output = response.generations[0].text.strip()

        # Try to parse JSON from the response
        return json.loads(text_output)

    except Exception as e:
        print("⚠️ Error:", e)
        print("🔎 Raw response:", response.generations[0].text if 'response' in locals() else '')
        return {
            "risk_score": -1,
            "reason": "Failed to get a response from LLM",
            "suggestions": []
        }

def generate_scan_comparison_report(previous_scan, latest_scan, subdomain):
    prompt = f"""
Compare the following two scans on the subdomain '{subdomain}' and identify:
- Key differences in subdomains found and vulnerabilities
- Positive improvements and new risks
- Suggestions to mitigate new risks

Previous Scan:
- Scan ID: {previous_scan.get("scan_id")}
- Time: {previous_scan.get("scanned_at")}
- Subdomains Found: {previous_scan.get("subdomain")}
- Vulnerabilities: {previous_scan.get("vulnerabilities", [])}

Latest Scan:
- Scan ID: {latest_scan.get("scan_id")}
- Time: {latest_scan.get("scanned_at")}
- Subdomains Found: {latest_scan.get("subdomain")}
- Vulnerabilities: {latest_scan.get("vulnerabilities", [])}
"""

    try:
        response = co.generate(
            model="command-r-plus",
            prompt=prompt,
            temperature=0.7,
            max_tokens=700,
        )
        return response.generations[0].text.strip()
    except Exception as e:
        raise RuntimeError(f"Cohere LLM call failed: {e}")
# === MAIN ===
if __name__ == "__main__":
    tech_stack = ["Apache 2.4.49", "PHP 7.4.3", "WordPress 5.7.1"]

    cves = get_cve_info(tech_stack)

    if not cves:
        print("\n⚠️ No CVEs returned.")
    else:
        print("\n✅ Suggested CVEs and Impacts:\n")
        for item in cves:
            print(f"- {item['cve']} ({item['severity']}): {item['desc']}")
