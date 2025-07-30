
# import subprocess
# import re
# from datetime import datetime
# from .db_utils import append_tool_result  # ✅ Your existing DB save logic

# # Regex to match ANSI escape sequences (colors, etc.)
# ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')

# def run_testssl_scan(target_url, scan_id=None):
#     testssl_path = "/mnt/c/Users/rahul/OneDrive/Desktop/Subd_React/testssl.sh-3.3dev/testssl.sh"
    
#     # Pipe 'yes' to automatically confirm if testssl asks for user input
#     cmd = f"yes yes | {testssl_path} --fast {target_url}"
#     full_cmd = f"wsl bash -c \"{cmd}\""

#     print("🚀 Running testssl.sh...\n")

#     try:
#         result = subprocess.run(
#             full_cmd,
#             shell=True,
#             capture_output=True,
#             text=True,
#             timeout=200
#         )

#         # Combine stdout and stderr
#         output = result.stdout
#         error_output = result.stderr
#         full_output = output + ("\n" + error_output if error_output else "")

#         # Strip ANSI colors
#         clean_output = ansi_escape.sub('', full_output)

#         # Print full clean output
#         print("📝 Clean Output:\n", clean_output)

#         # Save to DB
#         if scan_id:
#             append_tool_result(
#                 scan_id=scan_id,
#                 tool_name="testssl",
#                 command=full_cmd,
#                 output=clean_output
#             )

#         return clean_output

#     except Exception as e:
#         print("❌ Exception running testssl.sh:", str(e))
#         if scan_id:
#             append_tool_result(
#                 scan_id=scan_id,
#                 tool_name="testssl",
#                 command=full_cmd,
#                 output=str(e)
#             )
#         return str(e)
# import subprocess
# import re
# from datetime import datetime
# from .db_utils import append_tool_result

# ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')

# def run_testssl_scan(target_url, scan_id=None):
#     testssl_path = "/mnt/c/Users/rahul/OneDrive/Desktop/Subd_React/testssl.sh-3.3dev/testssl.sh"
#     cmd = f"yes yes | {testssl_path} --fast {target_url}"
#     full_cmd = f"wsl bash -c \"{cmd}\""

#     print("🔐 Running testssl.sh...\n")

#     try:
#         result = subprocess.run(
#             full_cmd,
#             shell=True,
#             capture_output=True,
#             text=True,
#             timeout=200  # ✅ Will raise TimeoutExpired if limit crossed
#         )

#         output = result.stdout.strip()
#         error_output = result.stderr.strip()
#         full_output = output + ("\n" + error_output if error_output else "")
#         clean_output = ansi_escape.sub('', full_output)

#         print("📝 Clean Output:\n", clean_output)

#         if scan_id:
#             append_tool_result(
#                 scan_id=scan_id,
#                 tool_name="testssl",
#                 command=full_cmd,
#                 output=clean_output
#             )

#         return clean_output

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
#         print("❌ Exception running testssl.sh:", str(e))
#         if scan_id:
#             append_tool_result(
#                 scan_id=scan_id,
#                 tool_name="testssl",
#                 command=full_cmd,
#                 output=str(e)
#             )
#         return str(e)
import subprocess
import threading
import time
import re

ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')

def run_testssl_scan(target_url, timeout=60):
    print("🔐 Running testssl.sh on:", target_url)

    testssl_path = "/mnt/c/Users/rahul/OneDrive/Desktop/Subd_React/testssl.sh-3.3dev/testssl.sh"
    cmd = f"yes yes | {testssl_path} --fast {target_url}"
    full_cmd = f"wsl bash -c \"{cmd}\""

    process = subprocess.Popen(
        full_cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        shell=True
    )

    def timeout_killer(proc, t):
        time.sleep(t)
        if proc.poll() is None:
            print("⏱️ Timeout: Killing testssl.sh process in WSL...")
            subprocess.run("wsl pkill -f testssl", shell=True)

    killer_thread = threading.Thread(target=timeout_killer, args=(process, timeout))
    killer_thread.start()

    try:
        stdout, stderr = process.communicate()
        killer_thread.join()
    except Exception as e:
        print("❌ Error during execution:", e)
        subprocess.run("wsl pkill -f testssl", shell=True)
        return

    output = stdout + ("\n" + stderr if stderr else "")
    clean_output = ansi_escape.sub('', output)
    print("📤 Output:\n", clean_output)


