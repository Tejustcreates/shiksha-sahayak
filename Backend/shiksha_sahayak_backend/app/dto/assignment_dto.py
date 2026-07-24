class AssignmentDTO:
    def __init__(self, data=None, assignment=None):
        if data:
            # Input (from request) - replaces AssignmentInDto
            self.title = data.get("title")
            self.description = data.get("description")
            self.dueDate = data.get("dueDate")   # expected as string "YYYY-MM-DD"
            self.classId = data.get("classId")

        elif assignment:
            # Output (from DB model) - replaces AssignmentOutDto
            self.id = assignment.id
            self.title = assignment.title
            self.description = assignment.description
            # Convert Python date to string for JSON response
            self.dueDate = assignment.due_date.isoformat() if assignment.due_date else None
            self.classId = assignment.class_id

    def to_dict(self):
        return {
            "id": getattr(self, "id", None),
            "title": self.title,
            "description": self.description,
            "dueDate": self.dueDate,
            "classId": self.classId
        }