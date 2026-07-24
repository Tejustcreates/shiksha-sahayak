from datetime import date, timedelta
from app.models.student_model import Student
from app.models.assignment_model import Assignment
from app.models.attendance_model import AttendanceRecord
from app.models.school_class_model import SchoolClass

def get_dashboard_stats(teacher_id): # 👈 ADDED teacher_id
    try:
        # 1. Calculate Top Stat Cards (🔒 ISOLATED BY TEACHER)
        total_classes = SchoolClass.query.filter(
            SchoolClass.teachers.any(id=teacher_id)
        ).count()

        total_students = Student.query.join(SchoolClass).filter(
            SchoolClass.teachers.any(id=teacher_id)
        ).count()

        active_assignments = Assignment.query.join(SchoolClass).filter(
            SchoolClass.teachers.any(id=teacher_id)
        ).count()

        # Get a list of class IDs owned by this teacher to filter attendance
        teacher_classes = SchoolClass.query.filter(SchoolClass.teachers.any(id=teacher_id)).all()
        teacher_class_ids = [c.id for c in teacher_classes]

        # 2. Calculate Today's Attendance Rate (🔒 ISOLATED BY TEACHER)
        today = date.today()
        today_str = today.isoformat()

        if not teacher_class_ids:
            todays_records = []
        else:
            todays_records = AttendanceRecord.query.filter(
                AttendanceRecord.date == today_str,
                AttendanceRecord.class_id.in_(teacher_class_ids)
            ).all()

        if todays_records and len(todays_records) > 0:
            present_count = sum(1 for r in todays_records if r.status in ["PRESENT", "LATE"])
            attendance_rate = int((present_count / len(todays_records)) * 100)
        else:
            attendance_rate = 0

        # 3. Calculate Weekly Attendance for the Bar Chart (🔒 ISOLATED BY TEACHER)
        attendance_data = []

        for i in range(4, -1, -1):
            target_day = today - timedelta(days=i)
            target_day_str = target_day.isoformat()

            if not teacher_class_ids:
                day_records = []
            else:
                day_records = AttendanceRecord.query.filter(
                    AttendanceRecord.date == target_day_str,
                    AttendanceRecord.class_id.in_(teacher_class_ids)
                ).all()

            if day_records and len(day_records) > 0:
                day_present = sum(1 for r in day_records if r.status in ["PRESENT", "LATE"])
                day_rate = int((day_present / len(day_records)) * 100)
            else:
                day_rate = 0

            attendance_data.append({
                "name": target_day.strftime("%a"),
                "attendance": day_rate
            })

        # 4. Performance Data for the Line Chart (Safe UI Placeholders for now)
        performance_data = [
            { "week": 'Week 1', "avgScore": 75 },
            { "week": 'Week 2', "avgScore": 78 },
            { "week": 'Week 3', "avgScore": 82 },
            { "week": 'Week 4', "avgScore": 85 },
        ]

        return {
            "totalStudents": total_students,
            "totalClasses": total_classes,
            "activeAssignments": active_assignments,
            "attendanceRate": attendance_rate,
            "attendanceData": attendance_data,
            "performanceData": performance_data
        }, 200

    except Exception as e:
        print(f"🔥 Dashboard Error: {str(e)}")
        return {"error": str(e)}, 500