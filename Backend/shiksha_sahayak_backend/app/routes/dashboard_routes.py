from flask import Blueprint, jsonify
from app.services.dashboard_service import get_dashboard_stats
from app.auth.jwt_handler import jwt_required as token_required, get_teacher_id_from_request

dashboard_bp = Blueprint("dashboard_bp", __name__, url_prefix="/api/dashboard")

@dashboard_bp.route("/stats", methods=["GET"])
@token_required
def dashboard_stats():
    # 🚀 FIXED: Extract teacher ID
    teacher_id = get_teacher_id_from_request()

    # 🚀 FIXED: Pass teacher ID to the service
    data, status = get_dashboard_stats(teacher_id)
    return jsonify(data), status