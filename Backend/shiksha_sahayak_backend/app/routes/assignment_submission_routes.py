from flask import Blueprint, request, jsonify
from app.services.assignment_submission_service import AssignmentSubmissionService
from app.dto.assignment_submission_dto import AssignmentSubmissionDTO
from app.auth.jwt_handler import jwt_required, get_teacher_id_from_request

assignment_submission_bp = Blueprint("assignment_submission", __name__, url_prefix="/api/submissions")
submission_service = AssignmentSubmissionService()

@assignment_submission_bp.route("/submit", methods=["POST"])
@jwt_required
def submit():
    teacher_id = get_teacher_id_from_request()
    data = request.get_json()
    submission_dto = AssignmentSubmissionDTO(data=data)
    created = submission_service.submit_assignment(submission_dto, teacher_id)
    return jsonify(AssignmentSubmissionDTO(submission=created).to_dict()), 200

@assignment_submission_bp.route("/assignment/<int:assignment_id>", methods=["GET"])
@jwt_required
def get_by_assignment(assignment_id):
    teacher_id = get_teacher_id_from_request()
    submissions = submission_service.get_submissions_by_assignment(assignment_id, teacher_id)
    return jsonify([AssignmentSubmissionDTO(submission=s).to_dict() for s in submissions]), 200