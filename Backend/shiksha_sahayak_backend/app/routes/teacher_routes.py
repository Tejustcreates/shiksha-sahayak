from flask import Blueprint, request, jsonify

from app.services.teacher_service import (
    register_teacher,
    login_teacher,
    get_teacher_by_id,
    get_all_teachers,
    delete_teacher,
    update_teacher,
    get_teacher_profile,        # 🚀 NEW
    update_teacher_profile,     # 🚀 NEW
    change_teacher_password     # 🚀 NEW
)
print("ROUTES FILE LOADED ✅")
from app.auth.jwt_handler import get_email_from_request, get_role_from_request, jwt_required

teacher_bp = Blueprint("teacher_bp", __name__)

# 🔹 Register
@teacher_bp.route("/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    response, status = register_teacher(data)
    return jsonify(response), status

# 🔹 Login
@teacher_bp.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    response, status = login_teacher(data)
    return jsonify(response), status

# 🔒 Get All Teachers (PROTECTED)
@teacher_bp.route("/teachers", methods=["GET"])
@jwt_required
def get_teachers():
    email = get_email_from_request()

    if not email:
        return {"error": "Unauthorized"}, 401

    response, status = get_all_teachers()
    return jsonify(response), status

# 🔹 Get / Update / Delete Teacher by ID
@teacher_bp.route("/teachers/<int:teacher_id>", methods=["GET", "PUT", "DELETE"])
@jwt_required
def teacher_by_id(teacher_id):

    if request.method == "GET":
        response, status = get_teacher_by_id(teacher_id)
        return jsonify(response), status

    email = get_email_from_request()
    if not email:
        return {"error": "Unauthorized"}, 401

    if request.method == "PUT":
        role = get_role_from_request()
        if role != "admin":
            return {"error": "Forbidden: Admin only"}, 403
        data = request.get_json()
        response, status = update_teacher(teacher_id, data)
        return jsonify(response), status

    if request.method == "DELETE":
        response, status = delete_teacher(teacher_id)
        return jsonify(response), status


# ==========================================
# 🚀 NEW PROFILE ROUTES (Used by TeacherProfile.jsx)
# ==========================================

# 🔹 Get or Update Logged-In Teacher's Profile
@teacher_bp.route("/teacher/profile", methods=["GET", "PUT"])
@jwt_required
def profile():
    # Since your auth uses email, we extract the email from the JWT
    email = get_email_from_request()
    if not email:
        return jsonify({"error": "Unauthorized"}), 401

    if request.method == "GET":
        response, status = get_teacher_profile(email)
        return jsonify(response), status

    if request.method == "PUT":
        data = request.get_json()
        response, status = update_teacher_profile(email, data)
        return jsonify(response), status

# 🔹 Change Password
@teacher_bp.route("/teacher/change-password", methods=["PUT"])
@jwt_required
def change_password():
    email = get_email_from_request()
    if not email:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    response, status = change_teacher_password(email, data)
    return jsonify(response), status