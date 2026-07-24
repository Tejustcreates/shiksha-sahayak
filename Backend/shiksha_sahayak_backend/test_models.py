import requests
import os
from dotenv import load_dotenv

# Load your API key from the .env file
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("Could not find GEMINI_API_KEY in .env file.")
else:
    print("Checking Google for available models...")
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    response = requests.get(url)

    data = response.json()

    if "error" in data:
        print(f"ERROR: {data['error']['message']}")
    else:
        print("\n✅ YOUR KEY HAS ACCESS TO THESE MODELS:")
        for model in data.get("models", []):
            # Only print models that support text generation
            if "generateContent" in model.get("supportedGenerationMethods", []):
                print(f" - {model['name']}")