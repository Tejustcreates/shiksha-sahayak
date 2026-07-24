from flask import Blueprint, request, jsonify
from app.services.school_class_service import SchoolClassService
from app.dto.school_class_dto import SchoolClassDTO
from app.auth.jwt_handler import jwt_required, get_teacher_id_from_request

# We use the base prefix /api/classes for everything
school_class_bp = Blueprint("school_class", __name__, url_prefix="/api/classes")
school_class_service = SchoolClassService()

# 🔹 GET /api/classes/getAllClasses (Detailed list)
@school_class_bp.route("/getAllClasses", methods=["GET"])
@jwt_required
def get_all_school_classes():
    teacher_id = get_teacher_id_from_request()
    classes = school_class_service.get_all_school_classes(teacher_id)
    return jsonify([SchoolClassDTO(school_class=c).to_dict() for c in classes]), 200

# 🔹 GET /api/classes/dropdown (Lightweight list for React dropdown menus)
@school_class_bp.route("/dropdown", methods=["GET"])
@jwt_required
def get_classes_for_dropdown():
    teacher_id = get_teacher_id_from_request()
    classes = school_class_service.get_all_school_classes(teacher_id)

    class_list = [
        {"id": c.id, "grade": c.grade}
        for c in classes
    ]
    return jsonify(class_list), 200

# 🔹 GET /api/classes/getClassById/<id>
@school_class_bp.route("/getClassById/<int:id>", methods=["GET"])
@jwt_required
def get_school_class_by_id(id):
    teacher_id = get_teacher_id_from_request()
    school_class = school_class_service.get_school_class_by_id(id, teacher_id)
    return jsonify(SchoolClassDTO(school_class=school_class).to_dict()), 200

# 🔹 POST /api/classes/createClass
@school_class_bp.route("/createClass", methods=["POST"])
@jwt_required
def create_school_class():
    teacher_id = get_teacher_id_from_request()
    data = request.get_json()
    school_class_dto = SchoolClassDTO(data=data)
    created = school_class_service.create_school_class(school_class_dto, teacher_id)
    return jsonify(SchoolClassDTO(school_class=created).to_dict()), 201

# 🔹 PUT /api/classes/updateClass/<id>
@school_class_bp.route("/updateClass/<int:id>", methods=["PUT"])
@jwt_required
def update_school_class(id):
    teacher_id = get_teacher_id_from_request()
    data = request.get_json()
    school_class_dto = SchoolClassDTO(data=data)
    updated = school_class_service.update_school_class(id, school_class_dto, teacher_id)
    return jsonify(SchoolClassDTO(school_class=updated).to_dict()), 200

# 🔹 DELETE /api/classes/deleteClass/<id>
@school_class_bp.route("/deleteClass/<int:id>", methods=["DELETE"])
@jwt_required
def delete_school_class(id):
    teacher_id = get_teacher_id_from_request()
    school_class_service.delete_school_class(id, teacher_id)
    return "", 204