import os
import io
import traceback # 🚀 NEW: Exposes hidden 500 errors to the terminal
from flask import Blueprint, request, jsonify, send_file
from app.dto.ppt_dto import PPTRequestDTO
from app.services.ppt_service import generate_ppt
from app.auth.jwt_handler import jwt_required as token_required

ppt_bp = Blueprint("ppt", __name__, url_prefix="/api/ppt")

@ppt_bp.route("/generate", methods=["POST"])
@token_required
def generate_ppt_route():
    # Make file upload completely optional
    file = request.files.get("file")

    if file and file.filename != "":
        allowed = (".txt", ".pdf", ".docx", ".pptx")
        if not file.filename.lower().endswith(allowed):
            return jsonify({"error": "Only .txt, .pdf, .docx, and .pptx files are supported."}), 400
    else:
        file = None # Explicitly set to None if no file was uploaded

    dto = PPTRequestDTO.from_form(request.form)
    requested_language = request.form.get("language", "English")

    # SECURITY CHECK: If no file is uploaded, they MUST provide manual topics
    if not file and (dto.mode != "manual" or not dto.slide_topics):
        return jsonify({"error": "You must either upload a document or provide manual topics to generate a presentation."}), 400

    try:
        output_path = generate_ppt(
            file_storage=file,
            mode=dto.mode,
            slide_topics=dto.slide_topics,
            slide_count=dto.slide_count,
            language=requested_language
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 422
    except RuntimeError as e:
        # 🚀 Prints the exact Node.js/Execution error
        print(f"❌ RUNTIME ERROR: {str(e)}")
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        # 🚀 Prints the exact Python Crash Error and Line Number!
        print("❌ CRITICAL UNEXPECTED ERROR IN PPT ROUTE:")
        traceback.print_exc()
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

    # Load file into RAM and instantly delete it from the hard drive
    try:
        with open(output_path, 'rb') as f:
            return_data = io.BytesIO(f.read())

        # Instantly delete the file from the hard drive
        if os.path.exists(output_path):
            os.remove(output_path)
            print(f"🗑️ Cleaned up temp PPT from hard drive: {output_path}")

    except Exception as error:
        print(f"⚠️ Error handling or deleting generated PPT: {error}")
        return jsonify({"error": "Failed to process the generated file for download."}), 500

    # Send the RAM copy to the user's browser
    return send_file(
        return_data,
        as_attachment=True,
        download_name=os.path.basename(output_path),
        mimetype="application/vnd.openxmlformats-officedocument.presentationml.presentation"
    )