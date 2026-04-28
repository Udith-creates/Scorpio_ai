"""
Content DNA Engine — extracts 1280-dim feature vectors from video frames
using MobileNetV2. Similarity is measured via cosine distance.
"""

import numpy as np
import cv2
import tempfile
import os
from scipy.spatial.distance import cosine
from typing import List, Tuple

# Lazy-load to avoid slow import at startup
_base_model = None


def _get_model():
    global _base_model
    if _base_model is None:
        from tensorflow.keras.applications import MobileNetV2
        from tensorflow.keras.applications.mobilenet_v2 import preprocess_input as _preprocess
        print("[DNA Engine] Loading MobileNetV2...")
        _base_model = MobileNetV2(weights="imagenet", include_top=False, pooling="avg")
        print("[DNA Engine] Model ready.")
    return _base_model


def _preprocess_frame(frame_rgb: np.ndarray) -> np.ndarray:
    from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
    resized = cv2.resize(frame_rgb, (224, 224))
    x = np.expand_dims(resized.astype(np.float32), axis=0)
    return preprocess_input(x)


def extract_video_dna(video_bytes: bytes, fps_to_extract: int = 1) -> Tuple[List[List[float]], int]:
    """
    Given raw video bytes, returns (dna_sequence, extracted_frame_count).
    dna_sequence is a list of 1280-dim float lists.
    """
    model = _get_model()

    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
        tmp.write(video_bytes)
        tmp_path = tmp.name

    try:
        cap = cv2.VideoCapture(tmp_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        if fps == 0:
            raise ValueError("Cannot read video framerate.")

        frame_interval = max(1, int(fps / fps_to_extract))
        dna_sequence: List[List[float]] = []
        frame_count = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            if frame_count % frame_interval == 0:
                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                x = _preprocess_frame(rgb)
                vec = model.predict(x, verbose=0)[0].tolist()
                dna_sequence.append(vec)
            frame_count += 1

        cap.release()
        return dna_sequence, len(dna_sequence)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def compare_dna_sequences(seq_a: List[List[float]], seq_b: List[List[float]]) -> Tuple[float, int]:
    """
    Compare two DNA sequences frame-by-frame.
    Returns (max_similarity_score, matched_frame_count).
    matched_frame_count = frames where similarity > 0.85.
    """
    if not seq_a or not seq_b:
        return 0.0, 0

    arr_a = np.array(seq_a)
    arr_b = np.array(seq_b)

    # Use the shorter sequence length so we don't go out of bounds
    min_len = min(len(arr_a), len(arr_b))
    scores = []
    for i in range(min_len):
        sim = 1.0 - cosine(arr_a[i], arr_b[i])
        scores.append(sim)

    # Also check global mean vector similarity (catches shifted/reordered piracy)
    global_sim = 1.0 - cosine(arr_a.mean(axis=0), arr_b.mean(axis=0))
    scores.append(global_sim)

    max_sim = float(np.max(scores))
    matched = int(np.sum(np.array(scores) > 0.85))
    return max_sim, matched
