import subprocess

def run_curl_scan(full_curl_command):
    try:
        print(f"📡 Executing in WSL:\n{full_curl_command}\n")
        # Wrap the command to be passed into bash -c
        wsl_command = f"wsl bash -c \"{full_curl_command}\""

        result = subprocess.run(
            wsl_command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=60  # optional timeout
        )

        if result.stdout:
            print("✅ Output:\n", result.stdout)
        if result.stderr:
            print("⚠️ Error:\n", result.stderr)

        return result.stdout + ("\n" + result.stderr if result.stderr else "")

    except subprocess.TimeoutExpired:
        print("⏱️ Timeout: Command took too long.")
    except Exception as e:
        print("❌ Error:", e)

