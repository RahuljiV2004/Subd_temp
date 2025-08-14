import subprocess
import json
import os
import argparse
import datetime
import uuid
import shutil

def run_nuclei_scan(targets, templates_path=None):
    suffix = ".exe" if os.name == "nt" else ""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    tools_dir = os.path.join(base_dir, '..', 'tools')
    nuclei_path = os.path.abspath(os.path.join(tools_dir, f"nuclei{suffix}"))

    if not os.path.isfile(nuclei_path):
        raise FileNotFoundError(f"❌ Nuclei binary not found at: {nuclei_path}")

    # Check if template path is valid
    if templates_path and not os.path.exists(templates_path):
        raise FileNotFoundError(f"❌ Template path does not exist: {templates_path}")

    scan_id = datetime.datetime.utcnow().strftime("%Y%m%d%H%M%S") + "_" + str(uuid.uuid4())
    print(f"🚀 Running Nuclei scan: {scan_id}")

    cmd = [nuclei_path, "-silent"]

    if templates_path:
        cmd.extend(["-t", templates_path])

    if isinstance(targets, str):
        targets = [targets]

    results = []

    for target in targets:
        print(f"🔍 Scanning target: {target}")
        try:
            process = subprocess.run(
                cmd + ["-target", target],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                shell=False  # shell=False is safer
            )

            if process.returncode != 0 and not process.stdout.strip():
                print(f"❌ Nuclei error on {target}:\n{process.stderr.strip()}")
                continue

            for line in process.stdout.strip().splitlines():
                result = {
                    "target": target,
                    "scan_id": scan_id,
                    "scanned_at": datetime.datetime.utcnow().isoformat(),
                    "finding": line
                }
                results.append(result)

        except Exception as e:
            print(f"❌ Exception during Nuclei scan for {target}: {e}")

    print(f"✅ Completed. {len(results)} total findings.")
    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run standalone Nuclei scanner.")
    parser.add_argument("-t", "--target", required=True, help="Target domain or comma-separated list")
    parser.add_argument("-tp", "--templates", help="Optional path to Nuclei templates (e.g., cves/, vulnerabilities/, etc.)")

    args = parser.parse_args()
    targets = args.target.split(",")

    findings = run_nuclei_scan(targets, args.templates)

    # Save results
    output_file = f"nuclei_results_{datetime.datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
    with open(output_file, "w") as f:
        json.dump(findings, f, indent=2)

    print(f"📄 Results saved to: {output_file}")
