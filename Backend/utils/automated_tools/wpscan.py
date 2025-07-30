# wpscan_runner.py
import subprocess
from .db_utils import append_tool_result

def run_wpscan_custom(command, scan_id=None):
    api_token = "TCzNXzZ6vs7WroS2LhwKqPLckjILVAwXRZXK962qgEw"

    if "--api-token" not in command:
        command += f" --api-token {api_token}"

    if "--random-user-agent" not in command:
        command += " --random-user-agent"


    print("🔒 Running WPScan...")

    try:
        result = subprocess.run(f"wsl {command}", shell=True, capture_output=True, text=True,timeout=200)
        output = result.stdout.strip()
        error_output = result.stderr.strip()
        full_output = output + ("\n" + error_output if error_output else "")

        print("📝 Output:\n", full_output)

        if scan_id:
            append_tool_result(
                scan_id=scan_id,
                tool_name="wpscan",
                command=command,
                output=full_output,
            )

        return full_output

    except Exception as e:
        print("❌ Error running WPScan:", e)
        if scan_id:
            append_tool_result(
                scan_id=scan_id,
                tool_name="wpscan",
                command=command,
                output=str(e)
            )
        return str(e)
