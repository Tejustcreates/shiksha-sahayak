from datetime import date
from flask import abort
from app import db
from app.models.assignment_model import Assignment
from app.models.school_class_model import SchoolClass

class AssignmentService:

    def create_assignment(self, assignment_dto, teacher_id):
        school_class = SchoolClass.query.get(assignment_dto.classId)

        # 🔒 SECURITY: Verify teacher owns this class
        if not school_class or not any(t.id == teacher_id for t in school_class.teachers):
            abort(403, description=f"Unauthorized: Cannot add assignment to class {assignment_dto.classId}")

        assignment = Assignment(
            title=assignment_dto.title,
            description=assignment_dto.description,
            due_date=date.fromisoformat(assignment_dto.dueDate) if assignment_dto.dueDate else None,
            class_id=assignment_dto.classId
        )

        db.session.add(assignment)
        db.session.commit()
        return assignment

    def get_all_assignments(self, teacher_id):
        # 🔒 SECURITY: Only fetch assignments for classes this teacher owns
        return Assignment.query.join(SchoolClass).filter(
            SchoolClass.teachers.any(id=teacher_id)
        ).all()

    def get_assignment_by_id(self, id, teacher_id):
        assignment = Assignment.query.join(SchoolClass).filter(
            Assignment.id == id,
            SchoolClass.teachers.any(id=teacher_id)
        ).first()

        if not assignment:
            abort(404, description=f"Assignment not found or unauthorized.")
        return assignment

    def get_assignments_by_class(self, class_id, teacher_id):
        school_class = SchoolClass.query.get(class_id)
        if not school_class or not any(t.id == teacher_id for t in school_class.teachers):
            abort(403, description="Unauthorized access to class.")

        return Assignment.query.filter_by(class_id=class_id).all()

    def update_assignment(self, id, assignment_dto, teacher_id):
        assignment = self.get_assignment_by_id(id, teacher_id)

        # Check if they are trying to move it to a class they don't own
        school_class = SchoolClass.query.get(assignment_dto.classId)
        if not school_class or not any(t.id == teacher_id for t in school_class.teachers):
            abort(403, description="Unauthorized: Cannot move assignment to an unowned class.")

        assignment.title = assignment_dto.title
        assignment.description = assignment_dto.description
        assignment.due_date = date.fromisoformat(assignment_dto.dueDate) if assignment_dto.dueDate else None
        assignment.class_id = assignment_dto.classId

        db.session.commit()
        return assignment

    def delete_assignment(self, id, teacher_id):
        assignment = self.get_assignment_by_id(id, teacher_id)
        db.session.delete(assignment)
        db.session.commit()