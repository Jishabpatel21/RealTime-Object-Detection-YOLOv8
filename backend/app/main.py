from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
import os
from pathlib import Path

from app.api.endpoints import detection, auth, admin
from app.core.config import settings
from app.database import engine, Base
from app.services.yolo_service import YOLOService

# Create database tables
Base.metadata.create_all(bind=engine)

# Create necessary directories
UPLOAD_DIR = Path("uploads")
RESULTS_DIR = Path("results")
UPLOAD_DIR.mkdir(exist_ok=True)
RESULTS_DIR.mkdir(exist_ok=True)

app = FastAPI(
    title="YOLOv8 Object Detection API",
    description="Professional AI-powered object detection web service",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static directories
app.mount("/results", StaticFiles(directory="results"), name="results")

# Include routers
app.include_router(detection.router, prefix="/api/predict", tags=["Detection"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

# Initialize YOLO service on startup
@app.on_event("startup")
async def startup_event():
    """Load YOLO model on startup"""
    try:
        yolo_service = YOLOService()
        yolo_service.load_model()
        app.state.yolo_service = yolo_service
        print(f"✅ YOLO model loaded successfully: {yolo_service.current_model}")
        print(f"✅ Device: {yolo_service.device}")
        print(f"✅ Classes: {len(yolo_service.model.names)}")
    except Exception as e:
        print(f"❌ Error loading YOLO model: {e}")
        raise

@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "YOLOv8 Object Detection API",
        "status": "active",
        "version": "1.0.0",
        "docs": "/api/docs"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model": app.state.yolo_service.current_model if hasattr(app.state, 'yolo_service') else None
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
