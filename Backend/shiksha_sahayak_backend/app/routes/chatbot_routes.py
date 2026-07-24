import requests
from flask import Blueprint, request, jsonify, current_app
from langdetect import detect
from app.auth.jwt_handler import jwt_required  # 👈 NEW: Brought in the security guard

chatbot_bp = Blueprint("chatbot", __name__, url_prefix="/api/ChatBot")

SYSTEM_PROMPT = """You are ShikshaSahayak, a helpful AI assistant for rural school teachers in India.

CRITICAL LANGUAGE RULES — YOU MUST FOLLOW THESE STRICTLY:
- Detect the language of the teacher's message
- If the message is in English → reply ONLY in English
- If the message is in Hindi → reply ONLY in Hindi (Devanagari script)
- If the message is in Marathi → reply ONLY in Marathi (Devanagari script)
- NEVER reply in a different language than the one used in the message
- NEVER mix languages in your response

YOUR ROLE:
- Help teachers with lesson planning and teaching methods
- Answer subject doubts (Math, Science, English, Hindi, Marathi)
- Suggest activities suitable for rural classroom settings
- Support teachers who may have limited resources
- Give short, clear, practical answers"""

def process_ai_message(message):
    if not message:
        return jsonify({"error": "message is required"}), 400

    try:
        try:
            detected_lang = detect(message)
        except Exception:
            detected_lang = "en"

        lang_map = {
            "hi": "Hindi",
            "mr": "Marathi",
            "en": "English"
        }
        language = lang_map.get(detected_lang, "English")

        forced_message = f"[IMPORTANT: Reply strictly in {language} only. Do not use any other language.]\n\n{message}"

        # We combine the system prompt and user message to guarantee compatibility across all model versions
        combined_prompt = f"{SYSTEM_PROMPT}\n\n{forced_message}"

        api_key = current_app.config.get("GEMINI_API_KEY")
        if not api_key:
             print("❌ ERROR: GEMINI_API_KEY is missing from Flask config!")
             return jsonify({"error": "API Key not configured"}), 500

        # The standard Gemini 1.5 Flash endpoint (using 2.5-flash-lite as requested)
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key={api_key}"

        headers = {
            "Content-Type": "application/json"
        }

        body = {
            "contents": [
                {
                    "parts": [{"text": combined_prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 1024
            }
        }

        response = requests.post(api_url, json=body, headers=headers, timeout=30)
        data = response.json()

        # If Google returns anything other than a 200 OK, we catch it and print the exact reason
        if not response.ok:
            print(f"❌ GOOGLE API REJECTED REQUEST | Status: {response.status_code}")
            print(f"❌ GOOGLE ERROR DETAILS: {data}")

            # Safely extract Google's error message to send to the frontend
            error_msg = data.get("error", {}).get("message", "Unknown API error")
            return jsonify({"error": error_msg}), 500

        # Parse Gemini's successful response
        if "candidates" in data and len(data["candidates"]) > 0:
            content = data["candidates"][0]["content"]["parts"][0]["text"]
            return jsonify({
                "response": content,
                "detectedLanguage": language
            }), 200

        return jsonify({"response": "No response received from the model."}), 200

    except requests.exceptions.Timeout:
        return jsonify({"error": "Request timed out. Please try again."}), 504
    except Exception as e:
        print(f"❌ INTERNAL SERVER ERROR: {str(e)}")
        return jsonify({"error": str(e)}), 500


@chatbot_bp.route("", methods=["GET"])
@jwt_required # 👈 SECURED!
def get_chat_response():
    message = request.args.get("message")
    return process_ai_message(message)


@chatbot_bp.route("/voice", methods=["POST"])
@jwt_required # 👈 SECURED!
def get_voice_chat_response():
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "message is required in request body"}), 400

    message = data.get("message")
    return process_ai_message(message)