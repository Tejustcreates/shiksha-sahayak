import os
from google import genai
from app.dto.testpaper_dto import TestSpecificationDTO, GeneratedTestResponseDTO

def generate_test(data):
    # ✅ Fix 1: Moved API key loading inside the function so it doesn't crash on startup
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
    client = genai.Client(api_key=GEMINI_API_KEY)

    dto = TestSpecificationDTO(data)

    # ✅ Extract new parameters sent from React
    num_questions = data.get("numberOfQuestions", 10)
    language = data.get("language", "English")  # Default to English if not provided
    grade = data.get("grade", "Primary School (Grades 1-5)") # Default if not provided

    # ✅ FIXED: Dynamically map the exact question types selected by the teacher
    # We read directly from 'data' to easily grab the new primary-school question types
    question_types = data.get("questionTypes", {})
    types_requested = []

    if question_types.get("mcq"): types_requested.append("Multiple Choice Questions (MCQs)")
    if question_types.get("trueFalse"): types_requested.append("True/False Questions")
    if question_types.get("fillBlanks"): types_requested.append("Fill in the Blanks")
    if question_types.get("match"): types_requested.append("Match the Following Pairs")
    if question_types.get("oneWord"): types_requested.append("One Word Answer Questions")
    if question_types.get("shortAnswer"): types_requested.append("Short Answer Questions (1-2 lines)")
    if question_types.get("longAnswer"): types_requested.append("Long Answer Questions (1 paragraph)")

    types_str = ", ".join(types_requested) if types_requested else "Mixed Questions"

    # ✅ Phase 3 Update: Maharashtra Syllabus & Language Prompt Injection
    prompt = f"""
    You are an expert primary school educator familiar with the Maharashtra State Board syllabus.
    Generate an age-appropriate test paper for {grade} students based on the following specifications:

    - Target Language: {language}
    - Subject: {dto.subject}
    - Topics: {dto.topics}
    - Total Marks: {dto.total_marks}
    - Duration: {dto.duration} Minutes
    - Difficulty: {dto.difficulty}
    - Required Question Types: {types_str}
    - Total Number of Questions: EXACTLY {num_questions}

    Instructions for formatting:
    1. Output a clean, ready-to-print test paper.
    2. The ENTIRE test paper (instructions, questions, options) MUST be written in {language}.
    3. Divide the paper into clear sections based on the requested Question Types (e.g., "SECTION A: Multiple Choice").
    4. Number all questions consecutively.
    5. Generate EXACTLY {num_questions} questions in total. No more, no less.
    6. State the marks for each question in brackets at the end of the question, e.g., [2 Marks].
    7. Ensure the sum of all individual question marks adds up to EXACTLY {dto.total_marks}.
    8. Do NOT include an answer key, only provide the student question paper.
    9. CRITICAL: Do NOT use LaTeX, markdown, or special formatting for math or chemistry equations. Use plain text only (e.g., write fractions as 3/4, formulas as CaCO3, equations as CaCO3 -> CaO + CO2).
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        result = {
            "testContent": response.text,
            "subject": dto.subject,
            "totalMarks": dto.total_marks
        }
        return GeneratedTestResponseDTO(result).to_dict(), 200
    except Exception as e:
        print(f"🔥 TEST GEN ERROR: {str(e)}")
        return {"error": str(e)}, 500