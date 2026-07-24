class AttendanceRecordInDTO:
    def __init__(self, data):
        self.student_id = data.get("studentId")
        self.class_id = data.get("classId")
        self.date = data.get("date")
        self.status = data.get("status")  # "PRESENT" or "ABSENT"


class AttendanceRecordOutDTO:
    def __init__(self, record):
        self.id = record.id
        self.student_id = record.student_id
        self.class_id = record.class_id
        self.date = record.date
        self.status = record.status

    def to_dict(self):
        return {
            "id": self.id,
            "studentId": self.student_id,
            "classId": self.class_id,
            "date": self.date,
            "status": self.status
        }
