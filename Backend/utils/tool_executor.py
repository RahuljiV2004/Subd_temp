import subprocess
from .automated_tools.testssl_runner import run_testssl_scan# 👈 import your testssl function
from .automated_tools.nmap_automate import run_nmap_custom
from .automated_tools.wpscan import run_wpscan_custom
from .automated_tools.nikto import run_nikto_scan
from .automated_tools.curl import run_curl_scan
from .automated_tools.dig import run_dig_custom
# --------------------
# TOOL-SPECIFIC FUNCTIONS
# --------------------
def run_nmap(command):
    print("🔍 Running Nmap scan...")
    result = run_nmap_custom(command)
    print(result)

def run_curl(command):
    print("Running Curl:")
    result=run_curl_scan(command)
    print(result)

def run_dig(command):
    print("Running dig:")
    result=run_dig(command)
    print(result)

def run_wpscan(command):
    run_wpscan_custom(command)

def run_nikto(command):
    print("🧪 Running Nikto...")

    import re

    # Extract the URL after -h
    match = re.search(r"-h\s+(\S+)", command)
    if match:
        target_url = match.group(1)
        run_nikto_scan(target_url)
    else:
        print("❌ Could not extract URL from Nikto command.")


def run_testssl(command):
    print("🔐 Running testssl.sh...")
    domain = command.strip().split()[-1]  # Extract domain
    run_testssl_scan(domain)  # Call imported custom function

# --------------------
# TOOL EXECUTOR
# --------------------
def run_command(command):
    tool = command.strip().split()[0]

    if tool == "nmap":
        run_nmap(command)
    elif tool == "curl":
        run_curl(command)
    elif tool == "wpscan":
        run_wpscan(command)
    elif tool == "nikto":
        run_nikto(command)
    elif tool == "testssl.sh":
        run_testssl(command)
    elif tool=="dig":
        run_dig_custom(command)
    else:
        print(f"❌ Unknown tool: {tool}")


