import jwt
import os
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify

SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "fallback_secret")
ALGORITHM = "HS256"
EXPIRATION_MINUTES = 60


# 🔹 Create JWT token (UPGRADED: Now requires teacher_id)
def create_token(email, role, teacher_id):
    payload = {
        "sub": email,
        "role": role,
        "teacher_id": teacher_id, # 👈 The secret ingredient for data isolation
        "exp": datetime.utcnow() + timedelta(minutes=EXPIRATION_MINUTES)
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token


# 🔹 Verify JWT token (Unchanged)
def verify_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload

    except jwt.ExpiredSignatureError:
        return None

    except jwt.InvalidTokenError:
        return None


# 🔹 Protect routes with JWT (UPGRADED: Extracts the teacher_id)
def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({
                "success": False,
                "message": "Authorization header missing"
            }), 401

        if not auth_header.startswith("Bearer "):
            return jsonify({
                "success": False,
                "message": "Invalid Authorization format. Use: Bearer <token>"
            }), 401

        token = auth_header.split(" ")[1]
        payload = verify_token(token)

        if not payload:
            return jsonify({
                "success": False,
                "message": "Invalid or expired token"
            }), 401

        # Attach the payload data to the Flask request object
        request.user_email = payload.get("sub")
        request.user_role = payload.get("role")
        request.teacher_id = payload.get("teacher_id") # 👈 Attach it to the request lifecycle

        return f(*args, **kwargs)

    return decorated


# 🔹 Get email from request (Unchanged)
def get_email_from_request():
    return getattr(request, "user_email", None)


# 🔹 Get role from request (Unchanged)
def get_role_from_request():
    return getattr(request, "user_role", None)


# 🔹 NEW: Get teacher_id from request
def get_teacher_id_from_request():
    return getattr(request, "teacher_id", None)