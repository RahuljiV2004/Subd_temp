
# import subprocess
# from datetime import datetime
# from .db_utils import append_tool_result  # ✅ Import your DB handler

# def run_nikto_scan(target_url, scan_id=None):
#     nikto_cmd = f"perl /mnt/c/Users/rahul/OneDrive/Desktop/Subd_React/nikto/program/nikto.pl -h {target_url}"
#     full_cmd = f"wsl bash -c \"{nikto_cmd}\""

#     print("🚀 Running Nikto...\n")
    
#     try:
#         result = subprocess.run(
#             full_cmd,
#             shell=True,
#             capture_output=True,
#             text=True,
#             timeout=200
#         )

#         output = result.stdout.strip()
#         error_output = result.stderr.strip()
#         full_output = output + ("\n" + error_output if error_output else "")

#         # ✅ Print full output in terminal
#         print("📝 Output:\n", full_output)

#         # ✅ Save to DB
#         if scan_id:
#             append_tool_result(
#                 scan_id=scan_id,
#                 tool_name="nikto",
#                 command=full_cmd,
#                 output=full_output
#             )

#         return full_output
#     except subprocess.TimeoutExpired as e:
#         print("⏱️ Timeout: Process exceeded 200 seconds and was terminated.")
#         if scan_id:
#             append_tool_result(
#                 scan_id=scan_id,
#                 tool_name="testssl",
#                 command=full_cmd,
#                 output="⏱️ Timeout: testssl.sh exceeded 200 seconds and was terminated."
#             )
#         return "Timeout: testssl.sh exceeded 200 seconds and was terminated."

#     except Exception as e:
#         print("❌ Exception running Nikto:", str(e))
#         if scan_id:
#             append_tool_result(
#                 scan_id=scan_id,
#                 tool_name="nikto",
#                 command=full_cmd,
#                 output=str(e)
#             )
#         return str(e)
import subprocess
import time
import threading
import re
import os

ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')

def run_nikto_scan(target_url):
    print("🚀 Running Nikto...")

    # Build Nikto command inside WSL
    nikto_cmd = f"perl /mnt/c/Users/rahul/OneDrive/Desktop/Subd_React/nikto/program/nikto.pl -h {target_url}"
    full_cmd = f"wsl bash -c \"{nikto_cmd}\""

    # Start the WSL process
    process = subprocess.Popen(
        full_cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        shell=True
    )

    def kill_process_after_timeout(proc, timeout):
        time.sleep(timeout)
        if proc.poll() is None:  # Still running
            print("⏱️ Timeout: Killing process...")
            # 🛑 Try to kill all related processes inside WSL
            subprocess.run("wsl pkill -f nikto", shell=True)  # Uses WSL's pkill

    # Start a watchdog thread
    timeout_thread = threading.Thread(target=kill_process_after_timeout, args=(process, 60))
    timeout_thread.start()

    # Wait for the process to complete
    stdout, stderr = process.communicate()

    full_output = stdout + ("\n" + stderr if stderr else "")
    clean_output = ansi_escape.sub('', full_output)

    print("📤 Output:", clean_output)
    return clean_output
