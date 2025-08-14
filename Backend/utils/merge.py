# import os
# import json
# import pandas as pd
# from collections import OrderedDict

# def merge_all_tool_data():
#     base_dir = os.path.dirname(__file__)
#     tools_dir = os.path.join(base_dir, '..', 'tools')

#     # File paths
#     subfinder_path = os.path.join(tools_dir, 'subfinder_output.txt')
#     dnsx_path = os.path.join(tools_dir, 'dnsx_output.json')
#     httpx_path = os.path.join(tools_dir, 'httpx_output.json')

#     # Load subfinder
#     with open(subfinder_path, 'r') as f:
#         subfinder_domains = set(line.strip() for line in f if line.strip())

#     # Load dnsx
#     dnsx_data = {}
#     with open(dnsx_path, 'r') as f:
#         for line in f:
#             try:
#                 entry = json.loads(line)
#                 host = entry.get("host") or entry.get("name")
#                 if host:
#                     dnsx_data[host] = entry
#             except:
#                 continue

#     # Load httpx
#     httpx_data = {}
#     with open(httpx_path, 'r') as f:
#         for line in f:
#             try:
#                 entry = json.loads(line)
#                 domain = entry.get("input") or entry.get("host")
#                 if domain:
#                     httpx_data[domain] = entry
#             except:
#                 continue

#     all_domains = sorted(set(subfinder_domains) | set(dnsx_data) | set(httpx_data))
#     merged = []

#     for domain in all_domains:
#         # Filter to only *.iitm.ac.in
#         if not domain.endswith(".iitm.ac.in") and domain != "iitm.ac.in":
#             continue

#         row = OrderedDict()
#         row["subdomain"] = domain
#         row["subfinder_found"] = domain in subfinder_domains

#         # DNSx Fields
#         dnsx_entry = dnsx_data.get(domain)
#         if dnsx_entry:
#             for k, v in dnsx_entry.items():
#                 row[f"dnsx_{k}"] = v

#         # HTTPX Fields
#         httpx_entry = httpx_data.get(domain)
#         if httpx_entry:
#             for k, v in httpx_entry.items():
#                 if k == "tls" and isinstance(v, dict):
#                     for subk, subv in v.items():
#                         row[f"httpx_tls_{subk}"] = subv
#                 elif k != "tls":
#                     row[f"httpx_{k}"] = v

#         merged.append(row)

#     # Save to JSON
#     final_json_path = os.path.join(tools_dir, 'final_data.json')
#     with open(final_json_path, 'w') as f:
#         json.dump(merged, f, indent=2)

#     # Save to Excel
#     final_excel_path = os.path.join(tools_dir, 'final_data.xlsx')
#     df = pd.DataFrame(merged)
#     df.to_excel(final_excel_path, index=False)

#     print(f"[✅] Final structured data saved to:\n - {final_json_path}\n - {final_excel_path}")

# if __name__ == "__main__":
#     merge_all_tool_data()

import os
import json
import pandas as pd
from collections import OrderedDict

def merge_all_tool_data():
    base_dir = os.path.dirname(__file__)
    tools_dir = os.path.join(base_dir, '..', 'tools')

    # File paths
    subfinder_path = os.path.join(tools_dir, 'subfinder_output.txt')
    dnsx_path = os.path.join(tools_dir, 'dnsx_output.json')
    httpx_path = os.path.join(tools_dir, 'httpx_output.json')

    # Load subfinder
    with open(subfinder_path, 'r', encoding='utf-8') as f:
        subfinder_domains = set(line.strip() for line in f if line.strip())

    # Load dnsx
    dnsx_data = {}
    with open(dnsx_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                entry = json.loads(line)
                host = entry.get("host") or entry.get("name")
                if host:
                    dnsx_data[host] = entry
            except:
                continue

    # Load httpx
    httpx_data = {}
    with open(httpx_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                entry = json.loads(line)
                domain = entry.get("input") or entry.get("host")
                if domain:
                    httpx_data[domain] = entry
            except:
                continue

    all_domains = sorted(set(subfinder_domains) | set(dnsx_data) | set(httpx_data))
    merged = []

    for domain in all_domains:
        # Filter to only *.iitm.ac.in
        if not domain.endswith(".iitm.ac.in") and domain != "iitm.ac.in":
            continue

        row = OrderedDict()
        row["subdomain"] = domain
        row["subfinder_found"] = domain in subfinder_domains

        # DNSx Fields
        dnsx_entry = dnsx_data.get(domain)
        if dnsx_entry:
            for k, v in dnsx_entry.items():
                row[f"dnsx_{k}"] = v

        # HTTPX Fields
        httpx_entry = httpx_data.get(domain)
        if httpx_entry:
            for k, v in httpx_entry.items():
                if k == "tls" and isinstance(v, dict):
                    for subk, subv in v.items():
                        row[f"httpx_tls_{subk}"] = subv
                elif k != "tls":
                    row[f"httpx_{k}"] = v

        merged.append(row)

    # Save to JSON
    final_json_path = os.path.join(tools_dir, 'final_data.json')
    with open(final_json_path, 'w', encoding='utf-8') as f:
        json.dump(merged, f, indent=2)

    # Save to Excel
    final_excel_path = os.path.join(tools_dir, 'final_data.xlsx')
    df = pd.DataFrame(merged)
    df.to_excel(final_excel_path, index=False)

    print(f"[✅] Final structured data saved to:\n - {final_json_path}\n - {final_excel_path}")

if __name__ == "__main__":
    merge_all_tool_data()
