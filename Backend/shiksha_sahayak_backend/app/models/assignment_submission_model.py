from app import db
from datetime import datetime

class AssignmentSubmission(db.Model):
    __tablename__ = "assignment_submissions"

    # Primary Key
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # Many-to-One → many submissions = one assignment
    # @ManyToOne @JoinColumn(name = "assignment_id")
    assignment_id = db.Column(db.Integer, db.ForeignKey("assignments.id"), nullable=False)

    # ✅ FIXED: Wrapped 'submissions' in db.backref to add the cascade delete rule
    assignment = db.relationship(
        "Assignment",
        backref=db.backref("submissions", cascade="all, delete-orphan")
    )

    # Many-to-One → many submissions = one student
    # @ManyToOne @JoinColumn(name = "student_id")
    student_id = db.Column(db.Integer, db.ForeignKey("students.id"), nullable=False)
    student = db.relationship("Student", backref="submissions")

    # Submission Details
    # LocalDateTime → Python datetime type
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)

    grade = db.Column(db.String(20), nullable=True)      # e.g. "A+", "85%"
    comment = db.Column(db.String(500), nullable=True)   # completed or not
    file_url = db.Column(db.String(500), nullable=True)  # link to uploaded file