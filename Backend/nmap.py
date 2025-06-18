import subprocess
import shutil
import re

def is_valid_domain(domain):
    return bool(re.match(r"^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z]{2,})+$", domain))

def is_valid_ip(ip):
    return bool(re.match(r"^\d{1,3}(\.\d{1,3}){3}$", ip))

def run_single_nmap_scan(subdomain):
    """
    Run nmap on the given subdomain and return result dict.
    """
    if not shutil.which("nmap"):
        return {"error": "Nmap not found in PATH"}

    if not (is_valid_domain(subdomain) or is_valid_ip(subdomain)):
        return {"error": f"Invalid target: {subdomain}"}

    command = ["nmap","--unprivileged", "-Pn", subdomain]
    try:
        result = subprocess.run(command, capture_output=True, text=True)
        output = result.stdout

        open_ports = []
        for line in output.splitlines():
            if "/tcp" in line and "open" in line:
                port = line.split("/")[0]
                open_ports.append(int(port))

        return {
            "target": subdomain,
            "open_ports": open_ports
        }

    except Exception as e:
        return {"error": str(e)}
