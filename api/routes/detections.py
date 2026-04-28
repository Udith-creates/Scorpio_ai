"""
Detections routes
  GET  /api/v1/detections/list        — all detections
  GET  /api/v1/detections/{id}        — single detection
  POST /api/v1/detections/{id}/takedown — file DMCA, generate notice
  POST /api/v1/detections/{id}/dismiss  — mark dismissed
"""

from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException

import core.firestore_client as db
from models.schemas import Detection, DetectionStatus, TakedownResponse

router = APIRouter(prefix="/api/v1/detections", tags=["Detections"])


def _build_dmca_notice(detection: dict) -> str:
    now = datetime.now(timezone.utc).strftime("%B %d, %Y")
    return f"""DMCA TAKEDOWN NOTICE
Date: {now}

To Whom It May Concern at {detection.get('suspect_platform', 'Platform').title()},

I am the copyright owner (or authorized agent) of the following work:

  Original Title : {detection.get('content_title', 'N/A')}
  Rights Holder  : {detection.get('content_owner', 'N/A')}
  Blockchain Hash: Verified on-chain (Scorpio AI Vault)

I have a good-faith belief that the material at the following URL infringes
my copyright:

  {detection.get('suspect_url', 'URL not available')}
  Title: {detection.get('suspect_title', 'Unknown')}
  Similarity Score: {detection.get('similarity_score', 0):.1%} (AI-verified)
  AI Verdict: {detection.get('gemini_verdict', 'piracy').upper()}

I request that you immediately remove or disable access to this infringing content.

I declare, under penalty of perjury, that this notification is accurate and
that I am authorized to act on behalf of the copyright owner.

Electronically signed,
{detection.get('content_owner', 'Rights Holder')}
[via Scorpio AI Anti-Piracy Platform]
"""


@router.get("/list")
async def list_detections(limit: int = 50, status: str = None):
    detections = db.get_all_detections(limit=limit)
    if status:
        detections = [d for d in detections if d.get("status") == status]
    return {"total": len(detections), "detections": detections}


@router.get("/{detection_id}")
async def get_detection(detection_id: str):
    detection = db.get_detection_by_id(detection_id)
    if not detection:
        raise HTTPException(404, "Detection not found.")
    return detection


@router.post("/{detection_id}/takedown", response_model=TakedownResponse)
async def file_takedown(detection_id: str):
    detection = db.get_detection_by_id(detection_id)
    if not detection:
        raise HTTPException(404, "Detection not found.")
    if detection.get("status") == DetectionStatus.DMCA_SUBMITTED:
        raise HTTPException(409, "DMCA already submitted for this detection.")

    notice = _build_dmca_notice(detection)
    now = datetime.now(timezone.utc).isoformat()

    db.update_detection(detection_id, {
        "status": DetectionStatus.DMCA_SUBMITTED.value,
        "dmca_submitted_at": now,
        "dmca_notice": notice,
    })

    return TakedownResponse(
        detection_id=detection_id,
        status=DetectionStatus.DMCA_SUBMITTED,
        dmca_notice=notice,
        submitted_at=now,
    )


@router.post("/{detection_id}/dismiss")
async def dismiss_detection(detection_id: str):
    detection = db.get_detection_by_id(detection_id)
    if not detection:
        raise HTTPException(404, "Detection not found.")
    db.update_detection(detection_id, {"status": DetectionStatus.DISMISSED.value})
    return {"detection_id": detection_id, "status": DetectionStatus.DISMISSED}
