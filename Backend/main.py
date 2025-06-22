
from flask import Flask, Response, render_template, jsonify, request, make_response
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
    set_access_cookies,
    unset_jwt_cookies,
    verify_jwt_in_request
)
from utils.subfinder import run_subfinder_dnsx_httpx_stream
from datetime import datetime, timedelta
from zap import run_single_zap_scan
import os
import time
from utils.subfinder_enrich import run_subfinder_and_enrich  # New helper import
from uuid import uuid4
from pymongo import MongoClient
from utils.knockpy_runner import run_knockpy_and_enhance_streaming
from nmap import run_single_nmap_scan
from models import User
from dotenv import load_dotenv
from utils.subfinder_runner import run_subfinder_and_enhance_streaming  # Updated import
load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)


# JWT config
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
# app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=60)
app.config['JWT_TOKEN_LOCATION'] = ["cookies"]
app.config['JWT_COOKIE_CSRF_PROTECT'] = False  # You can enable later if needed

jwt = JWTManager(app)

# MongoDB connection
client = MongoClient('mongodb://localhost:27017/')
db = client['subdomain_scanner']
collection = db['scan_results']
collection_subfinder=db['scan_results_subfinder']
tools_dir = "C:/Users/rahul/OneDrive/Desktop/Subd react/backend/tools"
MXTOOLBOX_API_KEY = "abff5a1e-c212-4048-9095-6184c330bf5a"
DNSDUMPSTER_API_KEY = "b9b1399a665b6fe4d62429fc43b4038435090c5f3659a74e747e831a9d902cf3"
SUBFINDER_PATH = os.path.join(tools_dir, 'subfinder.exe') 
@app.route("/")
def index():
    return render_template("index.html")
@app.route("/resultssubfinder")
@jwt_required()
def resultssubfinder():
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    allowed = user.organization
    print(f"Allowed org: {allowed}")

    stored = collection_subfinder.find_one({}, {"_id": 0})
    if not stored:
        return jsonify({"error": "No stored results"}), 404

    stored_domain = stored.get("domain", "")
    print(f"Stored domain: {stored_domain}")

    if stored_domain.endswith(allowed):
        # ✅ Allowed → return ALL stored results for this scan
        return jsonify(list(collection_subfinder.find({}, {"_id": 0})))
    else:
        # ❌ Domain doesn't match → block
        return jsonify({"error": "Unauthorized"}), 403

# @app.route("/results")
# @jwt_required()
# def results():
#     user_id = get_jwt_identity()
#     user = User.find_by_id(user_id)
#     if not user:
#         return jsonify({"error": "Unauthorized"}), 401
    
#     if user:
#         allowed=user.organization
#         print(allowed)
#         stored=collection.find_one({},{"_id": 0})
#         stored_org=stored.get("domain")
#         if stored_org.endswith(allowed):
#             return jsonify(list(collection.find({}, {"_id": 0})))
@app.route("/results")
@jwt_required()
def results():
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    allowed = user.organization
    print(f"Allowed org: {allowed}")

    stored = collection.find_one({}, {"_id": 0})
    if not stored:
        return jsonify({"error": "No stored results"}), 404

    stored_domain = stored.get("domain", "")
    print(f"Stored domain: {stored_domain}")

    if stored_domain.endswith(allowed):
        # ✅ Allowed → return ALL stored results for this scan
        return jsonify(list(collection.find({}, {"_id": 0})))
    else:
        # ❌ Domain doesn't match → block
        return jsonify({"error": "Unauthorized"}), 403

# @app.route("/results")
# @jwt_required()
# def results():
#     user_id = get_jwt_identity()
#     user = User.find_by_id(user_id)
#     if not user:
#         return jsonify({"error": "Unauthorized"}), 401

#     allowed_suffix = user.organization  # e.g., "snuchennai.edu.in"

#     stored_result = collection.find_one({}, {"_id": 0})

#     if not stored_result:
#         return jsonify({"error": "No results found"}), 404

#     if stored_result.get("domain", "").endswith(allowed_suffix):
#         print("got it")
#         return jsonify(list(collection.find({}, {"_id": 0})))
#     else:
#         return jsonify({"error": "Unauthorized access"}), 403



@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    existing_user = User.find_by_email(email)
    if existing_user:
        print("adsjsdio")

        return jsonify({'error': 'Email already registered'}), 400

    user = User(email=email, password=password)
    user.save()

    # access_token = create_access_token(identity=str(user._id))
    access_token = create_access_token(
    identity=str(user._id),
    additional_claims={"jti": str(uuid4())}
)
    resp = jsonify({
        'message': 'User registered successfully',
        'user': user.to_dict()
    })
    # ✅ Store token in cookie
    set_access_cookies(resp, access_token)
    return resp, 201

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.find_by_email(email)
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401

    user.last_login = datetime.utcnow()
    user.update()

    access_token = create_access_token(identity=str(user._id))
    print(access_token)
    resp = jsonify({
        'message': 'Login successful',
        'user': user.to_dict()
    })
    # ✅ Store token in cookie
    set_access_cookies(resp, access_token)
    return resp, 200

