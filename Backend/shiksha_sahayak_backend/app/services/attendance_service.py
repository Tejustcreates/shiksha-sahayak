from app import db
from app.models.attendance_model import AttendanceRecord

def mark_attendance(data_list, teacher_id):
    try:
        for data in data_list:
            # Check if an attendance record already exists for this student on this date
            existing = AttendanceRecord.query.filter_by(
                student_id=data.get("studentId"),
                date=data.get("date")
            ).first()

            if existing:
                # Update existing record (e.g. changing from Absent to Present)
                existing.status = data.get("status")
            else:
                # Create a brand new record
                record = AttendanceRecord(
                    date=data.get("date"),
                    status=data.get("status"),
                    student_id=data.get("studentId"),
                    teacher_id=teacher_id,
                    class_id=data.get("classId")
                )
                db.session.add(record)

        db.session.commit()
        return {"message": "Bulk attendance marked successfully"}, 201
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500


def get_attendance_by_student(student_id):
    records = AttendanceRecord.query.filter_by(student_id=student_id).all()
    return [to_dict(r) for r in records], 200


def get_attendance_by_date(date):
    records = AttendanceRecord.query.filter_by(date=date).all()
    return [to_dict(r) for r in records], 200


def get_attendance_by_teacher(teacher_id):
    records = AttendanceRecord.query.filter_by(teacher_id=teacher_id).all()
    return [to_dict(r) for r in records], 200


def to_dict(record):
    return {
        "id": record.id,
        "date": record.date,
        "status": record.status,
        "studentId": record.student_id,
        "teacherId": record.teacher_id,
        "classId": record.class_id
    }


def get_attendance_by_class_and_date(class_id, date):
    records = AttendanceRecord.query.filter_by(class_id=class_id, date=date).all()
    return [to_dict(r) for r in records], 200


def get_class_attendance_history(class_id):
    # Fetch all records for this class
    records = AttendanceRecord.query.filter_by(class_id=class_id).order_by(AttendanceRecord.date.desc()).all()

    # Group them by date
    history_map = {}
    for r in records:
        if r.date not in history_map:
            history_map[r.date] = {"present": 0, "late": 0, "absent": 0}

        if r.status == "PRESENT": history_map[r.date]["present"] += 1
        elif r.status == "LATE": history_map[r.date]["late"] += 1
        elif r.status == "ABSENT": history_map[r.date]["absent"] += 1

    # Convert dictionary to list and sort by newest dates
    history_list = [{"date": k, **v} for k, v in history_map.items()]
    history_list.sort(key=lambda x: x["date"], reverse=True)

    return history_list[:7], 200 # Return just the last 7 days