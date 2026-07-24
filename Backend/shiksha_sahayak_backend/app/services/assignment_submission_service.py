from datetime import datetime
from flask import abort
from app import db
from app.models.assignment_submission_model import AssignmentSubmission
from app.models.assignment_model import Assignment
from app.models.school_class_model import SchoolClass
from app.models.student_model import Student

class AssignmentSubmissionService:

    def submit_assignment(self, submission_dto, teacher_id):
        # 🔒 SECURITY: Verify the teacher owns the assignment they are grading
        assignment = Assignment.query.join(SchoolClass).filter(
            Assignment.id == submission_dto.assignmentId,
            SchoolClass.teachers.any(id=teacher_id)
        ).first()

        if not assignment:
            abort(404, description="Assignment not found or unauthorized.")

        student = Student.query.get(submission_dto.studentId)
        if not student:
            abort(404, description="Student not found.")

        submission = AssignmentSubmission(
            assignment_id=submission_dto.assignmentId,
            student_id=submission_dto.studentId,
            grade=submission_dto.grade,
            comment=submission_dto.comment,
            file_url=submission_dto.fileUrl,
            submitted_at=datetime.utcnow()
        )

        db.session.add(submission)
        db.session.commit()
        return submission

    def get_submissions_by_assignment(self, assignment_id, teacher_id):
        # 🔒 SECURITY: Verify the teacher owns the assignment before showing submissions
        assignment = Assignment.query.join(SchoolClass).filter(
            Assignment.id == assignment_id,
            SchoolClass.teachers.any(id=teacher_id)
        ).first()

        if not assignment:
            abort(404, description="Assignment not found or unauthorized.")

        return AssignmentSubmission.query.filter_by(assignment_id=assignment_id).all()