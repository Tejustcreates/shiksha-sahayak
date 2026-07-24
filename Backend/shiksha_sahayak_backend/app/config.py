# app/config.py
import os
from dotenv import load_dotenv

# Load variables from the .env file
load_dotenv()

class Config:
    # 1. Database & App Configuration
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    if os.environ.get("RENDER"):
        DB_PATH = os.path.join(BASE_DIR, '..', 'database.db')
    else:
        DB_PATH = os.path.join(BASE_DIR, '..', 'instance', 'database.db')
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{DB_PATH}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = ["http://localhost:5173", "https://shiksha-sahayak.vercel.app"]

    # 2. Security & External APIs (Falling back to your hardcoded strings if not in .env)
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super_secure_random_string_for_shiksha_sahayak")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyAFz4vz2yKS0HCJVKYKQxPIMyz7ssfKhQs")

    # 3. Shiksha Sahayak Chatbot Configuration
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    OPENROUTER_API_URL = os.getenv("OPENROUTER_API_URL", "https://openrouter.ai/api/v1/chat/completions")
    OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "google/gemini-2.5-flash") # Or whatever model you prefer