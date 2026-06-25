import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = FastAPI(title="Unified Ecosystem API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
@app.head("/")
def read_root():
    return {"status": "ok", "message": "Unified Backend is running successfully!"}

# Initialize Firebase
if not firebase_admin._apps:
    try:
        # Check if the service-account.json file exists locally
        cred_path = os.path.join(BASE_DIR, "service-account.json")
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            print("Firebase Admin initialized successfully using service-account.json.")
        elif os.environ.get("GOOGLE_APPLICATION_CREDENTIALS_JSON"):
            import json
            cred_dict = json.loads(os.environ.get("GOOGLE_APPLICATION_CREDENTIALS_JSON"))
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
            print("Firebase Admin initialized successfully using JSON environment variable.")
        else:
            # Fallback to default credentials
            firebase_admin.initialize_app()
            print("Firebase Admin initialized successfully using default credentials.")
    except Exception as e:
        print(f"Warning: Failed to initialize Firebase Admin. Make sure GOOGLE_APPLICATION_CREDENTIALS is set. {e}")

# Mount Communication Pod
def clear_sys_modules():
    for mod in ["database", "models", "analyzer", "storage", "vector_db", "scrapers", "config", "routes"]:
        if mod in sys.modules:
            del sys.modules[mod]

try:
    clear_sys_modules()
    comm_dir = os.path.join(BASE_DIR, "communication_app")
    sys.path.insert(0, comm_dir)
    from communication_app.main import app as comm_api
    app.mount("/api/communication", comm_api)
    sys.path.pop(0)
    print("Mounted Communication Pod.")
except Exception as e:
    print(f"Failed to mount Communication Pod: {e}")

@app.get("/health")
def health_check():
    return {"status": "healthy", "modules": ["communication"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
