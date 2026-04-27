from fastapi import FastAPI, UploadFile, File, HTTPException
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.preprocessing import image
import numpy as np
import cv2
import tempfile
import os

app = FastAPI(title="Scorpio AI Engine")

print("Booting Scorpio AI Model...")
base_model = MobileNetV2(weights='imagenet', include_top=False, pooling='avg')
print("Model Ready!")

@app.get("/")
def read_root():
    return {"status": "Scorpio AI Engine is Online"}

@app.post("/extract/video/")
async def extract_video_dna_endpoint(file: UploadFile = File(...), fps_to_extract: int = 1):
    if not file.filename.endswith(('.mp4', '.avi', '.mov')):
        raise HTTPException(status_code=400, detail="Invalid file type. Send a video.")
    
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_file:
            temp_file.write(await file.read())
            temp_path = temp_file.name

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