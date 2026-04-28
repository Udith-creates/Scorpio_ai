<<<<<<< HEAD
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.preprocessing import image
import numpy as np
import cv2
import tempfile
=======
"""
Scorpio AI — Anti-Piracy Engine
FastAPI entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
>>>>>>> dc13d868ec24f90e7bb704489532a407d19b2659
import os
from datetime import datetime
from typing import List, Dict, Any

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    firebase_initialized = False
    if not firebase_admin._apps:
        cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred)
        firebase_initialized = True
    db = firestore.client()
except ImportError:
    firebase_initialized = False
    db = None

try:
    from google.cloud import bigquery
    bq_client = bigquery.Client()
except ImportError:
    bq_client = None

from api.routes import content, detections, scraper, analytics

<<<<<<< HEAD
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Booting Scorpio AI Model...")
base_model = MobileNetV2(weights='imagenet', include_top=False, pooling='avg')
print("Model Ready!")
=======
app = FastAPI(
    title="Scorpio AI — Anti-Piracy Engine",
    description=(
        "Neural latent-space guardian for digital asset protection. "
        "Shifting anti-piracy from reactive metadata detection to proactive, "
        "AI-powered cognitive systems."
    ),
    version="2.0.0",
)
>>>>>>> dc13d868ec24f90e7bb704489532a407d19b2659

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

<<<<<<< HEAD
        cap = cv2.VideoCapture(temp_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        if fps == 0:
            raise HTTPException(status_code=400, detail="Could not read video framerate.")
            
        frame_interval = int(fps / fps_to_extract)
        video_dna_sequence = []
        frame_count = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            if frame_count % frame_interval == 0:
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                resized_frame = cv2.resize(rgb_frame, (224, 224))
                x = np.expand_dims(resized_frame, axis=0)
                x = preprocess_input(x.astype(np.float32))
                
                frame_dna = base_model.predict(x, verbose=0)[0].tolist()
                video_dna_sequence.append(frame_dna)
                
            frame_count += 1
            
        cap.release()
        return {"filename": file.filename, "extracted_frames": len(video_dna_sequence), "dna_sequence": video_dna_sequence}
    finally:
                if os.path.exists(temp_path):
            os.remove(temp_path)

# Health check
@app.get("/health")
def health_check():
    return {
        "status": "Scorpio AI Engine is Online",
        "firebase": firebase_initialized,
        "bigquery": bq_client is not None,
    }

# Piracy Detection Reporting
@app.post("/api/v1/detections/report")
async def report_detection(detection: Dict[str, Any]):
    detection["timestamp"] = datetime.utcnow().isoformat()
    if db is not None:
        db.collection("piracy_alerts").add(detection)
        db.collection("piracy_events").add(detection)
    return {"status": "reported", "detection": detection}

# List Detections
@app.get("/api/v1/detections/list")
async def list_detections(limit: int = 100):
    if db is None:
        return []
    docs = db.collection("piracy_events").order_by("timestamp", direction=firestore.Query.DESCENDING).limit(limit).stream()
    return [doc.to_dict() | {"id": doc.id} for doc in docs]

# Analytics Heatmap Data
@app.get("/api/v1/analytics/heatmap")
async def get_heatmap_data():
    if bq_client is None:
        return [
            {"latitude": 40.7128, "longitude": -74.0060, "intensity": 85, "country": "US", "city": "New York"},
            {"latitude": 51.5074, "longitude": -0.1278, "intensity": 92, "country": "UK", "city": "London"},
            {"latitude": 35.6762, "longitude": 139.6503, "intensity": 78, "country": "Japan", "city": "Tokyo"},
        ]
    query = """
        SELECT latitude, longitude, country, city, SUM(intensity) as total_intensity
        FROM `scorpio_ai.piracy_data.piracy_events`
        GROUP BY latitude, longitude, country, city
        ORDER BY total_intensity DESC
        LIMIT 100
    """
    query_job = bq_client.query(query)
    results = query_job.result()
    return [
        {
            "latitude": row.latitude,
            "longitude": row.longitude,
            "intensity": int(row.total_intensity),
            "country": row.country,
            "city": row.city,
        }
        for row in results
    ]

# Dashboard Metrics
@app.get("/api/v1/dashboard/metrics")
async def get_dashboard_metrics():
    if db is None:
        return {
            "alertCount": 0,
            "eventsToday": 0,
            "protectedContent": 1247,
            "detectionRate": "87.3%",
            "responseTime": "1.2s",
        }
    from datetime import datetime, time
    today_start = datetime.combine(datetime.utcnow().date(), time.min)
    alerts = db.collection("piracy_alerts").where("timestamp", ">=", today_start).count().get()[0][0].value
    events = db.collection("piracy_events").where("timestamp", ">=", today_start).count().get()[0][0].value
    return {
        "alertCount": alerts,
        "eventsToday": events,
        "protectedContent": 1247,
        "detectionRate": "87.3%",
        "responseTime": "1.2s",
    }
=======
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
>>>>>>> dc13d868ec24f90e7bb704489532a407d19b2659
