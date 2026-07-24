from app import db
from datetime import date

class Assignment(db.Model):
    __tablename__ = "assignments"

    # Primary Key
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # Assignment Details
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.String(1000), nullable=True)

    # LocalDate → Python date type
    due_date = db.Column(db.Date, nullable=True)

    # Many-to-One → many assignments = one class
    # @ManyToOne @JoinColumn(name = "class_id")
    class_id = db.Column(db.Integer, db.ForeignKey("school_classes.id"), nullable=False)
    school_class = db.relationship("SchoolClass", backref="assignments")

    # One-to-Many → one assignment = many submissions
    # @OneToMany(mappedBy = "assignment")
    # NOTE: 'submissions' backref will be defined in assignment_submission_model.py
    # so we do NOT define it here