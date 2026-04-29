## ── Stage 1: Build React frontend ─────────────────────────────────────────
FROM node:20-slim AS frontend-builder

WORKDIR /app/frontend

# Install dependencies first (layer-cached unless package.json changes)
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copy source and build
COPY frontend/ ./
RUN npm run build
# Output is at /app/frontend/dist


## ── Stage 2: Python API server ─────────────────────────────────────────────
FROM python:3.11-slim

# System dependencies for OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libglib2.0-0 libsm6 libxrender1 libxext6 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY main.py .
COPY api/ api/
COPY core/ core/
COPY models/ models/

# Copy the built React bundle from stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

ENV PORT=8080

CMD exec uvicorn main:app --host 0.0.0.0 --port ${PORT} --workers 1
