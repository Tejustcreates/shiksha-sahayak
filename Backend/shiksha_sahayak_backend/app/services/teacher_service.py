from app import db
from app.models.teacher_model import Teacher
from app.models.school_class_model import SchoolClass
from app.dto.teacher_dto import (
    TeacherInDTO,
    TeacherOutDTO,
    LoginRequestDTO,
    LoginResponseDTO
)
from app.auth.jwt_handler import create_token
import bcrypt

# 🔹 Register Teacher
def register_teacher(data):
    dto = TeacherInDTO(data)

    # Check if email already exists
    existing_teacher = Teacher.query.filter_by(email=dto.email).first()
    if existing_teacher:
        return {"error": "Email already registered"}, 400

    # Hash password
    hashed_password = bcrypt.hashpw(dto.password.encode("utf-8"), bcrypt.gensalt())

    # Create Teacher object
    teacher = Teacher(
        first_name=dto.first_name,
        last_name=dto.last_name,
        email=dto.email,
        password=hashed_password.decode("utf-8"),
        subject_taught=dto.subject_taught,
        teaching_experience=dto.teaching_experience,
        school_name=dto.school_name,
        role=data.get("role", "teacher")
    )

    # 🚀 FIXED: Generate 5 private classes (Removed 'section' to match your DB model)
    default_grades = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"]
    for grade in default_grades:
        # Create a new, isolated class record using ONLY the 'grade' attribute
        new_class = SchoolClass(grade=grade)
        teacher.classes.append(new_class)

    db.session.add(teacher)
    db.session.commit()

    return TeacherOutDTO(teacher).to_dict(), 201

# 🔹 Login Teacher
def login_teacher(data):
    dto = LoginRequestDTO(data)

    teacher = Teacher.query.filter_by(email=dto.email).first()

    if not teacher:
        return {"error": "Invalid email or password"}, 401

    # Check password
    if not bcrypt.checkpw(dto.password.encode("utf-8"), teacher.password.encode("utf-8")):
        return {"error": "Invalid email or password"}, 401

    # 🚀 THE AUTHENTICATION FIX: Generate JWT token and safely inject the teacher.id
    token = create_token(teacher.email, "admin", teacher.id)

    # Get the base DTO dictionary
    response_data = LoginResponseDTO(token, teacher.id).to_dict()

    # Inject the first name here so React can grab it for the Header
    response_data["firstName"] = teacher.first_name

    return response_data, 200

# 🔹 Get Teacher by ID
def get_teacher_by_id(teacher_id):
    teacher = Teacher.query.get(teacher_id)

    if not teacher:
        return {"error": "Teacher not found"}, 404

    return TeacherOutDTO(teacher).to_dict(), 200

# 🔹 Get All Teachers
def get_all_teachers():
    teachers = Teacher.query.all()
    return [TeacherOutDTO(t).to_dict() for t in teachers], 200

# 🔹 Delete Teacher
def delete_teacher(teacher_id):
    teacher = Teacher.query.get(teacher_id)

    if not teacher:
        return {"error": "Teacher not found"}, 404

    db.session.delete(teacher)
    db.session.commit()

    return {"message": "Teacher deleted successfully"}, 200

# 🔹 Update Teacher
def update_teacher(teacher_id, data):
    teacher = Teacher.query.get(teacher_id)

    if not teacher:
        return {"error": "Teacher not found"}, 404

    teacher.first_name = data.get("firstName", teacher.first_name)
    teacher.last_name = data.get("lastName", teacher.last_name)
    teacher.subject_taught = data.get("subjectTaught", teacher.subject_taught)
    teacher.teaching_experience = data.get("teachingExperience", teacher.teaching_experience)
    teacher.school_name = data.get("schoolName", teacher.school_name)

    db.session.commit()

    return {"message": "Teacher updated successfully"}, 200


# ==========================================
# 🚀 NEW PROFILE FUNCTIONS
# ==========================================

# 🔹 Get Teacher Profile
def get_teacher_profile(email):
    teacher = Teacher.query.filter_by(email=email).first()
    if not teacher:
        return {"error": "Teacher not found"}, 404

    return {
        "firstName": teacher.first_name,
        "lastName": teacher.last_name,
        "email": teacher.email,
        "phone": teacher.phone or "",
        "school": teacher.school_name or "",
        "experience": teacher.teaching_experience or "",
        "birthdate": teacher.birthdate or "",
        "gender": teacher.gender or "",
        "qualification": teacher.qualification or "",
        "fieldOfStudy": teacher.field_of_study or "",
        "bio": teacher.bio or ""
    }, 200

# 🔹 Update Teacher Profile
def update_teacher_profile(email, data):
    teacher = Teacher.query.filter_by(email=email).first()
    if not teacher:
        return {"error": "Teacher not found"}, 404

    # Check if they are updating to an email that belongs to someone else
    new_email = data.get('email')
    if new_email and new_email != teacher.email:
        existing = Teacher.query.filter_by(email=new_email).first()
        if existing:
            return {"error": "Email is already in use by another account"}, 400

    teacher.first_name = data.get('firstName', teacher.first_name)
    teacher.last_name = data.get('lastName', teacher.last_name)
    teacher.email = data.get('email', teacher.email)
    teacher.phone = data.get('phone', teacher.phone)
    teacher.school_name = data.get('school', teacher.school_name)
    teacher.teaching_experience = data.get('experience', teacher.teaching_experience)
    teacher.birthdate = data.get('birthdate', teacher.birthdate)
    teacher.gender = data.get('gender', teacher.gender)
    teacher.qualification = data.get('qualification', teacher.qualification)
    teacher.field_of_study = data.get('fieldOfStudy', teacher.field_of_study)
    teacher.bio = data.get('bio', teacher.bio)

    db.session.commit()
    return {"message": "Profile updated successfully!"}, 200

# 🔹 Change Teacher Password (Using bcrypt!)
def change_teacher_password(email, data):
    teacher = Teacher.query.filter_by(email=email).first()
    if not teacher:
        return {"error": "Teacher not found"}, 404

    current_pass = data.get('current_password')
    new_pass = data.get('new_password')

    if not current_pass or not new_pass:
        return {"error": "Missing password fields"}, 400

    # Verify old password using bcrypt
    if not bcrypt.checkpw(current_pass.encode("utf-8"), teacher.password.encode("utf-8")):
        return {"error": "Incorrect current password"}, 401

    # Hash and save new password
    hashed_password = bcrypt.hashpw(new_pass.encode("utf-8"), bcrypt.gensalt())
    teacher.password = hashed_password.decode("utf-8")
    db.session.commit()

    return {"message": "Password updated successfully"}, 200