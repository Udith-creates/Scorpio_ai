"""
Platform Scraper
----------------
Searches platforms for potentially infringing content.
  - YouTube: uses YouTube Data API v3 (real)
  - Others: simulated (dailymotion, vimeo, twitter) for prototype demo
"""

import os
import uuid
import time
import random
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY", "")

_MOCK_PLATFORMS = {
    "dailymotion": "https://www.dailymotion.com/video/{id}",
    "vimeo": "https://vimeo.com/{id}",
    "twitter": "https://twitter.com/i/status/{id}",
    "facebook": "https://www.facebook.com/watch/?v={id}",
    "tiktok": "https://www.tiktok.com/@user/video/{id}",
}

_MOCK_REGIONS = ["US", "IN", "BR", "DE", "FR", "UK", "AU", "JP", "MX", "NG"]


def _search_youtube(keyword: str, max_results: int) -> List[Dict[str, Any]]:
    if not YOUTUBE_API_KEY:
        return []
    try:
        import urllib.request
        import urllib.parse
        import json
        q = urllib.parse.quote(keyword)
        url = (
            f"https://www.googleapis.com/youtube/v3/search"
            f"?part=snippet&q={q}&type=video&maxResults={max_results}"
            f"&key={YOUTUBE_API_KEY}"
        )
        with urllib.request.urlopen(url, timeout=10) as resp:
            data = json.loads(resp.read())
        results = []
        for item in data.get("items", []):
            vid_id = item["id"].get("videoId", "")
            snippet = item.get("snippet", {})
            results.append({
                "platform": "youtube",
                "url": f"https://www.youtube.com/watch?v={vid_id}",
                "title": snippet.get("title", "Unknown"),
                "channel": snippet.get("channelTitle", "Unknown"),
                "published_at": snippet.get("publishedAt", ""),
                "region": random.choice(_MOCK_REGIONS),
            })
        return results
    except Exception:
        return []


def _search_mock_platform(platform: str, keyword: str, max_results: int) -> List[Dict[str, Any]]:
    """Generates realistic-looking mock detections for demo purposes."""
    url_template = _MOCK_PLATFORMS.get(platform, "https://example.com/{id}")
    results = []
    n = random.randint(0, max_results)
    for _ in range(n):
        vid_id = random.randint(100_000_000, 999_999_999)
        results.append({
            "platform": platform,
            "url": url_template.format(id=vid_id),
            "title": f"{keyword} - {'[HD]' if random.random() > 0.5 else 'Full'} {'Official' if random.random() > 0.7 else 'Leaked'}",
            "channel": f"user_{random.randint(1000, 9999)}",
            "published_at": datetime.now(timezone.utc).isoformat(),
            "region": random.choice(_MOCK_REGIONS),
        })
    return results


def scan_platforms(
    content_id: str,
    content_title: str,
    content_owner: str,
    keywords: List[str],
    platforms: List[str],
    max_results_per_platform: int = 10,
) -> List[Dict[str, Any]]:
    """
    Scans all requested platforms.
    Returns a list of candidate detection dicts (not yet DNA-verified).
    """
    candidates = []

    for keyword in keywords:
        for platform in platforms:
            if platform == "youtube":
                found = _search_youtube(keyword, max_results_per_platform)
                if not found:
                    # Fallback mock if no API key
                    found = _search_mock_platform("youtube", keyword, max_results_per_platform)
            else:
                found = _search_mock_platform(platform, keyword, max_results_per_platform)

            for item in found:
                detection_id = str(uuid.uuid4())
                # Assign a random similarity score for demo (real flow would
                # download + DNA-compare each candidate, but that requires
                # video download which is out of scope for the scan endpoint)
                similarity = round(random.uniform(0.55, 0.99), 4)
                verdict = (
                    "piracy" if similarity > 0.90
                    else "inconclusive" if similarity > 0.75
                    else "fair_use"
                )

                candidates.append({
                    "detection_id": detection_id,
                    "content_id": content_id,
                    "content_title": content_title,
                    "content_owner": content_owner,
                    "suspect_url": item["url"],
                    "suspect_platform": item["platform"],
                    "suspect_title": item["title"],
                    "similarity_score": similarity,
                    "gemini_verdict": verdict,
                    "gemini_reasoning": (
                        f"Automated scan match on keyword '{keyword}'. "
                        f"Similarity: {similarity:.3f}."
                    ),
                    "status": "new",
                    "detected_at": datetime.now(timezone.utc).isoformat(),
                    "dmca_submitted_at": None,
                    "dmca_notice": None,
                    "region": item.get("region", "US"),
                })

    return candidates
