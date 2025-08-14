# import subprocess
# import os

# def run_full_pipeline(domain):
#     base_dir = os.path.dirname(os.path.abspath(__file__))
#     tools_dir = os.path.join(base_dir, '..', 'tools')

#     # Use .exe for Windows
#     suffix = ".exe" if os.name == "nt" else ""

#     subfinder_path = os.path.join(tools_dir, f'subfinder{suffix}')
#     dnsx_path = os.path.join(tools_dir, f'dnsx{suffix}')
#     httpx_path = os.path.join(tools_dir, f'httpx{suffix}')
#     jq_path = os.path.join(tools_dir, f'jq{suffix}')  # only if you want jq

#     # Output files
#     subfinder_out = os.path.join(tools_dir, 'subfinder_output.txt')
#     dnsx_out = os.path.join(tools_dir, 'dnsx_output.json')
#     httpx_out = os.path.join(tools_dir, 'httpx_output.json')

#     # Optional: Clean up any previous runs
#     for f in [subfinder_out, dnsx_out, httpx_out]:
#         if os.path.exists(f):
#             os.remove(f)

#     try:
#         print(f"[INFO] Running subfinder on {domain} ...")
#         with open(subfinder_out, 'w') as sf_out:
#             result = subprocess.run(
#                 [subfinder_path, "-d", domain, "-silent"],
#                 stdout=sf_out,
#                 stderr=subprocess.PIPE,
#                 text=True,
#                 shell=True  # Windows-friendly
#             )
#             if result.returncode != 0:
#                 print(f"[ERROR] Subfinder failed: {result.stderr}")
#                 return ""

#         print("[INFO] Running dnsx ...")
#         with open(subfinder_out, 'r') as sf_in, open(dnsx_out, 'w') as dx_out:
#             result = subprocess.run(
#                 [dnsx_path, "-silent", "-json"],
#                 stdin=sf_in,
#                 stdout=dx_out,
#                 stderr=subprocess.PIPE,
#                 text=True,
#                 shell=True
#             )
#             if result.returncode != 0:
#                 print(f"[ERROR] DNSx failed: {result.stderr}")
#                 return ""

#         print("[INFO] Running httpx ...")
#         with open(dnsx_out, 'r') as dx_in, open(httpx_out, 'w') as hx_out:
#             result = subprocess.run(
#                 [httpx_path, "-silent", "-json", "-tls-probe"],
#                 stdin=dx_in,
#                 stdout=hx_out,
#                 stderr=subprocess.PIPE,
#                 text=True,
#                 shell=True
#             )
#             if result.returncode != 0:
#                 print(f"[ERROR] HTTPx failed: {result.stderr}")
#                 return ""

#         print(f"[INFO] Pipeline complete! Final output: {httpx_out}")
#         return httpx_out

#     except Exception as e:
#         print(f"[ERROR] Unexpected error: {e}")
#         return ""

# if __name__ == "__main__":
#     print("[INFO] Running pipeline runner...")
#     run_full_pipeline("iitm.ac.in")
#     pass
import subprocess
import os
import json

def run_full_pipeline(domain):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    tools_dir = os.path.join(base_dir, '..', 'tools')

    # Detect platform: use .exe on Windows
    suffix = ".exe" if os.name == "nt" else ""

    subfinder_path = os.path.join(tools_dir, f'subfinder{suffix}')
    dnsx_path = os.path.join(tools_dir, f'dnsx{suffix}')
    httpx_path = os.path.join(tools_dir, f'httpx{suffix}')

    # Output files
    subfinder_out = os.path.join(tools_dir, 'subfinder_output.txt')
    dnsx_out = os.path.join(tools_dir, 'dnsx_output.json')
    dnsx_valid_out = os.path.join(tools_dir, 'dnsx_valid_hosts.txt')
    httpx_out = os.path.join(tools_dir, 'httpx_output.json')

    # Clean up old files
    for f in [subfinder_out, dnsx_out, dnsx_valid_out, httpx_out]:
        if os.path.exists(f):
            os.remove(f)

    try:
        # 1️⃣ Run Subfinder
        print(f"[INFO] Running subfinder on {domain} ...")
        with open(subfinder_out, 'w') as sf_out:
            result = subprocess.run(
                [subfinder_path, "-d", domain, "-silent"],
                stdout=sf_out,
                stderr=subprocess.PIPE,
                text=True,
                shell=True  # Windows-friendly
            )
            if result.returncode != 0:
                print(f"[ERROR] Subfinder failed: {result.stderr}")
                return ""

        # 2️⃣ Run DNSx on Subfinder output
        print("[INFO] Running dnsx ...")
        with open(subfinder_out, 'r') as sf_in, open(dnsx_out, 'w') as dx_out:
            result = subprocess.run(
                [dnsx_path, "-silent", "-json"],
                stdin=sf_in,
                stdout=dx_out,
                stderr=subprocess.PIPE,
                text=True,
                shell=True
            )
            if result.returncode != 0:
                print(f"[ERROR] DNSx failed: {result.stderr}")
                return ""

        # 3️⃣ Extract valid hosts from DNSx output
        print("[INFO] Extracting valid hosts from DNSx output ...")
        with open(dnsx_out, 'r') as dx_in, open(dnsx_valid_out, 'w') as valid_out:
            for line in dx_in:
                try:
                    j = json.loads(line)
                    if 'host' in j:
                        valid_out.write(j['host'] + '\n')
                except:
                    continue

        # 4️⃣ Run HTTPx on valid hosts only
        print("[INFO] Running httpx ...")
        with open(dnsx_valid_out, 'r') as valid_in, open(httpx_out, 'w') as hx_out:
            result = subprocess.run(
                [httpx_path, "-silent", "-json", "-tls-probe"],
                stdin=valid_in,
                stdout=hx_out,
                stderr=subprocess.PIPE,
                text=True,
                shell=True
            )
            if result.returncode != 0:
                print(f"[ERROR] HTTPx failed: {result.stderr}")
                return ""

        print(f"[✅] Pipeline complete!\n - Subfinder: {subfinder_out}\n - DNSx: {dnsx_out}\n - HTTPx: {httpx_out}")
        return httpx_out

    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        return ""

if __name__ == "__main__":
    print("[INFO] Running pipeline runner...")
    run_full_pipeline("iitm.ac.in")
