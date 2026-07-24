from flask import Blueprint, request, jsonify
from app.auth.jwt_handler import get_email_from_request, jwt_required
from app.services.test_service import generate_test

test_bp = Blueprint("test_bp", __name__)


# 🔒 Generate Test (PROTECTED)
@test_bp.route("/test/generate", methods=["POST"])
@jwt_required
def generate():
    email = get_email_from_request()
    if not email:
        return {"error": "Unauthorized"}, 401

    data = request.get_json()
    response, status = generate_test(data)
    return jsonify(response), status