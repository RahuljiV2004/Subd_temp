import subprocess
import os
import json

def run_full_pipeline(domain):
    base_dir = os.path.dirname(__file__)
    tools_dir = os.path.join(base_dir, '..', 'tools')

    # Define binary paths
    subfinder_path = os.path.join(tools_dir, 'subfinder')
    dnsx_path = os.path.join(tools_dir, 'dnsx')
    jq_path = os.path.join(tools_dir, 'jq')

    # Define output file paths
    subfinder_out = os.path.join(tools_dir, 'subfinder_output.txt')
    dnsx_out = os.path.join(tools_dir, 'dnsx_output.json')
    httpx_out = os.path.join(tools_dir, 'httpx_output.json')  # ✅ renamed

    print("[INFO] Running subfinder...")
    with open(subfinder_out, 'w') as sf_out:
        subfinder = subprocess.Popen(
            [subfinder_path, "-d", domain, "-silent"],
            stdout=sf_out
        )
        subfinder.wait()

    print("[INFO] Running dnsx...")
    with open(subfinder_out, 'r') as sf_in, open(dnsx_out, 'w') as dx_out:
        dnsx = subprocess.Popen(
            [dnsx_path, "-silent", "-json"],
            stdin=sf_in,
            stdout=dx_out
        )
        dnsx.wait()

    print("[INFO] Extracting hosts with jq and scanning with httpx...")
    with open(dnsx_out, 'r') as dx_in, open(httpx_out, 'w') as hx_out:
        jq = subprocess.Popen(
            [jq_path, "-r", ".host"],
            stdin=dx_in,
            stdout=subprocess.PIPE
        )

        httpx = subprocess.Popen(
            ["./httpx", "-silent", "-json", "-tls-probe", "-threads", "50", "-timeout", "5"],
            cwd=tools_dir,
            stdin=jq.stdout,
            stdout=hx_out,
            stderr=subprocess.PIPE
        )

        _, stderr = httpx.communicate()

        if httpx.returncode != 0:
            print("[ERROR] httpx subprocess returned non-zero exit status.")
            if stderr:
                print(stderr.decode())

    print(f"[INFO] Pipeline complete. Final output saved to: {httpx_out}")
    return httpx_out


def run_subfinder_and_enrich(domain):
    from utils.pipeline_runner import run_full_pipeline

    final_output = run_full_pipeline(domain)

    enriched = []
    with open(final_output, 'r') as f:
        for line in f:
            if line.strip():
                enriched.append(json.loads(line))
    return enriched


if __name__ == "__main__":
    print("[INFO] Running pipeline runner...")
    # run_full_pipeline("iitm.ac.in")
