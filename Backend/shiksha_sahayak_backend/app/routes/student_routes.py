from flask import Blueprint, request, jsonify
from app.services.student_service import StudentService
from app.dto.student_dto import StudentDTO
from app.auth.jwt_handler import jwt_required, get_teacher_id_from_request

student_bp = Blueprint("student", __name__, url_prefix="/api/students")
student_service = StudentService()

# 🔹 POST /api/students/createStudent
@student_bp.route("/createStudent", methods=["POST"])
@jwt_required
def create_student():
    teacher_id = get_teacher_id_from_request()
    data = request.form.to_dict()
    photo = request.files.get("photo")

    student_dto = StudentDTO(data=data)
    created_student = student_service.create_student(student_dto, teacher_id)

    if photo and photo.filename != "":
        # 🚀 FIXED: Pass teacher_id to the photo upload service too
        student_service.upload_student_photo(created_student.id, photo, teacher_id)

    return jsonify(StudentDTO(student=created_student).to_dict()), 201

# 🔹 GET /api/students/getStudentById/<id>
@student_bp.route("/getStudentById/<int:id>", methods=["GET"])
@jwt_required
def get_student_by_id(id):
    teacher_id = get_teacher_id_from_request()
    student = student_service.get_student_by_id(id, teacher_id)
    return jsonify(StudentDTO(student=student).to_dict()), 200

# 🔹 GET /api/students/getAllStudents?classId=<classId>
@student_bp.route("/getAllStudents", methods=["GET"])
@jwt_required
def get_all_students():
    teacher_id = get_teacher_id_from_request()
    class_id = request.args.get("classId", type=int)

    students = student_service.get_all_students(teacher_id, class_id)
    return jsonify([StudentDTO(student=s).to_dict() for s in students]), 200

# 🔹 PUT /api/students/updateStudent/<id>
@student_bp.route("/updateStudent/<int:id>", methods=["PUT"])
@jwt_required
def update_student(id):
    teacher_id = get_teacher_id_from_request()
    data = request.form.to_dict()
    photo = request.files.get("photo")

    student_dto = StudentDTO(data=data)
    updated_student = student_service.update_student(id, student_dto, teacher_id)

    if photo and photo.filename != "":
        # 🚀 FIXED: Pass teacher_id to the photo upload service
        student_service.upload_student_photo(updated_student.id, photo, teacher_id)

    return jsonify(StudentDTO(student=updated_student).to_dict()), 200

# 🔹 DELETE /api/students/deleteStudent/<id>
@student_bp.route("/deleteStudent/<int:id>", methods=["DELETE"])
@jwt_required
def delete_student(id):
    teacher_id = get_teacher_id_from_request()
    student_service.delete_student(id, teacher_id)
    return "", 204

# 🔹 POST /api/students/StudentPhoto/<id>
@student_bp.route("/StudentPhoto/<int:id>", methods=["POST"])
@jwt_required
def upload_photo(id):
    teacher_id = get_teacher_id_from_request()
    file = request.files.get("file")

    if not file or file.filename == "":
        return jsonify({"error": "No file provided"}), 400

    # 🚀 FIXED: Pass teacher_id to verify ownership before uploading
    student_service.upload_student_photo(id, file, teacher_id)
    return jsonify({"message": "Photo uploaded successfully"}), 200

# 🔹 GET /api/students/StudentPhoto/<id>
@student_bp.route("/StudentPhoto/<int:id>", methods=["GET"])
def get_photo(id):
    # Note: Fetching photos is left unprotected so the browser
    # can render <img src="..."> easily without injecting auth headers.
    return student_service.get_student_photo(id)