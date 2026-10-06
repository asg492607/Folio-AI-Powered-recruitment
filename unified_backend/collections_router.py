from fastapi import APIRouter, HTTPException, Query
from typing import Any, Dict, List
import uuid
import time
from firebase_admin import firestore

router = APIRouter()

# Simple in-memory cache to prevent exhausting Firestore daily read limits
_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL_SECONDS = 30

def get_db():
    try:
        return firestore.client()
    except Exception:
        return None

@router.get("/{name}")
def get_docs(name: str, limit: int = Query(default=100, le=200)):
    # Check cache
    now = time.time()
    cache_key = f"{name}_{limit}"
    if cache_key in _CACHE:
        entry = _CACHE[cache_key]
        if now - entry["timestamp"] < CACHE_TTL_SECONDS:
            return entry["data"]

    db = get_db()
    if not db:
        return []

    try:
        query = db.collection(name).limit(limit)
        docs = query.stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            if data:
                # Convert timestamps to ISO string if needed
                for k, v in list(data.items()):
                    if hasattr(v, 'isoformat'):
                        data[k] = v.isoformat()
                results.append(data)

        _CACHE[cache_key] = {"data": results, "timestamp": now}
        return results
    except Exception as e:
        print(f"[collections_router] Error reading {name}: {e}")
        # Return cached copy if available even if stale
        if cache_key in _CACHE:
            return _CACHE[cache_key]["data"]
        return []

@router.post("/{name}")
def add_doc(name: str, doc: Dict[str, Any]):
    db = get_db()
    if not db:
        raise HTTPException(status_code=503, detail="Database client unavailable")

    if "id" not in doc or not doc["id"]:
        doc["id"] = uuid.uuid4().hex[:9]
    
    try:
        db.collection(name).document(str(doc["id"])).set(doc)
        # Invalidate cache
        for k in list(_CACHE.keys()):
            if k.startswith(f"{name}_"):
                del _CACHE[k]
        return doc
    except Exception as e:
        print(f"[collections_router] Error writing {name}: {e}")
        return doc

@router.patch("/{name}/{doc_id}")
def update_doc(name: str, doc_id: str, doc: Dict[str, Any]):
    db = get_db()
    if not db:
        raise HTTPException(status_code=503, detail="Database client unavailable")
    
    try:
        doc_ref = db.collection(name).document(doc_id)
        doc["id"] = doc_id
        doc_ref.update(doc)
        for k in list(_CACHE.keys()):
            if k.startswith(f"{name}_"):
                del _CACHE[k]
        return doc
    except Exception as e:
        print(f"[collections_router] Error updating {name}/{doc_id}: {e}")
        return doc

@router.delete("/{name}/{doc_id}")
def delete_doc(name: str, doc_id: str):
    db = get_db()
    if not db:
        return {"status": "deleted"}
    try:
        db.collection(name).document(doc_id).delete()
        for k in list(_CACHE.keys()):
            if k.startswith(f"{name}_"):
                del _CACHE[k]
        return {"status": "deleted"}
    except Exception as e:
        print(f"[collections_router] Error deleting {name}/{doc_id}: {e}")
        return {"status": "deleted"}

