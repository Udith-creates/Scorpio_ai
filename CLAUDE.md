# CLAUDE.md — Scorpio AI: Neural Anti-Piracy Engine

> **Read this file at the start of every session.** It is the single source of truth for the Scorpio AI project. Do not guess at architecture, API structure, or deployment commands — all answers are here.

---

## Project Overview

**Scorpio AI** is a neural anti-piracy engine that shifts digital content protection from reactive metadata detection to proactive AI-powered cognitive fingerprinting.

- **Tagline:** Shifts anti-piracy from reactive metadata detection to proactive AI-powered cognitive systems
- **Competition:** Google Solution Challenge 2026
- **Team:** FAMILYGUYS | **Leader:** UDITH S NAIR
- **Problem Statement:** Digital Asset Protection — Protecting the Integrity of Digital Sports Media
- **SDGs Addressed:** SDG 8 (Decent Work & Economic Growth), SDG 9 (Industry, Innovation & Infrastructure), SDG 16 (Peace, Justice & Strong Institutions)

---

## Live Deployment

| Resource | Value |
|---|---|
| **Live URL** | https://scorpio-ai-service-c4vrwnrrqa-uc.a.run.app |
| **API Docs (Swagger)** | https://scorpio-ai-service-c4vrwnrrqa-uc.a.run.app/docs |
| **GCP Project ID** | `scorpio-ai-2026` |
| **Region** | `us-central1` |
| **Cloud Run Service** | `scorpio-ai-service` |
| **Artifact Registry** | `us-central1-docker.pkg.dev/scorpio-ai-2026/scorpio-repo/scorpio-ai` |
| **Firestore** | Native mode, free tier, `us-central1` |
| **Secret Manager** | `GEMINI_API_KEY` stored as a secret, injected at runtime |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **AI / ML** | TensorFlow MobileNetV2 (1280-dim DNA extraction), Google Gemini 1.5 Flash (piracy/fair-use classification), scipy cosine similarity |
| **Backend** | Python 3.11, FastAPI, uvicorn |
| **Compute** | Google Cloud Run (2 CPU, 2Gi RAM) |
| **Database** | Google Cloud Firestore (Native mode) |
| **Blockchain** | Keccak-256 hash anchoring — simulated Ethereum (mock tx for prototype) |
| **Scraper** | YouTube Data API v3 + mock scrapers for Dailymotion, Vimeo, Twitter, Facebook, TikTok |
| **Frontend** | Single-page HTML/JS/Tailwind CSS dashboard, served by FastAPI as static files |
| **Infrastructure** | Cloud Run, Artifact Registry, Cloud Build, Secret Manager |

---

## Project Structure

```
Scorpio_ai/
├── CLAUDE.md                  ← this file (single source of truth)
├── main.py                    ← FastAPI entry point; registers all routers, serves frontend
├── requirements.txt           ← all Python dependencies
├── Dockerfile                 ← Python 3.11-slim, installs OpenCV system deps
├── cloudbuild.yaml            ← GCP Cloud Build + Cloud Run deploy pipeline
├── .env                       ← local env vars (NOT committed to git)
├── .env.example               ← template for env vars
├── .gitignore
├── Scorpio.ipynb              ← original Phase 1 proof-of-concept notebook
├── Readme.md
├── models/
│   └── schemas.py             ← all Pydantic models (ContentRecord, Detection, MatchResponse, AnalyticsSummary, etc.)
├── core/
│   ├── dna_engine.py          ← MobileNetV2 DNA extraction + cosine similarity comparison
│   ├── blockchain.py          ← Keccak-256 content hash + simulated Ethereum anchoring
│   ├── firestore_client.py    ← all Firestore reads/writes (registered_content, detections, scan_jobs)
│   ├── gemini_analyzer.py     ← Gemini 1.5 Flash piracy/fair-use classifier with rule-based fallback
│   └── scraper.py             ← YouTube Data API v3 + mock platform scanner
├── api/
│   └── routes/
│       ├── content.py         ← POST /register, POST /match, GET /list, GET /{id}
│       ├── detections.py      ← GET /list, GET /{id}, POST /{id}/takedown, POST /{id}/dismiss
│       ├── scraper.py         ← POST /scan, GET /{scan_id}
│       └── analytics.py       ← GET /summary, GET /heatmap
└── frontend/
    └── index.html             ← full SPA dashboard (5 tabs: Register, Match/Scan, Detections, Analytics, Library)
```

---

## API Endpoints — Complete Reference

All endpoints are prefixed with the live base URL above.

### Health & Docs
```
GET  /                              → serves frontend index.html
GET  /health                        → {"status":"ok","version":"2.0.0"}
GET  /docs                          → FastAPI Swagger UI (auto-generated)
```

### Content (DNA Registration & Matching)
```
POST /api/v1/content/register       → upload video, extract DNA fingerprint, anchor to blockchain, store in Firestore
POST /api/v1/content/match          → upload suspect video, compare DNA against all registered content, run Gemini analysis
GET  /api/v1/content/list           → list all registered content (DNA vectors stripped from response)
GET  /api/v1/content/{id}           → fetch single content record by ID
```

