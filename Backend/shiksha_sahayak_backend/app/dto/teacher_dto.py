class TeacherInDTO:
    def __init__(self, data):
        self.first_name = data.get("firstName")
        self.last_name = data.get("lastName")
        self.email = data.get("email")
        self.password = data.get("password")
        self.subject_taught = data.get("subjectTaught")
        self.teaching_experience = data.get("teachingExperience")
        self.school_name = data.get("schoolName")


class TeacherOutDTO:
    def __init__(self, teacher):
        self.id = teacher.id
        self.first_name = teacher.first_name
        self.last_name = teacher.last_name
        self.email = teacher.email
        self.subject_taught = teacher.subject_taught
        self.teaching_experience = teacher.teaching_experience
        self.school_name = teacher.school_name
        self.class_count = 0
    def to_dict(self):
        return {
            "id": self.id,
            "firstName": self.first_name,
            "lastName": self.last_name,
            "email": self.email,
            "subjectTaught": self.subject_taught,
            "teachingExperience": self.teaching_experience,
            "schoolName": self.school_name,
            "classCount": self.class_count
        }


class LoginRequestDTO:
    def __init__(self, data):
        self.email = data.get("email")
        self.password = data.get("password")


class LoginResponseDTO:
    def __init__(self, token, teacher_id):
        self.token = token
        self.teacher_id = teacher_id

    def to_dict(self):
        return {
            "token": self.token,
            "teacherId": self.teacher_id
        }