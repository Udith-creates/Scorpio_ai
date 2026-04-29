"""
Scorpio AI — Anti-Piracy Engine
FastAPI entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from api.routes import content, detections, scraper, analytics

app = FastAPI(
    title="Scorpio AI — Anti-Piracy Engine",
    description=(
        "Neural latent-space guardian for digital asset protection. "
        "Shifting anti-piracy from reactive metadata detection to proactive, "
        "AI-powered cognitive systems."
    ),
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(content.router)
app.include_router(detections.router)
app.include_router(scraper.router)
app.include_router(analytics.router)

# Serve Vite-built React frontend from frontend/dist/
_base = os.path.dirname(__file__)
_dist = os.path.join(_base, "frontend", "dist")
_assets = os.path.join(_dist, "assets")

if os.path.isdir(_dist):
    # Serve hashed JS/CSS/image bundles under /assets
    app.mount("/assets", StaticFiles(directory=_assets), name="assets")

    # SPA catch-all — any non-API path serves index.html so React Router works
    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        return FileResponse(os.path.join(_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {"status": "Scorpio AI Engine v2 — frontend not built", "docs": "/docs"}


@app.get("/health", tags=["System"])
def health():
    return {"status": "ok", "version": "2.0.0"}