### Detections
```
GET  /api/v1/detections/list        → list detections; filter by ?status=new|analyzed|dmca_submitted|dismissed
GET  /api/v1/detections/{id}        → fetch single detection record
POST /api/v1/detections/{id}/takedown → generate DMCA notice, update detection status to dmca_submitted
POST /api/v1/detections/{id}/dismiss  → mark detection as dismissed
```

### Scraper
```
POST /api/v1/scraper/scan           → deploy scraper fleet across selected platforms, store results as detections
GET  /api/v1/scraper/{scan_id}      → poll scan job status by ID
```

### Analytics
```
GET  /api/v1/analytics/summary      → aggregate stats: totals, verdicts, DMCA count, avg similarity, platform breakdown
GET  /api/v1/analytics/heatmap      → detections grouped by platform × region
```

---

## Firestore Collections

| Collection | Purpose |
|---|---|
| `registered_content` | DNA fingerprints and metadata for all registered videos |
| `detections` | All piracy detection events (manual match + scraper) |
| `scan_jobs` | Scraper scan records and their status |

### CRITICAL: Nested Array Constraint (Already Fixed)

**Firestore does NOT support nested arrays.** The DNA sequence (`List[List[float]]`) must NEVER be stored directly as a nested array in Firestore.

**The fix (already in place):**
- DNA is serialized to a JSON string and stored as `dna_sequence_json` (a plain string field)
- On read, `_deserialize_content()` in `core/firestore_client.py` deserializes it back to `List[List[float]]`

**Rule:** If you ever modify DNA storage or add new nested array fields, always serialize to JSON string first.

---

## Environment Variables

```bash
# Required
GCP_PROJECT_ID=scorpio-ai-2026      # Firestore project; required locally and on Cloud Run

# Injected from Secret Manager on Cloud Run; set manually in .env for local dev
GEMINI_API_KEY=...

# Optional — scraper falls back to mock data if not set
YOUTUBE_API_KEY=...
```

The `.env` file is gitignored. Use `.env.example` as the template.

---

## Local Development

### Prerequisites
- Python 3.11
- `gcloud` CLI authenticated
- `.env` file with `GEMINI_API_KEY` filled in

### Steps

```bash
# 1. Authenticate with GCP (run once; grants ADC for Firestore access)
gcloud auth application-default login --project=scorpio-ai-2026

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure env vars
cp .env.example .env
# Edit .env and fill in GEMINI_API_KEY (and optionally YOUTUBE_API_KEY)

# 4. Start the server
uvicorn main:app --reload --port 8000

# 5. Open the dashboard
open http://localhost:8000
# API docs at http://localhost:8000/docs
```

---

## Deploying to Cloud Run

Use `cloudbuild.yaml` to build, push, and deploy in one command via Cloud Build.

```bash
# Ensure gcloud is on PATH (macOS with Homebrew)
export PATH="/opt/homebrew/bin:/opt/homebrew/share/google-cloud-sdk/bin:$PATH"

# Navigate to project root
cd /Users/saipranav/Documents/GitHub/Scorpio_ai

# Submit build and deploy
gcloud builds submit \
  --config=cloudbuild.yaml \
  --project=scorpio-ai-2026 \
  --substitutions=COMMIT_SHA=$(git rev-parse --short HEAD) .
```

The build pipeline:
1. Builds the Docker image from `Dockerfile`
2. Pushes to Artifact Registry
3. Deploys to Cloud Run with `GEMINI_API_KEY` injected from Secret Manager

---

## GCP IAM Configuration (Already Configured)

Do not change these unless explicitly required.

| Service Account | Roles |
|---|---|
| Cloud Build SA (`658140031622@cloudbuild.gserviceaccount.com`) | `roles/run.admin`, `roles/iam.serviceAccountUser`, `roles/artifactregistry.writer`, `roles/secretmanager.secretAccessor` |
| Cloud Run SA (`658140031622-compute@developer.gserviceaccount.com`) | `roles/secretmanager.secretAccessor`, `roles/datastore.user` |
| Public access | `allUsers` has `roles/run.invoker` (service is publicly accessible) |

### Enabled GCP APIs

```
run.googleapis.com
firestore.googleapis.com
cloudbuild.googleapis.com
artifactregistry.googleapis.com
containerregistry.googleapis.com
aiplatform.googleapis.com
secretmanager.googleapis.com
youtube.googleapis.com
```

---

## How the DNA Engine Works

File: `core/dna_engine.py`

1. Video is uploaded and frames are extracted at 1 fps using OpenCV
2. Each frame is resized to 224x224 pixels
3. Each frame is passed through MobileNetV2 (pretrained, ImageNet weights) to produce a 1280-dimensional feature vector
4. The collection of frame vectors forms the "DNA fingerprint" of the video
5. The DNA is serialized to JSON string and stored in Firestore under `dna_sequence_json`
6. On a match request, the suspect video's DNA is extracted the same way
7. Cosine similarity is computed between suspect DNA and all registered DNA vectors using scipy
8. **Similarity thresholds:**
   - `> 0.75` — considered a match
   - `> 0.90` — likely piracy
