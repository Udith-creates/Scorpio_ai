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

# Serve frontend static files
frontend_dir = os.path.join(os.path.dirname(__file__), "frontend")
if os.path.isdir(frontend_dir):
    app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

    @app.get("/", include_in_schema=False)
    async def serve_frontend():
        return FileResponse(os.path.join(frontend_dir, "index.html"))
else:
    @app.get("/")
    def root():
        return {"status": "Scorpio AI Engine v2 Online", "docs": "/docs"}


@app.get("/health", tags=["System"])
def health():
    return {"status": "ok", "version": "2.0.0"}
