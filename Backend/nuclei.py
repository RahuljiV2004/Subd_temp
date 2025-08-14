import subprocess
import os

def run_nuclei_scan(url):
    templates_path = os.path.expanduser("~/.nuclei-templates/")

    command = [
        "nuclei",
        "-u", url,
        "-t", templates_path,
        "-severity", "info,low,medium,high,critical",
        "-tags", "cve,exposure,misconfig,file,ssl",
        "-exclude-tags", "tech,detection,fingerprint",
        "-rate-limit", "150",
        "-timeout", "30",
        "-retries", "2",
        "-c", "50",
        "-ni",
        "-no-color"
    ]

    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)

    results = []
    for line in process.stdout:
        line = line.strip()
        if line:
            results.append(line)
            print(line)  # for live view

    process.wait()
    return results
