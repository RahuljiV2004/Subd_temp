from flask import Flask, request, render_template_string
import subprocess
import re

app = Flask(__name__)

HTML_TEMPLATE = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>💥 SQLMap GUI</title>
    <style>
        body {
            font-family: "Segoe UI", sans-serif;
            background: #1e1e2f;
            color: #e1e1e1;
            padding: 20px;
        }
        input, select, button {
            padding: 10px;
            margin: 10px 0;
            font-size: 1rem;
            border-radius: 6px;
            border: none;
        }
        button {
            background: #ff4757;
            color: white;
            font-weight: bold;
            cursor: pointer;
        }
        pre {
            background: #2f2f4f;
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
            max-height: 500px;
        }
    </style>
</head>
<body>
    <h1>💥 SQLMap Injection Tester</h1>
    <form method="POST">
        <label>Target URL:</label><br>
        <input type="text" name="url" value="{{ url or '' }}" required><br>

        {% if not databases %}
            <button type="submit" name="action" value="get_dbs">1️⃣ Get Databases</button>
        {% endif %}

        {% if databases %}
            <label>Select Database:</label><br>
            <select name="selected_db">
                {% for db in databases %}
                    <option value="{{ db }}">{{ db }}</option>
                {% endfor %}
            </select><br>
            <button type="submit" name="action" value="get_tables">2️⃣ Get Tables</button>
        {% endif %}

        {% if tables %}
            <label>Select Table:</label><br>
            <select name="selected_table">
                {% for tbl in tables %}
                    <option value="{{ tbl }}">{{ tbl }}</option>
                {% endfor %}
            </select><br>
            <input type="hidden" name="selected_db" value="{{ selected_db }}">
            <button type="submit" name="action" value="get_columns">3️⃣ Get Columns</button>
        {% endif %}

        {% if columns %}
            <button type="submit" name="action" value="dump_data">4️⃣ Dump Data</button>
            <input type="hidden" name="selected_table" value="{{ selected_table }}">
            <input type="hidden" name="selected_db" value="{{ selected_db }}">
        {% endif %}
    </form>

    {% if output %}
        <h2>🧪 Output:</h2>
        <pre>{{ output }}</pre>
    {% endif %}
</body>
</html>
'''

def run_sqlmap_cmd(args):
    try:
        result = subprocess.run(["wsl"] + args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=300)
        return result.stdout + "\n" + result.stderr
    except subprocess.TimeoutExpired:
        return "⚠️ sqlmap scan timed out."
    except Exception as e:
        return f"⚠️ Error: {str(e)}"

def extract_list_items(output):
    return re.findall(r"\[\*\] ([^\n\r]+)", output)

@app.route("/", methods=["GET", "POST"])
def index():
    output = ""
    url = request.form.get("url")
    action = request.form.get("action")

    databases = []
    tables = []
    columns = []

    selected_db = request.form.get("selected_db")
    selected_table = request.form.get("selected_table")

    if request.method == "POST" and url:
        if action == "get_dbs":
            cmd = ["sqlmap", "-u", url, "--batch", "--random-agent", "--dbs"]
            output = run_sqlmap_cmd(cmd)
            databases = extract_list_items(output)

        elif action == "get_tables" and selected_db:
            cmd = ["sqlmap", "-u", url, "-D", selected_db, "--tables", "--batch", "--random-agent"]
            output = run_sqlmap_cmd(cmd)
            tables = extract_list_items(output)

        elif action == "get_columns" and selected_db and selected_table:
            cmd = ["sqlmap", "-u", url, "-D", selected_db, "-T", selected_table, "--columns", "--batch", "--random-agent"]
            output = run_sqlmap_cmd(cmd)
            columns = extract_list_items(output)

        elif action == "dump_data" and selected_db and selected_table:
            cmd = ["sqlmap", "-u", url, "-D", selected_db, "-T", selected_table, "--dump", "--batch", "--random-agent"]
            output = run_sqlmap_cmd(cmd)

    return render_template_string(
        HTML_TEMPLATE,
        output=output,
        url=url,
        databases=databases,
        tables=tables,
        columns=columns,
        selected_db=selected_db,
        selected_table=selected_table
    )

if __name__ == "__main__":
    app.run(debug=True)

