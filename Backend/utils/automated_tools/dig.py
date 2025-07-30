import subprocess

def run_dig_custom(command, scan_id=None):
    from .db_utils import append_tool_result  # if you want DB integration

    print(f"📡 Running DIG: {command}")

    try:
        # Prefix the command with WSL
        full_cmd = f"wsl {command}"

        # Execute the dig command
        result = subprocess.run(full_cmd, shell=True, capture_output=True, text=True)

        # Clean output
        output = result.stdout.strip()
        error_output = result.stderr.strip()
        full_output = output + ("\n" + error_output if error_output else "")

        # Print output to terminal
        print("📝 dig Output:\n", full_output or "No output received.")

        # Optionally store in DB
        if scan_id:
            append_tool_result(
                scan_id=scan_id,
                tool_name="dig",
                command=command,
                output=full_output,
            )

        return full_output

    except Exception as e:
        print("❌ Error running dig:", e)
        if scan_id:
            append_tool_result(
                scan_id=scan_id,
                tool_name="dig",
                command=command,
                output=str(e),
            )
        return str(e)