@app.route('/auth/logout', methods=['POST'])
def logout():
    resp = jsonify({'message': 'Logged out'})
    # ✅ Clear the cookie
    unset_jwt_cookies(resp)
    return resp, 200

@app.route('/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user.to_dict())

@app.route("/test")
@jwt_required()
def test():
    return jsonify({"msg": "You are authenticated!"})

# @app.route("/rescan/stream_using_subfinder")
# def rescan_stream_subfinder():
#     # ✅ 1. Verify JWT from cookie
#     verify_jwt_in_request()
#     user_id = get_jwt_identity()
#     user = User.find_by_id(user_id)
#     if not user:
#         return jsonify({'error': 'User not found'}), 404

#     # ✅ 2. Validate domain param
#     domain = request.args.get('domain')
#     if not domain:
#         return jsonify({'error': 'Missing domain parameter'}), 400

#     if not domain.endswith(user.organization):
#         return jsonify({'error': f'You can only scan domains ending with {user.organization}'}), 403

#     # ✅ 3. Streaming generator with heartbeat
#     def generate():
#         yield ": connected\n\n"  # immediate connection ping
#         last_sent = time.time()

#         try:
#             # Start the Subfinder scan generator
#             scan = run_subfinder_and_enhance_streaming(
#                 domain,
#                 collection,
#                 MXTOOLBOX_API_KEY,
#                 DNSDUMPSTER_API_KEY,
#                 SUBFINDER_PATH  # Pass subfinder path
#             )

#             while True:
#                 try:
#                     # Try to get next real result
#                     message = next(scan)
#                     yield f"data: {message}\n\n"
#                     last_sent = time.time()

#                 except StopIteration:
#                     # ✅ End of scan: send a final done marker
#                     yield 'data: {"type":"done","message":"Scan complete"}\n\n'
#                     break

#                 except Exception as e:
#                     # ✅ If scan crashes: send error
#                     yield f'data: {{"type":"error","message":"Subfinder scan error: {str(e)}"}}\n\n'
#                     break

#                 # ✅ Heartbeat: if no data in 10s, send comment
#                 if time.time() - last_sent > 10:
#                     yield ": keep-alive\n\n"
#                     last_sent = time.time()

#                 # ✅ Small sleep avoids busy loop
#                 time.sleep(0.5)

#         except Exception as e:
#             # ✅ Handle initial scan setup errors
#             yield f'data: {{"type":"error","message":"Failed to start Subfinder scan: {str(e)}"}}\n\n'

#     # ✅ 4. Return properly as SSE response
#     return Response(generate(), mimetype="text/event-stream")


@app.route("/rescan/stream_subfinder_dnsx_httpx")
def rescan_stream_subfinder_dnsx_httpx():
    # ✅ 1️⃣ Verify JWT from cookie
    verify_jwt_in_request()
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # ✅ 2️⃣ Validate domain
    domain = request.args.get("domain")
    if not domain:
        return jsonify({"error": "Missing domain parameter"}), 400

    if not domain.endswith(user.organization):
        return jsonify({
            "error": f"You can only scan domains ending with {user.organization}"
        }), 403

    # # ✅ 3️⃣ Streaming SSE generator with heartbeat
    # def generate():
    #     yield ": connected\n\n"  # initial ping for SSE

    #     last_sent = time.time()

    #     try:
    #         scan = run_subfinder_dnsx_httpx_stream(domain, collection_subfinder)

    #         while True:
    #             try:
    #                 message = next(scan)
    #                 yield f"data: {message}\n\n"
    #                 last_sent = time.time()

    #             except StopIteration:
    #                 # ✅ Done!
    #                 yield 'data: {"type":"done","message":"Pipeline complete"}\n\n'
    #                 break

    #             except Exception as e:
    #                 # ✅ Streaming failure
    #                 yield f'data: {{"type":"error","message":"Pipeline error: {str(e)}"}}\n\n'
    #                 break

    #             # ✅ Heartbeat every 10s if no log
    #             if time.time() - last_sent > 10:
    #                 yield ": keep-alive\n\n"
    #                 last_sent = time.time()

    #             time.sleep(0.5)

        # except Exception as e:
    #         # ✅ If the generator fails at startup
    #         yield f'data: {{"type":"error","message":"Could not start pipeline: {str(e)}"}}\n\n'
    def generate():
        yield ": connected\n\n"  # SSE comment/ping

        last_sent = time.time()

        try:
            scan = run_subfinder_dnsx_httpx_stream(domain, collection_subfinder)

            while True:
                try:
                    message = next(scan)
                    # ✅ Add data: exactly once here
                    yield f"data: {message}\n\n"
                    last_sent = time.time()

                except StopIteration:
                    yield 'data: {"type":"done","message":"Pipeline complete"}\n\n'
                    break

                except Exception as e:
                    yield f'data: {{"type":"error","message":"Pipeline error: {str(e)}"}}\n\n'
                    break

                if time.time() - last_sent > 10:
                    yield ": keep-alive\n\n"
                    last_sent = time.time()

                time.sleep(0.5)

        except Exception as e:
            yield f'data: {{"type":"error","message":"Could not start pipeline: {str(e)}"}}\n\n'


    # ✅ 4️⃣ Return SSE response
    return Response(generate(), mimetype="text/event-stream")


@app.route('/api/getPorts', methods=['GET'])
def get_ports():
    domain = request.args.get('subdomain')

    if not domain:
        return jsonify({"error": "Missing 'subdomain' parameter"}), 400

    # Find document with this domain
    doc = collection.find_one({"domain": domain})

    if not doc:
        return jsonify({"error": "No record found for this domain"}), 404

    # ✅ Extract ports from nested nmap field
    open_ports = doc.get("nmap", {}).get("open_ports", [])

    return jsonify({"open_ports": open_ports}), 200

@app.route('/api/getZapAlerts', methods=['GET'])
def get_zap_alerts():
    domain = request.args.get('subdomain')

    if not domain:
        return jsonify({"error": "Missing 'subdomain' parameter"}), 400

    # ✅ Find document with this domain
    doc = collection.find_one({"domain": domain})

    if not doc:
        return jsonify({"error": "No record found for this domain"}), 404

    # ✅ Extract alerts from nested zap field
    alerts = doc.get("zap", {}).get("alerts", [])

    return jsonify({"alerts": alerts}), 200


@app.route('/api/scan_subdomain', methods=['POST'])
def scan_subdomain():
    data = request.json
    if not data or 'subdomain' not in data:
        return jsonify({"error": "Missing 'subdomain' in request body."}), 400

    subdomain = data['subdomain']
    entry = collection.find_one({"domain": subdomain})
    if not entry:
        return jsonify({"error": f"Subdomain '{subdomain}' not found in database."}), 404

    nmap_result = run_single_nmap_scan(subdomain)

    collection.update_one(
        {"_id": entry["_id"]},
        {"$set": {"nmap": nmap_result}}
    )

    return jsonify({ "subdomain": subdomain, "nmap": nmap_result })

@app.route('/api/scan_subdomain_zap', methods=['POST'])
def scan_subdomain_zap():
    data = request.json
    if not data or 'subdomain' not in data:
        return jsonify({"error": "Missing 'subdomain' in request body."}), 400

    subdomain = data['subdomain']
    entry = collection.find_one({"domain": subdomain})
    if not entry:
        return jsonify({"error": f"Subdomain '{subdomain}' not found in database."}), 404

    zap_result = run_single_zap_scan(subdomain)

    collection.update_one(
        {"_id": entry["_id"]},
        {"$set": {"zap": zap_result}}
    )

    return jsonify({ "subdomain": subdomain, "zap": zap_result })

# @app.route("/api/scan_subfinder", methods=['POST'])
# def scan_subdomain_using_subfinder():
#     data = request.json
#     print(data)
#     if not data or 'subdomain' not in data:
#         return jsonify({"error": "Missing 'subdomain' in request body."}), 400

#     subdomain = data['subdomain']

#     print(f"[INFO] Scanning: {subdomain}")
#     results = run_subfinder_and_enrich(subdomain)

#     return jsonify({
#         "tool": "subfinder-dnsx-httpx-enrich",
#         "subdomain": subdomain,
#         "results": results
#     }), 200

@app.route("/rescan/stream")
def rescan_stream():
    # ✅ 1. Verify JWT from cookie
    verify_jwt_in_request()
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # ✅ 2. Validate domain param
    domain = request.args.get('domain')
    if not domain:
        return jsonify({'error': 'Missing domain parameter'}), 400

    if not domain.endswith(user.organization):
   
        return jsonify({'error': f'You can only scan domains ending with {user.organization}'}), 403

    # ✅ 3. Streaming generator with heartbeat
    def generate():
        yield ": connected\n\n"  # immediate connection ping
        last_sent = time.time()

        # Start the actual scan generator
        scan = run_knockpy_and_enhance_streaming(
            domain,
            collection,
            MXTOOLBOX_API_KEY,
            DNSDUMPSTER_API_KEY
        )

        while True:
            try:
                # Try to get next real result
                message = next(scan)
                yield f"data: {message}\n\n"
                last_sent = time.time()

            except StopIteration:
                # ✅ End of scan: send a final done marker
                yield 'data: {"type":"done","message":"Scan complete"}\n\n'
                break

            except Exception as e:
                # ✅ If scan crashes: send error
                yield f'data: {{"type":"error","message":"{str(e)}"}}\n\n'
                break

            # ✅ Heartbeat: if no data in 10s, send comment
            if time.time() - last_sent > 10:
                yield ": keep-alive\n\n"
                last_sent = time.time()

            # ✅ Small sleep avoids busy loop
            time.sleep(1)

    # ✅ 4. Return properly as SSE response
    return Response(generate(), mimetype="text/event-stream")


if __name__ == "__main__":
    app.run(debug=True)
