class StudentDTO:
    def __init__(self, data=None, student=None):
        if data:
            # Input (from request) - camelCase from JSON
            self.id = data.get("id")
            self.firstName = data.get("firstName")
            self.lastName = data.get("lastName")
            self.rollNumber = data.get("rollNumber")
            self.age = data.get("age")
            self.parentName = data.get("parentName")
            self.parentContact = data.get("parentContact")
            self.parentEmail = data.get("parentEmail")
            self.parentPreferredLanguage = data.get("parentPreferredLanguage")
            self.classId = data.get("classId")
            self.photo = data.get("photo")

        elif student:
            # Output (from DB model) - map snake_case → camelCase
            self.id = student.id
            self.firstName = student.first_name
            self.lastName = student.last_name
            self.rollNumber = student.roll_number
            self.age = student.age
            self.parentName = student.parent_name
            self.parentContact = student.parent_contact
            self.parentEmail = student.parent_email
            self.parentPreferredLanguage = student.parent_preferred_language
            self.classId = student.class_id

            # 👇 THE FIX: Convert raw image bytes into a simple True/False boolean
            self.photo = True if student.photo else False

    def to_dict(self):
        return {
            "id": self.id,
            "firstName": self.firstName,
            "lastName": self.lastName,
            "rollNumber": self.rollNumber,
            "age": self.age,
            "parentName": self.parentName,
            "parentContact": self.parentContact,
            "parentEmail": self.parentEmail,
            "parentPreferredLanguage": self.parentPreferredLanguage,
            "classId": self.classId,
            "photo": self.photo
        }