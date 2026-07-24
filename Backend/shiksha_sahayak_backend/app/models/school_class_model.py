from app import db

# Join Table linking teachers and classes
teacher_classes = db.Table('teacher_classes',
    db.Column('teacher_id', db.Integer, db.ForeignKey('teachers.id'), primary_key=True),
    db.Column('class_id', db.Integer, db.ForeignKey('school_classes.id'), primary_key=True)
)

class SchoolClass(db.Model):
    __tablename__ = "school_classes"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    grade = db.Column(db.String(50), nullable=False)
    # ❌ Section column completely removed!

    teachers = db.relationship('Teacher', secondary=teacher_classes, backref=db.backref('classes', lazy='dynamic'))

    def __repr__(self):
        return f"<SchoolClass {self.grade}>"