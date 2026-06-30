from fastapi import APIRouter, HTTPException
from typing import Any, Dict
import uuid
from firebase_admin import firestore

router = APIRouter()

def get_db():
    return firestore.client()

@router.get("/{name}")
def get_docs(name: str):
    db = get_db()
    docs = db.collection(name).stream()
    return [doc.to_dict() for doc in docs]

@router.post("/{name}")
def add_doc(name: str, doc: Dict[str, Any]):
    db = get_db()
    if "id" not in doc:
        doc["id"] = uuid.uuid4().hex[:9]
    
    # Write to Firestore using the ID as the document ID
    db.collection(name).document(doc["id"]).set(doc)
    return doc

@router.patch("/{name}/{doc_id}")
def update_doc(name: str, doc_id: str, doc: Dict[str, Any]):
    db = get_db()
    doc_ref = db.collection(name).document(doc_id)
    
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Not found")
    
    doc["id"] = doc_id
    doc_ref.update(doc)
    
    return doc_ref.get().to_dict()

@router.delete("/{name}/{doc_id}")
def delete_doc(name: str, doc_id: str):
    db = get_db()
    db.collection(name).document(doc_id).delete()
    return {"status": "deleted"}
