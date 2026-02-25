from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Request, Form
from sqlalchemy.orm import Session
from pathlib import Path
import shutil
import time
from typing import Optional
import cv2
import numpy as np

from app.database import get_db
from app.api.deps import get_current_user
from app.models.database import User, Detection
from app.models.schemas import DetectionResponse, DetectedObject, DetectionHistory
from app.core.config import settings

router = APIRouter()

async def save_upload_file(upload_file: UploadFile, destination: Path) -> Path:
    """Save uploaded file to destination"""
    with destination.open("wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    return destination

@router.post("/image", response_model=DetectionResponse)
async def detect_image(
    request: Request,
    file: UploadFile = File(...),
    confidence: Optional[float] = Form(0.25),
    iou: Optional[float] = Form(0.45),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Detect objects in an uploaded image
    """
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in settings.ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {settings.ALLOWED_IMAGE_EXTENSIONS}"
        )
    
    # Save uploaded file
    timestamp = int(time.time())
    filename = f"{current_user.id}_{timestamp}_{file.filename}"
    file_path = settings.UPLOAD_DIR / filename
    await save_upload_file(file, file_path)
    
    try:
        # Get YOLO service from app state
        yolo_service = request.app.state.yolo_service
        
        # Perform detection
        detections, annotated_image, processing_time = yolo_service.detect_image(
            str(file_path),
            confidence=confidence,
            iou=iou
        )
        
        # Save annotated result
        result_filename = f"result_{filename}"
        result_path = settings.RESULTS_DIR / result_filename
        cv2.imwrite(str(result_path), annotated_image)
        
        # Encode annotated image to base64
        annotated_base64 = yolo_service.encode_image_to_base64(annotated_image)
        
        # Save detection to database
        detection_record = Detection(
            user_id=current_user.id,
            file_name=file.filename,
            file_type="image",
            file_path=str(file_path),
            result_path=str(result_path),
            model_used=yolo_service.current_model,
            confidence_threshold=confidence,
            objects_detected=[
                {
                    "class_name": d["class_name"],
                    "confidence": d["confidence"],
                    "bbox": d["bbox"]
                } for d in detections
            ],
            total_objects=len(detections),
            processing_time=processing_time
        )
        db.add(detection_record)
        db.commit()
        
        # Prepare response
        detected_objects = [
            DetectedObject(**d) for d in detections
        ]
        
        return DetectionResponse(
            success=True,
            file_name=file.filename,
            file_type="image",
            model_used=yolo_service.current_model,
            objects_detected=detected_objects,
            total_objects=len(detections),
            processing_time=processing_time,
            result_url=f"/results/{result_filename}",
            annotated_image=annotated_base64
        )
    
    except Exception as e:
        # Clean up files on error
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")

@router.post("/video", response_model=DetectionResponse)
async def detect_video(
    request: Request,
    file: UploadFile = File(...),
    confidence: Optional[float] = Form(0.25),
    iou: Optional[float] = Form(0.45),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Detect objects in an uploaded video
    """
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in settings.ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {settings.ALLOWED_VIDEO_EXTENSIONS}"
        )
    
    # Save uploaded file
    timestamp = int(time.time())
    filename = f"{current_user.id}_{timestamp}_{file.filename}"
    file_path = settings.UPLOAD_DIR / filename
    await save_upload_file(file, file_path)
    
    try:
        # Get YOLO service from app state
        yolo_service = request.app.state.yolo_service
        
        # Process video
        result_filename = f"result_{filename}"
        result_path = settings.RESULTS_DIR / result_filename
        
        frames_processed, processing_time = yolo_service.detect_video(
            str(file_path),
            str(result_path),
            confidence=confidence,
            iou=iou
        )
        
        # Save detection to database
        detection_record = Detection(
            user_id=current_user.id,
            file_name=file.filename,
            file_type="video",
            file_path=str(file_path),
            result_path=str(result_path),
            model_used=yolo_service.current_model,
            confidence_threshold=confidence,
            objects_detected=[],  # Video doesn't store individual detections in DB
            total_objects=frames_processed,
            processing_time=processing_time
        )
        db.add(detection_record)
        db.commit()
        
        return DetectionResponse(
            success=True,
            file_name=file.filename,
            file_type="video",
            model_used=yolo_service.current_model,
            objects_detected=[],
            total_objects=frames_processed,
            processing_time=processing_time,
            result_url=f"/results/{result_filename}",
            annotated_image=None
        )
    
    except Exception as e:
        # Clean up files on error
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Video processing failed: {str(e)}")

@router.get("/history", response_model=list[DetectionHistory])
async def get_detection_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50
):
    """
    Get detection history for current user
    """
    detections = db.query(Detection)\
        .filter(Detection.user_id == current_user.id)\
        .order_by(Detection.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return detections

@router.post("/webcam/frame", response_model=DetectionResponse)
async def detect_webcam_frame(
    request: Request,
    file: UploadFile = File(...),
    confidence: Optional[float] = Form(0.25),
    iou: Optional[float] = Form(0.45),
    current_user: User = Depends(get_current_user)
):
    """
    Detect objects in a webcam frame (streaming, no file save or DB record)
    """
    try:
        # Read image bytes directly from upload
        image_bytes = await file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image data")
        
        # Get YOLO service from app state
        yolo_service = request.app.state.yolo_service
        
        # Perform detection on frame (no file I/O)
        detections, processing_time = yolo_service.detect_frame_stream(
            frame,
            confidence=confidence,
            iou=iou
        )
        
        # Prepare response
        detected_objects = [
            DetectedObject(**d) for d in detections
        ]
        
        return DetectionResponse(
            success=True,
            file_name="webcam_frame",
            file_type="webcam",
            model_used=yolo_service.current_model,
            objects_detected=detected_objects,
            total_objects=len(detections),
            processing_time=processing_time,
            result_url=None,
            annotated_image=None
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")

@router.get("/model-info")
async def get_model_info(request: Request):
    """
    Get current YOLO model information
    """
    yolo_service = request.app.state.yolo_service
    model_info = yolo_service.get_model_info()
    
    if not model_info:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    return model_info
