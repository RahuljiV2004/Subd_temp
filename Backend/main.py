
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
from flask_mail import Mail, Message

# Configure Flask-Mail once:
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = ''
app.config['MAIL_PASSWORD'] = ''
mail = Mail(app)

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

    stored_domain = stored.get("subdomain", "")
    print(f"Stored domain: {stored_domain}")

    if stored_domain.endswith(allowed):
        # ✅ Allowed → return ALL stored results for this scan
        return jsonify(list(collection_subfinder.find({}, {"_id": 0})))
    else:
        # ❌ Domain doesn't match → block
        return jsonify({"error": "Unauthorized"}), 403

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





# @app.route('/auth/register', methods=['POST'])
# def register():
#     data = request.get_json()
#     email = data.get('email')
#     password = data.get('password')

#     if not email or not password:
#         return jsonify({'error': 'Email and password are required'}), 400

#     existing_user = User.find_by_email(email)
#     if existing_user:
#         print("adsjsdio")

#         return jsonify({'error': 'Email already registered'}), 400

#     user = User(email=email, password=password)
#     user.save()

#     # access_token = create_access_token(identity=str(user._id))
#     access_token = create_access_token(
#     identity=str(user._id),
#     additional_claims={"jti": str(uuid4())}
# )
#     resp = jsonify({
#         'message': 'User registered successfully',
#         'user': user.to_dict()
#     })
#     # ✅ Store token in cookie
#     set_access_cookies(resp, access_token)
#     return resp, 201

@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    existing_user = User.find_by_email(email)
    if existing_user:
        return jsonify({'error': 'Email already registered'}), 400

    user = User(email=email, password=password)
    user.save()

    # ✅ Generate OTP and save:
    otp = user.set_otp()

    # # ✅ Send OTP email
    # msg = Message('Verify your email',
    #               sender='youremail@gmail.com',
    #               recipients=[email])
    # msg.body = f'Your OTP is: {otp}. It expires in 10 minutes.'
    # mail.send(msg)
    msg = Message('Verify your email', 
              sender='youremail@gmail.com', 
              recipients=[email])

    # Plain text version
    msg.body = f'Your OTP is: {otp}. It expires in 10 minutes.'

    # HTML version
    msg.html = render_template('email/verification.html', otp=otp)

    mail.send(msg)

    resp = jsonify({
        'message': 'User registered. Please check your email for the OTP to verify your account.',
        'user': user.to_dict()
    })
    return resp, 201

# @app.route('/auth/login', methods=['POST'])
# def login():
#     data = request.get_json()
#     email = data.get('email')
#     password = data.get('password')

#     if not email or not password:
#         return jsonify({'error': 'Email and password are required'}), 400

#     user = User.find_by_email(email)
#     if not user or not user.check_password(password):
#         return jsonify({'error': 'Invalid email or password'}), 401

#     user.last_login = datetime.utcnow()
#     user.update()

#     access_token = create_access_token(identity=str(user._id))
#     print(access_token)
#     resp = jsonify({
#         'message': 'Login successful',
#         'user': user.to_dict()
#     })
#     # ✅ Store token in cookie
#     set_access_cookies(resp, access_token)
#     return resp, 200

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

    # ✅ Block unverified user
    if not user.is_verified:
        return jsonify({'error': 'Please verify your email first.'}), 403

    user.last_login = datetime.utcnow()
    user.update()

    access_token = create_access_token(identity=str(user._id))
    resp = jsonify({
        'message': 'Login successful',
        'user': user.to_dict()
    })
    set_access_cookies(resp, access_token)
    return resp, 200

# @app.route('/auth/verify-otp', methods=['POST'])
# def verify_otp():
#     data = request.get_json()
#     email = data.get('email')
#     otp = data.get('otp')

#     if not email or not otp:
#         return jsonify({'error': 'Email and OTP are required'}), 400

#     user = User.find_by_email(email)
#     if not user:
#         return jsonify({'error': 'User not found'}), 404

#     success, message = user.verify_otp(otp)
#     if not success:
#         return jsonify({'error': message}), 400
    
#     user.last_login = datetime.utcnow()
#     user.update()

#     access_token = create_access_token(identity=str(user._id))
#     resp = jsonify({
#         'message': 'Login successful',
#         'user': user.to_dict()
#     })
#     set_access_cookies(resp, access_token)

#     return jsonify({'message': 'Email verified successfully! You can now log in.'}), 200
@app.route('/auth/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')

    if not email or not otp:
        return jsonify({'error': 'Email and OTP are required'}), 400

    user = User.find_by_email(email)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    success, message = user.verify_otp(otp)
    if not success:
        return jsonify({'error': message}), 400

    # ✅ Optionally update last login timestamp
    user.last_login = datetime.utcnow()
    user.update()

    # ✅ Create JWT and set it in cookie
    access_token = create_access_token(identity=str(user._id))
    resp = jsonify({
        'message': '✅ Email verified and logged in!',
        'user': user.to_dict()
    })
    set_access_cookies(resp, access_token)

    # ✅ Return the SAME response — so cookie is included!
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


@app.route('/api/getPorts_subfinder', methods=['GET'])
def get_ports_subfinder():
    domain = request.args.get('subdomain')

    if not domain:
        return jsonify({"error": "Missing 'subdomain' parameter"}), 400

    # Find document with this domain
    doc = collection_subfinder.find_one({"subdomain": domain})

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

@app.route('/api/scan_subdomain_subfinder', methods=['POST'])
def scan_subdomain_subfinder():
    data = request.json
    if not data or 'subdomain' not in data:
        return jsonify({"error": "Missing 'subdomain' in request body."}), 400

    subdomain = data['subdomain']
    entry = collection_subfinder.find_one({"subdomain": subdomain})
    if not entry:
        return jsonify({"error": f"Subdomain '{subdomain}' not found in database."}), 404

    nmap_result = run_single_nmap_scan(subdomain)

    collection_subfinder.update_one(
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
