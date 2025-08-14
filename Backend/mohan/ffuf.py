from flask import Flask, render_template_string, request
import subprocess
import re
import os

app = Flask(__name__)

template = """
<!DOCTYPE html>
<html>
<head>
    <title>FFUF Web GUI</title>
</head>
<body>
    <h2>FFUF Directory Brute-force</h2>
    <form method="post">
        <label for="url">Target URL (no need to add /FUZZ):</label><br>
        <input type="text" id="url" name="url" size="60" value="{{ url or '' }}" required><br><br>
        
        <label for="wordlist">Select Wordlist:</label><br>
        <select id="wordlist" name="wordlist" required>
            {% for path, name in wordlists %}
                <option value="{{ path }}" {% if path == selected_wordlist %}selected{% endif %}>{{ name }}</option>
            {% endfor %}
        </select><br><br>

        <input type="submit" value="Start Scan">
    </form>
    {% if output %}
        <h3>Scan Results:</h3>
        <pre>{{ output }}</pre>
    {% endif %}
</body>
</html>
"""

def get_good_wordlists():
    # Manually define "good" wordlists
    good_lists = [
        ("/usr/share/dirb/wordlists/common.txt", "dirb: common.txt"),
        ("/usr/share/dirb/wordlists/big.txt", "dirb: big.txt"),
        ("/usr/share/dirb/wordlists/small.txt", "dirb: small.txt"),
        ("/usr/share/dirb/wordlists/others/best1050.txt", "dirb others: best1050.txt"),
        ("/usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt", "dirbuster: directory-list-2.3-medium.txt"),
        ("/usr/share/wordlists/dirbuster/directory-list-2.3-small.txt", "dirbuster: directory-list-2.3-small.txt"),
        ("/usr/share/wordlists/wfuzz/general/common.txt", "wfuzz: common.txt"),
        ("/usr/share/wordlists/wfuzz/general/medium.txt", "wfuzz: medium.txt"),
        ("/usr/share/wordlists/wfuzz/general/big.txt", "wfuzz: big.txt"),
    ]

    # Only include files that actually exist
    return [(path, name) for path, name in good_lists if os.path.exists(path)]

@app.route('/', methods=['GET', 'POST'])
def index():
    output = None
    url = None

    wordlists = get_good_wordlists()
    selected_wordlist = wordlists[0][0] if wordlists else None

    if request.method == 'POST':
        url = request.form['url'].strip()
        selected_wordlist = request.form['wordlist']

        # Add scheme if missing
        if not url.startswith("http://") and not url.startswith("https://"):
            url = "http://" + url

        # Append /FUZZ
        target_url = url.rstrip("/") + "/FUZZ"

        match_codes = "200,300-399,403"

        cmd = [
            "ffuf",
            "-w", selected_wordlist,
            "-u", target_url,
            "-mc", match_codes,
            "-t", "200",
            "-ac",
            "-of", "simple"
        ]
        try:
            result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
            raw_output = result.stdout

            # Remove ANSI codes
            ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
            cleaned_output = ansi_escape.sub('', raw_output)

            # Remove empty or progress lines
            cleaned_lines = []
            for line in cleaned_output.splitlines():
                if line.strip() and not line.strip().startswith(":: Progress"):
                    cleaned_lines.append(line)

            output = "\n".join(cleaned_lines)

        except subprocess.CalledProcessError as e:
            output = f"Error running ffuf:\n{e.stderr}\n{e.stdout}"

    return render_template_string(template, output=output, url=url, wordlists=wordlists, selected_wordlist=selected_wordlist)

if __name__ == '__main__':
    app.run(debug=True)