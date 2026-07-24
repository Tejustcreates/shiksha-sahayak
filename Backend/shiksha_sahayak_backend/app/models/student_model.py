from app import db

class Student(db.Model):
    __tablename__ = "students"

    # Primary Key
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # Student Details
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    roll_number = db.Column(db.String(50), nullable=False)

    age = db.Column(db.Integer, nullable=False)

    # Parent Details
    parent_name = db.Column(db.String(100), nullable=False)
    parent_contact = db.Column(db.BigInteger, nullable=False)
    parent_email = db.Column(db.String(100), nullable=False)
    parent_preferred_language = db.Column(db.String(100), nullable=False)

    # 🔗 Many-to-One → many students=one class
    class_id = db.Column(db.Integer, db.ForeignKey("school_classes.id"), nullable=False)
    school_class = db.relationship("SchoolClass", backref="students")

    # 🔗 One-to-Many → one student=many attendance records
    # attendance_records = db.relationship(
    #     "AttendanceRecord",
    #     backref="student",
    #     lazy=True
    # )

    # Photo (LOB)
    photo = db.Column(db.LargeBinary)