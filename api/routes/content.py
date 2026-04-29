"""
Content routes
  POST /api/v1/content/register  — register video + anchor to blockchain
  POST /api/v1/content/match     — match suspect video against registered DB
  GET  /api/v1/content/list      — list all registered content
  GET  /api/v1/content/{id}      — get single content record
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from core.dna_engine import extract_video_dna, compare_dna_sequences
from core.blockchain import anchor_to_blockchain
from core.gemini_analyzer import analyze_match
import core.firestore_client as db
from models.schemas import (
    ContentRegisterResponse,
    ContentRecord,
    MatchResponse,
    MatchResult,
    GeminiVerdict,
)

router = APIRouter(prefix="/api/v1/content", tags=["Content"])

_ALLOWED_EXTS = (".mp4", ".avi", ".mov", ".mkv", ".webm")


def _validate_video(file: UploadFile) -> None:
    if not any(file.filename.lower().endswith(ext) for ext in _ALLOWED_EXTS):
        raise HTTPException(400, f"Unsupported file type. Allowed: {_ALLOWED_EXTS}")


# ── Register ──────────────────────────────────────────────────────────────────

@router.post("/register", response_model=ContentRegisterResponse)
async def register_content(
    file: UploadFile = File(...),
    title: str = Form(...),
    owner: str = Form(...),
    platform: Optional[str] = Form(None),
    fps_to_extract: int = Form(1),
):
    """Upload a video to register it. Extracts DNA and anchors hash to blockchain."""
    _validate_video(file)

    video_bytes = await file.read()
    dna_sequence, extracted_frames = extract_video_dna(video_bytes, fps_to_extract)

    if not dna_sequence:
        raise HTTPException(422, "Could not extract any frames from the video.")

    content_id = str(uuid.uuid4())
    chain_info = anchor_to_blockchain(dna_sequence, title=title, content_id=content_id)

    db.save_content(
        content_id=content_id,
        title=title,
        owner=owner,
        platform=platform,
        dna_sequence=dna_sequence,
        extracted_frames=extracted_frames,
        dna_dimensions=len(dna_sequence[0]),
        blockchain_hash=chain_info["content_hash"],
        tx_hash=chain_info["tx_hash"],
    )

    return ContentRegisterResponse(
        content_id=content_id,
        title=title,
        owner=owner,
        extracted_frames=extracted_frames,
        dna_dimensions=len(dna_sequence[0]),
        blockchain_hash=chain_info["content_hash"],
        tx_hash=chain_info["tx_hash"],
        block_number=chain_info.get("block_number"),
        network=chain_info.get("network"),
        real_chain=chain_info.get("real_chain", False),
        registered_at=datetime.now(timezone.utc).isoformat(),
    )


# ── Match ─────────────────────────────────────────────────────────────────────

@router.post("/match", response_model=MatchResponse)
async def match_content(
    file: UploadFile = File(...),
    fps_to_extract: int = Form(1),
    similarity_threshold: float = Form(0.75),
    suspect_title: Optional[str] = Form(None),
    suspect_platform: Optional[str] = Form(None),
    suspect_url: Optional[str] = Form(None),
):
    """Upload a suspect video and compare it against all registered fingerprints."""
    _validate_video(file)

    video_bytes = await file.read()
    suspect_dna, suspect_frames = extract_video_dna(video_bytes, fps_to_extract)

    if not suspect_dna:
        raise HTTPException(422, "Could not extract frames from suspect video.")

    all_content = db.get_all_content()
    matches = []

    for record in all_content:
        registered_dna = record.get("dna_sequence", [])
        if not registered_dna:
            continue
        sim, matched_frames = compare_dna_sequences(suspect_dna, registered_dna)
        if sim >= similarity_threshold:
            matches.append(
                MatchResult(
                    content_id=record["content_id"],
                    title=record["title"],
                    owner=record["owner"],
                    similarity_score=round(sim, 4),
                    matched_frames=matched_frames,
                    total_frames=suspect_frames,
                )
            )

    matches.sort(key=lambda m: m.similarity_score, reverse=True)
    top = matches[0] if matches else None

    gemini_verdict = GeminiVerdict.PENDING
    gemini_reasoning = None
    detection_id = None

    if top:
        analysis = analyze_match(
            original_title=top.title,
            original_owner=top.owner,
            similarity_score=top.similarity_score,
            matched_frames=top.matched_frames,
            total_frames=top.total_frames,
            suspect_title=suspect_title,
            suspect_platform=suspect_platform,
            suspect_url=suspect_url,
        )
        gemini_verdict = GeminiVerdict(analysis["verdict"])
        gemini_reasoning = analysis["reasoning"]

        # Persist as a detection
        detection_id = str(uuid.uuid4())
        db.save_detection({
            "detection_id": detection_id,
            "content_id": top.content_id,
            "content_title": top.title,
            "content_owner": top.owner,
            "suspect_url": suspect_url,
            "suspect_platform": suspect_platform or "manual_upload",
            "suspect_title": suspect_title,
            "similarity_score": top.similarity_score,
            "gemini_verdict": gemini_verdict.value,
            "gemini_reasoning": gemini_reasoning,
            "status": "analyzed",
            "detected_at": datetime.now(timezone.utc).isoformat(),
            "dmca_submitted_at": None,
            "dmca_notice": None,
            "region": "unknown",
        })

    return MatchResponse(
        suspect_filename=file.filename,
        extracted_frames=suspect_frames,
        matches=matches,
        top_match=top,
        gemini_verdict=gemini_verdict,
        gemini_reasoning=gemini_reasoning,
        detection_id=detection_id,
    )


# ── List + Get ────────────────────────────────────────────────────────────────

@router.get("/list")
async def list_content():
    records = db.get_all_content()
    # Strip bulky DNA before returning
    for r in records:
        r.pop("dna_sequence", None)
    return {"total": len(records), "content": records}


@router.get("/{content_id}")
async def get_content(content_id: str):
    record = db.get_content_by_id(content_id)
    if not record:
        raise HTTPException(404, "Content not found.")
    record.pop("dna_sequence", None)
    return record
