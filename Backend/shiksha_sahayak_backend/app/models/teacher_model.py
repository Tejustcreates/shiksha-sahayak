from app import db

class Teacher(db.Model):
    __tablename__ = "teachers"

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    subject_taught = db.Column(db.String(100), nullable=True)
    teaching_experience = db.Column(db.String(100), nullable=True)
    school_name = db.Column(db.String(100), nullable=True)
    role = db.Column(db.String(20), default="teacher")

    # 🚀 NEW PROFILE FIELDS
    phone = db.Column(db.String(20), nullable=True)
    birthdate = db.Column(db.String(20), nullable=True)
    gender = db.Column(db.String(20), nullable=True)
    qualification = db.Column(db.String(100), nullable=True)
    field_of_study = db.Column(db.String(100), nullable=True)
    bio = db.Column(db.Text, nullable=True)

    # ← removed classes relationship for now