class AssignmentSubmissionDTO:
    def __init__(self, data=None, submission=None):
        if data:
            # Input (from request) - replaces AssignmentSubmissionInDto
            self.assignmentId = data.get("assignmentId")
            self.studentId = data.get("studentId")
            self.grade = data.get("grade")
            self.comment = data.get("comment")
            self.fileUrl = data.get("fileUrl")

        elif submission:
            # Output (from DB model) - replaces AssignmentSubmissionOutDto
            self.id = submission.id
            self.assignmentId = submission.assignment_id
            self.studentId = submission.student_id
            self.grade = submission.grade
            self.comment = submission.comment
            self.fileUrl = submission.file_url
            # LocalDateTime → Python datetime → ISO string for JSON
            self.submittedAt = (
                submission.submitted_at.isoformat()
                if submission.submitted_at else None
            )

    def to_dict(self):
        return {
            "id": getattr(self, "id", None),
            "assignmentId": self.assignmentId,
            "studentId": self.studentId,
            "grade": self.grade,
            "comment": self.comment,
            "fileUrl": self.fileUrl,
            "submittedAt": getattr(self, "submittedAt", None)
        }