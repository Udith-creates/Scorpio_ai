from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class GeminiVerdict(str, Enum):
    PIRACY = "piracy"
    FAIR_USE = "fair_use"
    INCONCLUSIVE = "inconclusive"
    PENDING = "pending"


class DetectionStatus(str, Enum):
    NEW = "new"
    ANALYZED = "analyzed"
    DMCA_SUBMITTED = "dmca_submitted"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


# --- Content Registration ---

class ContentRegisterResponse(BaseModel):
    content_id: str
    title: str
    owner: str
    extracted_frames: int
    dna_dimensions: int
    blockchain_hash: str
    tx_hash: str
    registered_at: str


class ContentRecord(BaseModel):
    content_id: str
    title: str
    owner: str
    platform: Optional[str] = None
    extracted_frames: int
    dna_dimensions: int
    blockchain_hash: str
    tx_hash: str
    registered_at: str


# --- DNA Matching ---

class MatchResult(BaseModel):
    content_id: str
    title: str
    owner: str
    similarity_score: float
    matched_frames: int
    total_frames: int


class MatchResponse(BaseModel):
    suspect_filename: str
    extracted_frames: int
    matches: List[MatchResult]
    top_match: Optional[MatchResult] = None
    gemini_verdict: GeminiVerdict = GeminiVerdict.PENDING
    gemini_reasoning: Optional[str] = None
    detection_id: Optional[str] = None


# --- Detections ---

class Detection(BaseModel):
    detection_id: str
    content_id: str
    content_title: str
    content_owner: str
    suspect_url: Optional[str] = None
    suspect_platform: str
    suspect_title: Optional[str] = None
    similarity_score: float
    gemini_verdict: GeminiVerdict
    region: str = "US"
    gemini_reasoning: Optional[str] = None
    status: DetectionStatus
    detected_at: str
    dmca_submitted_at: Optional[str] = None
    dmca_notice: Optional[str] = None


class TakedownResponse(BaseModel):
    detection_id: str
    status: DetectionStatus
    dmca_notice: str
    submitted_at: str


# --- Scraper ---

class ScanRequest(BaseModel):
    content_id: str
    search_keywords: List[str]
    platforms: List[str] = Field(default=["youtube", "dailymotion", "vimeo", "twitter"])
    max_results_per_platform: int = Field(default=10, le=50)


class ScanResult(BaseModel):
    scan_id: str
    content_id: str
    platforms_scanned: List[str]
    total_candidates_found: int
    detections_created: int
    message: str


# --- Analytics ---

class PlatformStat(BaseModel):
    platform: str
    detection_count: int
    dmca_count: int


class AnalyticsSummary(BaseModel):
    total_registered_content: int
    total_detections: int
    piracy_confirmed: int
    fair_use_cleared: int
    inconclusive_count: int
    dmca_submitted: int
    avg_similarity_score: float
    platform_breakdown: List[PlatformStat]


class HeatmapEntry(BaseModel):
    platform: str
    region: str
    count: int
