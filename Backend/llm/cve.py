import requests
import time
import json

def get_cve_info(tech_stack):
    if not tech_stack:
        return []

    base_url = "https://services.nvd.nist.gov/rest/json/cves/2.0"
    final_results = []
    total_limit = 10  # Max total CVEs

    # === Clean function: replace colon with space but keep version ===
    def clean_tech(tech):
        return tech.replace(":", " ").strip()

    for tech in tech_stack:
        cleaned_tech = clean_tech(tech)

        try:
            time.sleep(1.6)  # Respect NVD rate limit (~1.5s/request)
            params = {
                "keywordSearch": cleaned_tech,
                "resultsPerPage": 3
            }

            response = requests.get(base_url, params=params)
            print(f"Fetched CVEs for: {cleaned_tech}")

            if response.status_code == 200:
                data = response.json()
                for vuln in data.get("vulnerabilities", []):
                    if len(final_results) >= total_limit:
                        break

                    cve_id = vuln["cve"]["id"]
                    desc = vuln["cve"]["descriptions"][0]["value"]

                    # Get severity from CVSS (v3.1 preferred)
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

# === Example usage ===
if __name__ == "__main__":
    tech_stack = [
        "Apache:2.4.46",
        "OpenSSL:1.1.1",
        "PostgreSQL:13.3"
    ]

    cve_results = get_cve_info(tech_stack)

    print("\n🔍 CVE Results:")
    print(json.dumps(cve_results, indent=2))
