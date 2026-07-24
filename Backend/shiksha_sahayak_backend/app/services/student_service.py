import os
import pickle
import magic
from flask import abort, Response
from app import db
from app.models.student_model import Student
from app.models.school_class_model import SchoolClass
from app.dto.student_dto import StudentDTO

class StudentService:

    # ── CREATE ──────────────────────────────────────────────────────────────
    def create_student(self, student_dto, teacher_id):
        school_class = SchoolClass.query.get(student_dto.classId)

        if not school_class or not any(t.id == teacher_id for t in school_class.teachers):
            abort(403, description=f"Unauthorized: Cannot add student to class {student_dto.classId}")

        student = Student(
            first_name=student_dto.firstName,
            last_name=student_dto.lastName,
            roll_number=student_dto.rollNumber,
            age=int(student_dto.age) if student_dto.age else None,
            parent_name=student_dto.parentName,
            parent_contact=int(student_dto.parentContact) if student_dto.parentContact else None,
            parent_email=student_dto.parentEmail,
            parent_preferred_language=student_dto.parentPreferredLanguage,
            class_id=int(student_dto.classId) if student_dto.classId else None
        )

        db.session.add(student)
        db.session.commit()
        return student

    # ── GET BY ID ────────────────────────────────────────────────────────────
    def get_student_by_id(self, id, teacher_id):
        student = Student.query.join(SchoolClass).filter(
            Student.id == id,
            SchoolClass.teachers.any(id=teacher_id)
        ).first()

        if not student:
            abort(404, description=f"Student not found or unauthorized access.")
        return student

    # ── GET ALL (ISOLATED BY TEACHER) ────────────────────────────────────────
    def get_all_students(self, teacher_id, class_id=None):
        query = Student.query.join(SchoolClass).filter(
            SchoolClass.teachers.any(id=teacher_id)
        )

        if class_id is not None:
            query = query.filter(Student.class_id == class_id)

        return query.all()

    # ── UPDATE ───────────────────────────────────────────────────────────────
    def update_student(self, id, student_dto, teacher_id):
        student = Student.query.join(SchoolClass).filter(
            Student.id == id,
            SchoolClass.teachers.any(id=teacher_id)
        ).first()

        if not student:
            abort(404, description="Student not found or unauthorized.")

        school_class = SchoolClass.query.get(student_dto.classId)
        if not school_class or not any(t.id == teacher_id for t in school_class.teachers):
            abort(403, description="Unauthorized: Cannot move student to an unowned class.")

        student.first_name = student_dto.firstName
        student.last_name = student_dto.lastName
        student.roll_number = student_dto.rollNumber
        student.age = student_dto.age
        student.parent_name = student_dto.parentName
        student.parent_contact = student_dto.parentContact
        student.parent_email = student_dto.parentEmail
        student.parent_preferred_language = student_dto.parentPreferredLanguage
        student.class_id = student_dto.classId

        db.session.commit()
        return student

    # ── DELETE ───────────────────────────────────────────────────────────────
    def delete_student(self, id, teacher_id):
        student = Student.query.join(SchoolClass).filter(
            Student.id == id,
            SchoolClass.teachers.any(id=teacher_id)
        ).first()

        if not student:
            abort(404, description="Student not found or unauthorized.")

        # 🚀 CLEANUP: Remove the AI encoding when a student is deleted!
        student_key = f"{student.first_name} {student.last_name}".strip()
        pkl_path = os.path.join(os.getcwd(), "ai_models", "encodings", f"class_{student.class_id}_encodings.pkl")

        if os.path.exists(pkl_path):
            try:
                with open(pkl_path, "rb") as f:
                    database = pickle.load(f)
                if student_key in database:
                    del database[student_key]
                    with open(pkl_path, "wb") as f:
                        pickle.dump(database, f)
                    print(f"🗑️ AI Encoding removed for {student_key}")
            except Exception as e:
                print(f"⚠️ Warning: Could not remove AI encoding: {str(e)}")

        db.session.delete(student)
        db.session.commit()

    # ── UPLOAD PHOTO (DB ONLY - NO AI) ───────────────────────────────────────
    def upload_student_photo(self, id, file, teacher_id):
        # 🔒 SECURITY: Verify this teacher actually owns this student
        student = Student.query.join(SchoolClass).filter(
            Student.id == id,
            SchoolClass.teachers.any(id=teacher_id)
        ).first()

        if not student:
            abort(404, description="Student not found or unauthorized access.")

        try:
            student.photo = file.read()
            db.session.commit()
            # 🚀 DeepFace Logic completely removed from here!
        except Exception as e:
            db.session.rollback()
            abort(500, description=f"Error uploading photo: {str(e)}")

    # ── GET PHOTO ─────────────────────────────────────────────────────────────
    def get_student_photo(self, id):
        student = Student.query.get(id)
        if not student:
            abort(404, description="Student not found")

        if student.photo is None:
            abort(404, description="No photo found for this student")

        try:
            mime_type = magic.from_buffer(student.photo, mime=True)
            if not mime_type:
                mime_type = "application/octet-stream"
        except Exception:
            mime_type = "application/octet-stream"

        return Response(
            student.photo,
            status=200,
            mimetype=mime_type
        )