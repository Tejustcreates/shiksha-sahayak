from flask import Blueprint, request, jsonify
from app.services.assignment_service import AssignmentService
from app.dto.assignment_dto import AssignmentDTO
from app.auth.jwt_handler import jwt_required, get_teacher_id_from_request

assignment_bp = Blueprint("assignment", __name__, url_prefix="/api/assignments")
assignment_service = AssignmentService()

@assignment_bp.route("/create", methods=["POST"])
@jwt_required
def create_assignment():
    teacher_id = get_teacher_id_from_request()
    data = request.get_json()
    assignment_dto = AssignmentDTO(data=data)
    created = assignment_service.create_assignment(assignment_dto, teacher_id)
    return jsonify(AssignmentDTO(assignment=created).to_dict()), 200

@assignment_bp.route("/getAllAssignments", methods=["GET"])
@jwt_required
def get_all_assignments():
    teacher_id = get_teacher_id_from_request()
    assignments = assignment_service.get_all_assignments(teacher_id)
    return jsonify([AssignmentDTO(assignment=a).to_dict() for a in assignments]), 200

@assignment_bp.route("/<int:id>", methods=["GET"])
@jwt_required
def get_assignment_by_id(id):
    teacher_id = get_teacher_id_from_request()
    assignment = assignment_service.get_assignment_by_id(id, teacher_id)
    return jsonify(AssignmentDTO(assignment=assignment).to_dict()), 200

@assignment_bp.route("/class/<int:class_id>", methods=["GET"])
@jwt_required
def get_assignments_by_class(class_id):
    teacher_id = get_teacher_id_from_request()
    assignments = assignment_service.get_assignments_by_class(class_id, teacher_id)
    return jsonify([AssignmentDTO(assignment=a).to_dict() for a in assignments]), 200

@assignment_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required
def delete_assignment(id):
    teacher_id = get_teacher_id_from_request()
    assignment_service.delete_assignment(id, teacher_id)
    return "", 204

@assignment_bp.route("/<int:id>", methods=["PUT"])
@jwt_required
def update_assignment(id):
    teacher_id = get_teacher_id_from_request()
    data = request.get_json()
    assignment_dto = AssignmentDTO(data=data)
    updated = assignment_service.update_assignment(id, assignment_dto, teacher_id)
    return jsonify(AssignmentDTO(assignment=updated).to_dict()), 200