import subprocess
import re
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TOOLS_DIR = os.path.join(BASE_DIR, "tools")
FFUF_PATH = os.path.join(TOOLS_DIR, "ffuf")

def get_good_wordlists():
    good_lists = [
        ("wordlists/common.txt", "common.txt"),
        ("wordlists/big.txt", "big.txt"),
        ("wordlists/small.txt", "small.txt"),
        ("wordlists/best1050.txt", "best1050.txt"),
        ("wordlists/directory-list-2.3-medium.txt", "dirbuster medium"),
        ("wordlists/directory-list-2.3-small.txt", "dirbuster small"),
        ("wordlists/wfuzz_common.txt", "wfuzz common"),
        ("wordlists/wfuzz_medium.txt", "wfuzz medium"),
        ("wordlists/wfuzz_big.txt", "wfuzz big"),
    ]

    return [
        (os.path.join(TOOLS_DIR, path), name)
        for path, name in good_lists
        if os.path.exists(os.path.join(TOOLS_DIR, path))
    ]

def run_ffuf_scan(subdomain, wordlist_path):
    # Add scheme if missing
    if not subdomain.startswith("http://") and not subdomain.startswith("https://"):
        subdomain = "http://" + subdomain

    target_url = subdomain.rstrip("/") + "/FUZZ"
    cmd = [
        FFUF_PATH,
        "-w", wordlist_path,
        "-u", target_url,
        "-mc", "200,300-399,403",
        "-t", "200",
        "-ac",
        "-of", "simple"
    ]

    try:
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        raw_output = result.stdout

        ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
        cleaned_output = ansi_escape.sub('', raw_output)

        lines = [
            line for line in cleaned_output.splitlines()
            if line.strip() and not line.strip().startswith(":: Progress")
        ]

        return {
            "success": True,
            "url": subdomain,
            "results": lines
        }

    except subprocess.CalledProcessError as e:
        return {
            "success": False,
            "error": "FFUF scan failed.",
            "stderr": e.stderr,
            "stdout": e.stdout
        }
    except FileNotFoundError:
        return {
            "success": False,
            "error": "FFUF executable not found."
        }
