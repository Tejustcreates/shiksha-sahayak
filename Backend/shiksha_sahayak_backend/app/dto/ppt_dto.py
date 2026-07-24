import json

class PPTRequestDTO:
    def __init__(self, mode: str, slide_topics: list = None, slide_count: int = None):
        self.mode = mode
        self.slide_topics = slide_topics or []
        self.slide_count = slide_count or 8

    @staticmethod
    def from_form(form_data: dict):
        mode = form_data.get("mode", "auto")

        # Ensure slide_count is a valid integer
        try:
            slide_count = int(form_data.get("slide_count", 8))
        except (ValueError, TypeError):
            slide_count = 8

        raw_topics = form_data.get("slide_topics")
        slide_topics = []

        if raw_topics:
            try:
                # If React sent a JSON string (like '["Topic1"]'), decode it
                if isinstance(raw_topics, str) and (raw_topics.startswith("[") or raw_topics.startswith("{")):
                    slide_topics = json.loads(raw_topics)
                else:
                    # If it's just a plain string or already a list, use it directly
                    slide_topics = [raw_topics] if isinstance(raw_topics, str) else raw_topics
            except Exception:
                # Fallback: if JSON decoding fails, treat the whole thing as one topic
                slide_topics = [raw_topics]

        return PPTRequestDTO(mode=mode, slide_topics=slide_topics, slide_count=slide_count)


class PPTResponseDTO:
    def __init__(self, success: bool, file_path: str = None, message: str = None):
        self.success = success
        self.file_path = file_path
        self.message = message

    def to_dict(self):
        return {
            "success": self.success,
            "file_path": self.file_path,
            "message": self.message
        }