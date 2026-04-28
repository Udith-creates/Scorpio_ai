"""
Scraper routes
  POST /api/v1/scraper/scan   — trigger a platform scan for a registered content
  GET  /api/v1/scraper/{scan_id} — get scan job result
"""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

import core.firestore_client as db
from core.scraper import scan_platforms
from models.schemas import ScanRequest, ScanResult

router = APIRouter(prefix="/api/v1/scraper", tags=["Scraper"])


@router.post("/scan", response_model=ScanResult)
async def trigger_scan(req: ScanRequest):
    content = db.get_content_by_id(req.content_id)
    if not content:
        raise HTTPException(404, f"Content '{req.content_id}' not registered.")

    candidates = scan_platforms(
        content_id=req.content_id,
        content_title=content["title"],
        content_owner=content["owner"],
        keywords=req.search_keywords,
        platforms=req.platforms,
        max_results_per_platform=req.max_results_per_platform,
    )

    # Persist all detections
    for candidate in candidates:
        db.save_detection(candidate)

    scan_id = str(uuid.uuid4())
    scan_record = {
        "scan_id": scan_id,
        "content_id": req.content_id,
        "platforms_scanned": req.platforms,
        "keywords": req.search_keywords,
        "total_candidates_found": len(candidates),
        "detections_created": len(candidates),
        "scanned_at": datetime.now(timezone.utc).isoformat(),
    }
    db.save_scan_job(scan_record)

    return ScanResult(
        scan_id=scan_id,
        content_id=req.content_id,
        platforms_scanned=req.platforms,
        total_candidates_found=len(candidates),
        detections_created=len(candidates),
        message=f"Scan complete. {len(candidates)} potential infringements stored as detections.",
    )


@router.get("/{scan_id}")
async def get_scan(scan_id: str):
    scan = db.get_scan_job(scan_id)
    if not scan:
        raise HTTPException(404, "Scan job not found.")
    return scan
