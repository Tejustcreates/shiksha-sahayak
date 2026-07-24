class SchoolClassDTO:
    def __init__(self, data=None, school_class=None):
        if data:
            # Input — replaces SchoolClassInDto
            self.grade = data.get("grade")
            self.section = data.get("section")
            # We removed teacherId from here because the join table handles ownership now

        elif school_class:
            # Output — replaces SchoolClassOutDto
            self.id = school_class.id
            self.grade = school_class.grade
            # Section is allowed in DTO (if frontend sends it), but ignored by DB if column is removed
            self.section = getattr(school_class, 'section', None)

            # counts related students
            self.studentCount = len(school_class.students) if school_class.students else 0

    def to_dict(self):
        return {
            "id": getattr(self, "id", None),
            "grade": getattr(self, "grade", None),
            "section": getattr(self, "section", None),
            "studentCount": getattr(self, "studentCount", 0)
        }