"""
Analytics routes
  GET /api/v1/analytics/summary  — aggregate stats
  GET /api/v1/analytics/heatmap  — detections by platform + region
"""

from collections import defaultdict
from fastapi import APIRouter

import core.firestore_client as db
from models.schemas import AnalyticsSummary, HeatmapEntry, PlatformStat

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
async def get_summary():
    content_records = db.get_all_content()
    detections = db.get_all_detections(limit=1000)

    piracy = sum(1 for d in detections if d.get("gemini_verdict") == "piracy")
    fair_use = sum(1 for d in detections if d.get("gemini_verdict") == "fair_use")
    inconclusive = sum(1 for d in detections if d.get("gemini_verdict") == "inconclusive")
    dmca = sum(1 for d in detections if d.get("status") == "dmca_submitted")

    scores = [d.get("similarity_score", 0) for d in detections if d.get("similarity_score")]
    avg_score = round(sum(scores) / len(scores), 4) if scores else 0.0

    platform_counts: dict = defaultdict(lambda: {"count": 0, "dmca": 0})
    for d in detections:
        p = d.get("suspect_platform", "unknown")
        platform_counts[p]["count"] += 1
        if d.get("status") == "dmca_submitted":
            platform_counts[p]["dmca"] += 1

    platform_breakdown = [
        PlatformStat(platform=p, detection_count=v["count"], dmca_count=v["dmca"])
        for p, v in sorted(platform_counts.items(), key=lambda x: -x[1]["count"])
    ]

    return AnalyticsSummary(
        total_registered_content=len(content_records),
        total_detections=len(detections),
        piracy_confirmed=piracy,
        fair_use_cleared=fair_use,
        inconclusive_count=inconclusive,
        dmca_submitted=dmca,
        avg_similarity_score=avg_score,
        platform_breakdown=platform_breakdown,
    )


@router.get("/heatmap")
async def get_heatmap():
    detections = db.get_all_detections(limit=1000)

    heat: dict = defaultdict(int)
    for d in detections:
        platform = d.get("suspect_platform", "unknown")
        region = d.get("region", "US")
        heat[(platform, region)] += 1

    entries = [
        HeatmapEntry(platform=p, region=r, count=c)
        for (p, r), c in sorted(heat.items(), key=lambda x: -x[1])
    ]
    return {"heatmap": [e.dict() for e in entries]}
