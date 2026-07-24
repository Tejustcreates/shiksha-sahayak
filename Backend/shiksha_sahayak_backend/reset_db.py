from app import create_app, db  # 👈 Changed 'app' to 'create_app'
# Import all your models so SQLAlchemy knows they exist before creating tables
from app.models.teacher_model import Teacher
from app.models.school_class_model import SchoolClass
from app.models.student_model import Student
from app.models.assignment_model import Assignment
from app.models.assignment_submission_model import AssignmentSubmission
from app.models.attendance_model import AttendanceRecord

# 👈 Create the app instance here
app = create_app()

with app.app_context():
    print("🔥 Dropping old tables...")
    db.drop_all()

    print("🏗️ Building new tables based on current models...")
    db.create_all()

    print("✅ Database successfully rebuilt! You are ready to go.")