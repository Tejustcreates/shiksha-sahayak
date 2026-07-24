import os
import pickle
import uuid
import cv2
import tempfile
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from deepface import DeepFace
from scipy.spatial.distance import cosine
from app.models.student_model import Student

from app.auth.jwt_handler import jwt_required, get_teacher_id_from_request
from app.services.attendance_service import (
    mark_attendance, get_attendance_by_student, get_attendance_by_date,
    get_attendance_by_teacher, get_attendance_by_class_and_date, get_class_attendance_history
)

attendance_bp = Blueprint("attendance_bp", __name__, url_prefix="/api/attendance")

# ==========================================
# EXISTING ROUTES (Protecting with secure teacher logic where appropriate)
# ==========================================

@attendance_bp.route("/submit", methods=["POST"])
@jwt_required
def mark():
    # 🚀 Securely retrieve the authentic teacher ID from the JWT token
    secure_teacher_id = get_teacher_id_from_request()
    data_list = request.get_json()
    # Pass the secure ID directly to the service layer for all marked student attendances
    response, status = mark_attendance(data_list, secure_teacher_id)
    return jsonify(response), status

@attendance_bp.route("/student/<int:student_id>", methods=["GET"])
@jwt_required
def by_student(student_id):
    response, status = get_attendance_by_student(student_id)
    return jsonify(response), status

@attendance_bp.route("/date/<string:date>", methods=["GET"])
@jwt_required
def by_date(date):
    response, status = get_attendance_by_date(date)
    return jsonify(response), status

@attendance_bp.route("/teacher/<int:teacher_id>", methods=["GET"])
@jwt_required
def by_teacher(teacher_id):
    response, status = get_attendance_by_teacher(teacher_id)
    return jsonify(response), status

@attendance_bp.route("/class/<int:class_id>/date/<string:date>", methods=["GET"])
@jwt_required
def by_class_and_date(class_id, date):
    response, status = get_attendance_by_class_and_date(class_id, date)
    return jsonify(response), status

@attendance_bp.route("/history/<int:class_id>", methods=["GET"])
@jwt_required
def history(class_id):
    response, status = get_class_attendance_history(class_id)
    return jsonify(response), status


# ==========================================
# AI ROUTE: Process Group Photo (VISUAL DEBUGGER + FACENET + GREEDY DEDUPLICATION)
# ==========================================

