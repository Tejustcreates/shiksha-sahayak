from app import create_app, db
from app.models.school_class_model import SchoolClass

app = create_app()
with app.app_context():
    # Only 5 grades now!
    grades = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"]

    for grade in grades:
        new_class = SchoolClass(grade=grade)
        db.session.add(new_class)

    db.session.commit()
    print("✅ 5 Classes seeded successfully!")