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
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,https://folio-recruitment.onrender.com").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import JSONResponse
import logging

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logging.error(f"Unhandled Exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."},
    )


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
    for mod in ["database", "models", "analyzer", "storage", "vector_db", "scrapers", "config", "routes", "tasks", "llm_evaluator"]:
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

try:
    clear_sys_modules()
    assess_dir = os.path.join(BASE_DIR, "assessment_app")
    sys.path.insert(0, assess_dir)
    from assessment_app.main import app as assess_api
    app.mount("/api/assessment", assess_api)
    sys.path.pop(0)
    print("Mounted Assessment Pod.")
except Exception as e:
    print(f"Failed to mount Assessment Pod: {e}")

try:
    clear_sys_modules()
    port_dir = os.path.join(BASE_DIR, "portfolio_app")
    sys.path.insert(0, port_dir)
    from portfolio_app.main import app as port_api
    app.mount("/api/portfolio", port_api)
    sys.path.pop(0)
    print("Mounted Portfolio Pod.")
except Exception as e:
    print(f"Failed to mount Portfolio Pod: {e}")

try:
    clear_sys_modules()
    scrape_dir = os.path.join(BASE_DIR, "scraper_app")
    sys.path.insert(0, scrape_dir)
    from scraper_app.main import app as scrape_api
    app.mount("/api/scraper", scrape_api)
    sys.path.pop(0)
    print("Mounted Scraper Pod.")
except Exception as e:
    print(f"Failed to mount Scraper Pod: {e}")

try:
    from collections_router import router as collections_router
    app.include_router(collections_router, prefix="/api/collections", tags=["Collections"])
    print("Mounted Collections Router.")
except Exception as e:
    print(f"Failed to mount Collections Router: {e}")

@app.get("/health")
def health_check():
    return {"status": "healthy", "modules": ["communication", "assessment", "portfolio", "scraper"]}

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

# Paths to the built frontends
candidate_dist = Path(BASE_DIR).parent / "folio" / "apps" / "candidate" / "dist"
recruiter_dist = Path(BASE_DIR).parent / "folio" / "apps" / "recruiter" / "dist"

# Mount Static Assets
if (candidate_dist / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(candidate_dist / "assets")), name="candidate_assets")
if (recruiter_dist / "assets").exists():
    app.mount("/recruiter/assets", StaticFiles(directory=str(recruiter_dist / "assets")), name="recruiter_assets")

# SPA Catch-all for Recruiter App
@app.get("/recruiter")
@app.get("/recruiter/")
@app.get("/recruiter/{full_path:path}")
async def serve_recruiter_spa(full_path: str = ""):
    file_path = recruiter_dist / full_path
    if file_path.is_file():
        return FileResponse(str(file_path))
    index_path = recruiter_dist / "index.html"
    if index_path.is_file():
        return FileResponse(str(index_path))
    return JSONResponse(status_code=404, content={"detail": "Recruiter frontend not built."})

# SPA Catch-all for Candidate App
@app.get("/{full_path:path}")
async def serve_candidate_spa(full_path: str = ""):
    # Do not intercept API calls
    if full_path.startswith("api/"):
        return JSONResponse(status_code=404, content={"detail": "API route not found"})
    
    file_path = candidate_dist / full_path
    if file_path.is_file():
        return FileResponse(str(file_path))
    index_path = candidate_dist / "index.html"
    if index_path.is_file():
        return FileResponse(str(index_path))
    return JSONResponse(status_code=404, content={"detail": "Candidate frontend not built."})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