@attendance_bp.route("/process-photo", methods=["POST"])
@jwt_required
def process_photo():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    class_id = request.form.get("class_id", "1")

    # 1. Load the database for the specific class
    pkl_path = os.path.join(os.getcwd(), "ai_models", "encodings", f"class_{class_id}_encodings.pkl")
    try:
        with open(pkl_path, "rb") as f:
            database = pickle.load(f)
    except FileNotFoundError:
        return jsonify({"error": f"Database for Class {class_id} not found."}), 404

    # 2. Save the uploaded classroom photo temporarily
    temp_dir = os.path.join(os.getcwd(), "temp_uploads")
    os.makedirs(temp_dir, exist_ok=True)
    img_path = os.path.join(temp_dir, secure_filename(file.filename))
    file.save(img_path)

    present_students = []

    try:
        print(f"\n📸 --- SCANNING NEW PHOTO FOR CLASS {class_id} ---")

        # Load the image into OpenCV memory so we can draw boxes on it
        debug_img = cv2.imread(img_path)

        # 3. Detect faces using FACENET
        try:
            face_results = DeepFace.represent(
                img_path=img_path,
                model_name="Facenet",
                detector_backend="retinaface",
                enforce_detection=True,
                align=True
            )
        except ValueError:
            print("No faces were detected in the image.")
            face_results = []

        print(f"Found {len(face_results)} faces in the group photo.")

        match_candidates = []
        face_best_scores = {} # Track the best score for EVERY face for terminal debugging

        # 4. Gather all potential matches first
        for i, face_data in enumerate(face_results):
            face_id = i + 1
            emb = face_data["embedding"]

            facial_area = face_data.get("facial_area", {})
            x, y, w, h = facial_area.get('x', 0), facial_area.get('y', 0), facial_area.get('w', 0), facial_area.get('h', 0)

            # Ignore tiny blurry faces in the deep background
            if w < 20 or h < 20:
                continue

            best_dist_for_face = float("inf")
            best_name_for_face = "Unknown"

            for student, embeddings in database.items():
                for db_emb in embeddings:
                    dist = cosine(emb, db_emb)

                    # Track the absolute best math, even if it fails the threshold
                    if dist < best_dist_for_face:
                        best_dist_for_face = dist
                        best_name_for_face = student

                    # If it passes the strict threshold, queue it for deduplication
                    if dist < 0.45:
                        match_candidates.append({
                            "face_id": face_id,
                            "student": student,
                            "distance": dist,
                            "coords": (x, y, w, h)
                        })

            # Save the best stats so we can print them if this face gets rejected later
            face_best_scores[face_id] = {"name": best_name_for_face, "dist": best_dist_for_face}


        # 5. 🔥 GREEDY DEDUPLICATION LOGIC 🔥
        match_candidates.sort(key=lambda item: item["distance"])

        assigned_faces = set()
        assigned_students = set()
        final_matches = {}

        for candidate in match_candidates:
            fid = candidate["face_id"]
            student = candidate["student"]

            if fid not in assigned_faces and student not in assigned_students:
                final_matches[fid] = candidate
                assigned_faces.add(fid)
                assigned_students.add(student)
                present_students.append(student)

        # 6. 🔥 THE VISUAL DEBUGGER LOOP (CRISP BOX & SHARP TEXT WITH OUTLINE) 🔥
        for i, face_data in enumerate(face_results):
            face_id = i + 1
            facial_area = face_data.get("facial_area", {})
            x, y, w, h = facial_area.get('x', 0), facial_area.get('y', 0), facial_area.get('w', 0), facial_area.get('h', 0)

            if w < 20 or h < 20:
                if debug_img is not None:
                    thin_yellow = (0, 255, 255)
                    cv2.rectangle(debug_img, (x, y), (x+w, y+h), thin_yellow, 1)
                    label = f"#{face_id} Too Small"
                    # Black outline for small labels
                    cv2.putText(debug_img, label, (x, y - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 0, 0), 2, cv2.LINE_AA)
                    cv2.putText(debug_img, label, (x, y - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.35, thin_yellow, 1, cv2.LINE_AA)
                continue

            # Set text and colors based on match status
            if face_id in final_matches:
                match = final_matches[face_id]
                print(f"⭐ TRUE MATCH: Face #{face_id} is {match['student']} ({match['distance']:.3f})")
                text = f"#{face_id} {match['student']} ({match['distance']:.2f})"
                box_color = (0, 255, 0)
                text_color = box_color
            else:
                # Print detailed math to the terminal...
                best_info = face_best_scores.get(face_id, {"name": "Unknown", "dist": float('inf')})
                print(f"❌ REJECTED: Face #{face_id}. Best guess: {best_info['name']} (Distance: {best_info['dist']:.3f})")

                # ...but keep the image text perfectly clean!
                text = f"#{face_id} Unknown"
                box_color = (0, 0, 255)
                text_color = box_color

            if debug_img is not None:
                cv2.rectangle(debug_img, (x, y), (x+w, y+h), box_color, 2)

                # I bumped the font_scale slightly to 0.4 for maximum readability in crowds
                font_scale = 0.4
                thickness = 1

                # 1. Draw Text Outline (Black, thicker)
                cv2.putText(debug_img, text, (x, y - 5), cv2.FONT_HERSHEY_SIMPLEX, font_scale, (0, 0, 0), thickness + 1, cv2.LINE_AA)

                # 2. Draw Inner Text (Actual color, thinner)
                cv2.putText(debug_img, text, (x, y - 5), cv2.FONT_HERSHEY_SIMPLEX, font_scale, text_color, thickness, cv2.LINE_AA)

        # Save unique debug image
        if debug_img is not None:
            unique_id = uuid.uuid4().hex[:8]
            debug_filename = f"debug_class_{class_id}_{unique_id}.jpg"
            debug_output_path = os.path.join(temp_dir, debug_filename)
            cv2.imwrite(debug_output_path, debug_img)
            print(f"\n🖼️ SUCCESS! Visual Debugger: {debug_output_path}")

        present_students = list(set(present_students))
        all_students = list(database.keys())
        absent_students = [s for s in all_students if s not in present_students]

        if os.path.exists(img_path):
            os.remove(img_path)

        return jsonify({
            "present": present_students,
            "absent": absent_students
        }), 200

    except Exception as e:
        if os.path.exists(img_path):
            os.remove(img_path)
        print(f"❌ Error: {str(e)}")
        return jsonify({"error": f"AI Processing Error: {str(e)}"}), 500

# ==========================================
# EMERGENCY REBUILD: Generate .pkl from Database
# ==========================================
@attendance_bp.route("/rebuild-encodings/<int:class_id>", methods=["POST", "OPTIONS"])
def rebuild_encodings_cors(class_id):
    # This specifically handles the browser's preflight check so it doesn't get blocked
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    # Pass the actual POST request to the protected function
    return process_rebuild(class_id)

@jwt_required
def process_rebuild(class_id):
    print(f"🔄 Starting AI Memory Rebuild for Class {class_id}...")

    # 1. Fetch all students in this class from the database
    students = Student.query.filter_by(class_id=class_id).all()

    if not students:
        return jsonify({"error": f"No students found in Class {class_id}"}), 404

    class_database = {}
    success_count = 0
    fail_count = 0

    # 2. 🚀 TARGET THE NEW PATH: ai_models/encodings
    encodings_dir = os.path.join(os.getcwd(), "ai_models", "encodings")

    # This will automatically create both 'ai_models' and 'encodings' folders if they don't exist
    os.makedirs(encodings_dir, exist_ok=True)

    pkl_path = os.path.join(encodings_dir, f"class_{class_id}_encodings.pkl")

    # 3. Loop through every student and scan their database photo
    for student in students:
        if not student.photo:
            print(f"⚠️ Skipped {student.first_name}: No photo in database.")
            continue

        student_name = f"{student.first_name} {student.last_name}".strip()

        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_img:
            temp_img.write(student.photo)
            temp_img_path = temp_img.name

        try:
            result = DeepFace.represent(
                img_path=temp_img_path,
                model_name="Facenet",
                detector_backend="retinaface",
                enforce_detection=True,
                align=True
            )

            class_database[student_name] = [result[0]["embedding"]]
            print(f"✅ Encoded: {student_name}")
            success_count += 1

        except Exception as e:
            print(f"❌ Failed to encode {student_name}: {str(e)}")
            fail_count += 1
        finally:
            if os.path.exists(temp_img_path):
                os.remove(temp_img_path)

    # 4. Save the new dictionary as a .pkl file in ai_models/encodings
    if success_count > 0:
        with open(pkl_path, "wb") as f:
            pickle.dump(class_database, f)

        return jsonify({
            "message": f"Successfully rebuilt AI memory for Class {class_id}",
            "encoded_students": success_count,
            "failed_students": fail_count
        }), 200
    else:
        return jsonify({"error": "Failed to encode any students. Are the photos clear?"}), 400


# ==========================================
# ADVANCED: Few-Shot AI Training for Specific Student
# ==========================================
@attendance_bp.route("/train-student", methods=["POST", "OPTIONS"])
def train_student_cors():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
    return process_student_training()

@jwt_required
def process_student_training():
    try:
        student_id = request.form.get("student_id")
        class_id = request.form.get("class_id")
        photos = request.files.getlist("photos") # 👈 Accepts multiple files!

        if not photos or len(photos) == 0:
            return jsonify({"error": "No photos provided."}), 400

        # Fetch the student to get their exact name
        student = Student.query.get(student_id)
        if not student:
            return jsonify({"error": "Student not found."}), 404

        student_name = f"{student.first_name} {student.last_name}".strip()

        print(f"\n🧠 --- TRAINING AI FOR: {student_name} ({len(photos)} photos) ---")

        encodings_dir = os.path.join(os.getcwd(), "ai_models", "encodings")
        os.makedirs(encodings_dir, exist_ok=True)
        pkl_path = os.path.join(encodings_dir, f"class_{class_id}_encodings.pkl")

        # Load existing dictionary, or create a new one if it doesn't exist
        class_database = {}
        if os.path.exists(pkl_path):
            with open(pkl_path, "rb") as f:
                class_database = pickle.load(f)

        new_embeddings = []
        temp_dir = os.path.join(os.getcwd(), "temp_uploads")
        os.makedirs(temp_dir, exist_ok=True)

        for photo in photos:
            # Save each photo temporarily
            temp_path = os.path.join(temp_dir, secure_filename(photo.filename))
            photo.save(temp_path)

            try:
                # Scan the face
                result = DeepFace.represent(
                    img_path=temp_path,
                    model_name="Facenet",
                    detector_backend="retinaface",
                    enforce_detection=True,
                    align=True
                )
                new_embeddings.append(result[0]["embedding"])
                print(f"✅ Extracted embedding from {photo.filename}")
            except Exception as e:
                print(f"⚠️ Skipped {photo.filename} - No face detected.")
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)

        if len(new_embeddings) == 0:
            return jsonify({"error": "Failed to detect faces in any of the uploaded photos. Please use clearer photos."}), 400

        # 🚀 NEW LOGIC: Check if teacher wants to Replace or Append
        train_action = request.form.get("action", "replace")

        if train_action == "append" and student_name in class_database:
            # Combine old and new photos
            combined_embeddings = class_database[student_name] + new_embeddings
            # Cap at 15 embeddings maximum to keep the AI fast
            class_database[student_name] = combined_embeddings[-15:]
            total_faces = len(class_database[student_name])
        else:
            # Overwrite completely
            class_database[student_name] = new_embeddings
            total_faces = len(new_embeddings)

        # Save back to .pkl
        with open(pkl_path, "wb") as f:
            pickle.dump(class_database, f)

        return jsonify({
            "message": f"Successfully updated AI for {student_name}.",
            "faces_encoded": len(new_embeddings),
            "total_memory": total_faces
        }), 200

    except Exception as e:
        print(f"❌ AI Training Error: {str(e)}")
        return jsonify({"error": str(e)}), 500