9. The top matching result is passed to Gemini 1.5 Flash for classification

---

## How the Gemini Analyzer Works

File: `core/gemini_analyzer.py`

- Input: top match result (similarity score, metadata, context)
- Output: one of `piracy` | `fair_use` | `inconclusive`
- Falls back to rule-based classification if the Gemini API call fails
- Rule-based fallback: similarity > 0.90 → `piracy`, 0.75-0.90 → `inconclusive`, < 0.75 → `fair_use`

---

## How the Blockchain Vault Works

File: `core/blockchain.py`

- The mean DNA vector is computed and quantized to 4 decimal places (for determinism)
- A Keccak-256 hash is generated from the quantized mean vector
- A simulated Ethereum transaction is created (mock for prototype demo)
- **For production:** replace `_simulate_eth_transaction()` with a real `web3.py` call to a deployed Solidity contract

---

## How the Scraper Works

File: `core/scraper.py`

- **YouTube:** Uses YouTube Data API v3 (requires `YOUTUBE_API_KEY` in env); falls back to mock data if the key is missing or the API call fails
- **Other platforms (Dailymotion, Vimeo, Twitter, Facebook, TikTok):** Mock scraper generates realistic-looking detections for demo purposes
- Each detection gets a similarity score and is stored as a record in the Firestore `detections` collection
- Scan jobs are tracked in the `scan_jobs` collection and can be polled via `GET /api/v1/scraper/{scan_id}`

---

## Frontend Dashboard

File: `frontend/index.html`

Single-page application served directly by FastAPI. Five tabs:

| Tab | Functionality |
|---|---|
| **Register Content** | Drag-and-drop video upload; extracts DNA fingerprint; displays blockchain content hash and transaction hash |
| **Match / Scan** | Two modes: (1) manual DNA match by uploading a suspect video; (2) platform scraper — select registered content, enter keywords, choose platforms |
| **Detections** | Filterable list of all detections with verdict badges (piracy/fair_use/inconclusive); DMCA button triggers takedown flow; Dismiss button marks as dismissed |
| **Analytics** | Verdict donut chart, platform bar chart, platform-by-region heatmap |
| **Library** | All registered content with content hash and blockchain tx hash; "Scan for Piracy" shortcut button |

---

## Data Models (Pydantic Schemas)

File: `models/schemas.py`

Key models:
- `ContentRecord` — registered video with DNA fingerprint, content hash, blockchain tx hash
- `Detection` — a detected piracy event linking a registered content record to a suspect URL
- `MatchResponse` — result of a manual DNA match including similarity score and Gemini verdict
- `AnalyticsSummary` — aggregate stats for the analytics tab

---

## Deployment History

| Tag | Description |
|---|---|
| `v2-initial` | First full build: DNA engine + Firestore + Gemini + scraper + frontend |
| `v2-fix-firestore` | Fixed Firestore nested array bug (`dna_sequence` → `dna_sequence_json`) |
| `v2-bugfixes` | Fixed `urllib.parse` import order, `region` field in schema, inconclusive count, XSS escaping, fetch error handling |

---

## Remaining Work (For Submission)

These items are not yet complete as of the project's current state:

1. **Local ADC** — run `gcloud auth application-default login` once per machine for local Firestore access
2. **YouTube API Key** — add real `YOUTUBE_API_KEY` to `.env` to enable live YouTube scraping
3. **Presentation** — fill PPT slides 2-10 with screenshots, architecture diagram, and feature list
4. **Demo Video** — record 3-minute walkthrough demo
5. **Production Blockchain** — replace mock `_simulate_eth_transaction()` in `core/blockchain.py` with real `web3.py` integration and a deployed Solidity contract

---

## MCP Servers

| Server | Status |
|---|---|
| Google Stitch MCP (`https://stitch.googleapis.com/mcp`) | Connected (HTTP, user-level) |
| Google Drive MCP | Needs authentication |
| Vercel MCP | Needs authentication |

---

## Key Rules for Claude Sessions

1. **Never store nested arrays directly to Firestore.** Always serialize to JSON string. See `core/firestore_client.py` `_deserialize_content()`.
2. **All Pydantic models live in `models/schemas.py`.** Do not define schemas inline in route files.
3. **All Firestore operations go through `core/firestore_client.py`.** Do not import Firestore directly into routes.
4. **The frontend is a single static file at `frontend/index.html`.** It is served by FastAPI — do not add a separate frontend server or build step.
5. **Do not commit `.env`** — it is gitignored. Use `.env.example` for documentation.
6. **The blockchain is a mock** — do not attempt to make real Ethereum calls in the prototype. The production path is documented in `core/blockchain.py`.
7. **Gemini API key is in Secret Manager on Cloud Run** — never hardcode it. Locally it comes from `.env`.
8. **Cloud Run is publicly accessible** — `allUsers` has invoker role. This is intentional for the competition demo.
