"""
Firestore Client
----------------
All DB reads/writes go through here.
Collections:
  - registered_content   : DNA fingerprints + ownership metadata
  - detections           : piracy detection events
  - scan_jobs            : scraper scan records
"""

import os
import json
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

# Lazy import so the app still boots locally without credentials
_db = None


def _get_db():
    global _db
    if _db is None:
        from google.cloud import firestore
        project_id = os.environ.get("GCP_PROJECT_ID")
        _db = firestore.Client(project=project_id) if project_id else firestore.Client()
    return _db


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ── Registered Content ────────────────────────────────────────────────────────

def save_content(
    content_id: str,
    title: str,
    owner: str,
    platform: Optional[str],
    dna_sequence: List[List[float]],
    extracted_frames: int,
    dna_dimensions: int,
    blockchain_hash: str,
    tx_hash: str,
) -> None:
    doc = {
        "content_id": content_id,
        "title": title,
        "owner": owner,
        "platform": platform or "unknown",
        # Firestore doesn't support nested arrays — store as JSON string
        "dna_sequence_json": json.dumps(dna_sequence),
        "extracted_frames": extracted_frames,
        "dna_dimensions": dna_dimensions,
        "blockchain_hash": blockchain_hash,
        "tx_hash": tx_hash,
        "registered_at": _now_iso(),
    }
    _get_db().collection("registered_content").document(content_id).set(doc)


def _deserialize_content(raw: dict) -> dict:
    """Restore dna_sequence from its JSON string form."""
    if "dna_sequence_json" in raw:
        raw["dna_sequence"] = json.loads(raw.pop("dna_sequence_json"))
    return raw


def get_all_content() -> List[Dict[str, Any]]:
    docs = _get_db().collection("registered_content").stream()
    return [_deserialize_content(d.to_dict()) for d in docs]


def get_content_by_id(content_id: str) -> Optional[Dict[str, Any]]:
    doc = _get_db().collection("registered_content").document(content_id).get()
    return _deserialize_content(doc.to_dict()) if doc.exists else None


# ── Detections ────────────────────────────────────────────────────────────────

def save_detection(detection: Dict[str, Any]) -> None:
    _get_db().collection("detections").document(
        detection["detection_id"]
    ).set(detection)


def get_all_detections(limit: int = 100) -> List[Dict[str, Any]]:
    docs = (
        _get_db()
        .collection("detections")
        .order_by("detected_at", direction="DESCENDING")
        .limit(limit)
        .stream()
    )
    return [d.to_dict() for d in docs]


def get_detection_by_id(detection_id: str) -> Optional[Dict[str, Any]]:
    doc = _get_db().collection("detections").document(detection_id).get()
    return doc.to_dict() if doc.exists else None


def update_detection(detection_id: str, updates: Dict[str, Any]) -> None:
    _get_db().collection("detections").document(detection_id).update(updates)


# ── Scan Jobs ─────────────────────────────────────────────────────────────────

def save_scan_job(scan: Dict[str, Any]) -> None:
    _get_db().collection("scan_jobs").document(scan["scan_id"]).set(scan)


def get_scan_job(scan_id: str) -> Optional[Dict[str, Any]]:
    doc = _get_db().collection("scan_jobs").document(scan_id).get()
    return doc.to_dict() if doc.exists else None
