import subprocess
from Backend.utils.automated_tools.testssl_runner import run_testssl_from_cmd  # 👈 import your testssl function
from Backend.utils.automated_tools.nmap_automate import run_nmap_custom
from Backend.utils.automated_tools.wpscan import run_wpscan_custom
from Backend.utils.automated_tools.nikto import run_nikto_scan
# --------------------
# TOOL-SPECIFIC FUNCTIONS
# --------------------
def run_nmap(command):
    print("🔍 Running Nmap scan...")
    result = run_nmap_custom(cmd)
    print(result)

def run_wpscan(command):
    run_wpscan_custom(command)

def run_nikto(command):
    print("🧪 Running Nikto...")
    run_nikto_scan("https://law.snuchennai.edu.in")

def run_testssl(command):
    print("🔐 Running testssl.sh...")
    domain = command.strip().split()[-1]  # Extract domain
    run_testssl_from_cmd(domain)  # Call imported custom function

# --------------------
# TOOL EXECUTOR
# --------------------
def run_command(command):
    tool = command.strip().split()[0]

    if tool == "nmap":
        run_nmap(command)
    elif tool == "sqlmap":
        run_sqlmap(command)
    elif tool == "wpscan":
        run_wpscan(command)
    elif tool == "nikto":
        run_nikto(command)
    elif tool == "testssl.sh":
        run_testssl(command)
    else:
        print(f"❌ Unknown tool: {tool}")

# --------------------
# TEST INPUT
# --------------------
commands = [
    "testssl.sh https://example.com",
    "nmap -sV -p 80 asr.iitm.ac.in",
    "wpscan --url https://law.snuchennai.edu.in --enumerate vp",
    "nikto -h https://example.com"
]

for cmd in commands:
    print(cmd)
    run_command(cmd)
