class TestSpecificationDTO:
    def __init__(self, data):
        self.subject = data.get("subject")
        self.topics = data.get("topics")
        self.total_marks = data.get("totalMarks")
        self.duration = data.get("duration")
        self.difficulty = data.get("difficulty")
        # Default to an empty dict if no types are provided
        self.question_types = data.get("questionTypes", {})

    def to_dict(self):
        return {
            "subject": self.subject,
            "topics": self.topics,
            "totalMarks": self.total_marks,
            "duration": self.duration,
            "difficulty": self.difficulty,
            "questionTypes": self.question_types
        }

class GeneratedTestResponseDTO:
    def __init__(self, data):
        self.test_content = data.get("testContent")
        self.subject = data.get("subject")
        self.total_marks = data.get("totalMarks")

    def to_dict(self):
        return {
            "testContent": self.test_content,
            "subject": self.subject,
            "totalMarks": self.total_marks
        }