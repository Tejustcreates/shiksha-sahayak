from flask import abort
from app import db
from app.models.school_class_model import SchoolClass
from app.models.teacher_model import Teacher

class SchoolClassService:
    # ── CREATE ──────────────────────────────────────────────────────────────
    def create_school_class(self, class_dto, teacher_id):
        teacher = Teacher.query.get(teacher_id)

        new_class = SchoolClass(
            grade=class_dto.grade
            # Section removed to match DB model
        )

        # 👈 Automatically link the logged-in teacher to this new class
        new_class.teachers.append(teacher)

        db.session.add(new_class)
        db.session.commit()
        return new_class

    # ── GET BY ID ────────────────────────────────────────────────────────────
    def get_school_class_by_id(self, id, teacher_id):
        # 👈 Filter by teacher ownership
        school_class = SchoolClass.query.filter(
            SchoolClass.id == id,
            SchoolClass.teachers.any(id=teacher_id)
        ).first()

        if not school_class:
            abort(404, description=f"SchoolClass not found or unauthorized access.")
        return school_class

    # ── GET ALL ──────────────────────────────────────────────────────────────
    def get_all_school_classes(self, teacher_id):
        # 👈 Only return classes belonging to the logged-in teacher!
        return SchoolClass.query.filter(SchoolClass.teachers.any(id=teacher_id)).all()

    # ── UPDATE ───────────────────────────────────────────────────────────────
    def update_school_class(self, id, class_dto, teacher_id):
        school_class = SchoolClass.query.filter(
            SchoolClass.id == id,
            SchoolClass.teachers.any(id=teacher_id)
        ).first()

        if not school_class:
            abort(404, description=f"SchoolClass not found or unauthorized access.")

        school_class.grade = class_dto.grade
        db.session.commit()
        return school_class

    # ── DELETE ───────────────────────────────────────────────────────────────
    def delete_school_class(self, id, teacher_id):
        school_class = SchoolClass.query.filter(
            SchoolClass.id == id,
            SchoolClass.teachers.any(id=teacher_id)
        ).first()

        if not school_class:
            abort(404, description=f"SchoolClass not found or unauthorized access.")

        db.session.delete(school_class)
        db.session.commit()