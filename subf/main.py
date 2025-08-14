from flask import Flask, jsonify, request, render_template, send_file
from flask_cors import CORS
from pymongo import MongoClient
from utils.subfinder_enrich import run_subfinder_and_enrich  # Pipeline helper
from nmap import run_single_nmap_scan  # Optional, for Nmap integration

app = Flask(__name__)
CORS(app)

client = MongoClient("mongodb://localhost:27017/")
db = client["subdomain_db"]
collection = db["iitm_subdomains"]

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/download")
def download_final_json():
    try:
        return send_file("tools/final_data.json", as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/results")
def results():
    return jsonify(list(collection.find({}, {"_id": 0})))

@app.route("/api/scan_subdomain", methods=['POST'])
def scan_subdomain():
    data = request.json
    print(data)
    if not data or 'subdomain' not in data:
        return jsonify({"error": "Missing 'subdomain' in request body."}), 400

    subdomain = data['subdomain']

    print(f"[INFO] Scanning: {subdomain}")
    results = run_subfinder_and_enrich(subdomain)

    # Optional MongoDB integration (uncomment if needed)
    # entry = collection.find_one({"domain": subdomain})
    # if not entry:
    #     collection.insert_one({"domain": subdomain})
    # collection.update_one({"domain": subdomain}, {"$set": {"results": results}})

    # Optional Nmap integration (uncomment if needed)
    # nmap_result = run_single_nmap_scan(subdomain)
    # collection.update_one({"domain": subdomain}, {"$set": {"nmap": nmap_result}})

    return jsonify({
        "tool": "subfinder-dnsx-httpx-enrich",
        "subdomain": subdomain,
        "results": results
        # ,"nmap": nmap_result
    }), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)
  