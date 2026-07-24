from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate # 👈 1. IMPORT MIGRATE

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)

    from app.config import Config
    app.config.from_object(Config)

    # Allow React to talk to Flask
    CORS(app, origins=app.config["CORS_ORIGINS"])

    db.init_app(app)

    # 👈 2. INITIALIZE MIGRATE HERE
    migrate = Migrate(app, db)

    # 1. Import ALL models in dependency order
    from app.models.teacher_model import Teacher
    from app.models.school_class_model import SchoolClass
    from app.models.student_model import Student
    from app.models.attendance_model import AttendanceRecord
    from app.models.assignment_model import Assignment
    from app.models.assignment_submission_model import AssignmentSubmission

    # 2. Import ALL Blueprints (Routes)
    from app.routes.teacher_routes import teacher_bp
    from app.routes.student_routes import student_bp
    from app.routes.attendance_routes import attendance_bp
    from app.routes.test_routes import test_bp
    from app.routes.ppt_routes import ppt_bp
    from app.routes.school_class_routes import school_class_bp
    from app.routes.assignment_routes import assignment_bp
    from app.routes.assignment_submission_routes import assignment_submission_bp
    from app.routes.dashboard_routes import dashboard_bp
    from app.routes.chatbot_routes import chatbot_bp

    # 3. Register Blueprints
    app.register_blueprint(student_bp)
    app.register_blueprint(assignment_bp)
    app.register_blueprint(assignment_submission_bp)
    app.register_blueprint(school_class_bp)
    app.register_blueprint(ppt_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(chatbot_bp)

    # Existing blueprints with prefix
    app.register_blueprint(teacher_bp, url_prefix="/api")
    app.register_blueprint(test_bp, url_prefix="/api")

    app.register_blueprint(attendance_bp)

    # Initialize DB tables if they don't exist
    with app.app_context():
        db.create_all()

    return app