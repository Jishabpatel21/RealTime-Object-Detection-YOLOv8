from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database import get_db
from app.api.deps import get_current_admin_user
from app.models.database import User, Detection, ModelConfig
from app.models.schemas import SystemStats, UserStats, ModelListResponse, ModelSwitchRequest
from app.core.config import settings
import psutil
import time

router = APIRouter()

startup_time = time.time()

@router.get("/stats", response_model=SystemStats)
async def get_system_stats(
    request: Request,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get system statistics (admin only)
    """
    total_users = db.query(func.count(User.id)).scalar()
    total_detections = db.query(func.count(Detection.id)).scalar()
    
    yolo_service = request.app.state.yolo_service
    
    uptime_seconds = time.time() - startup_time
    uptime_str = f"{int(uptime_seconds // 3600)}h {int((uptime_seconds % 3600) // 60)}m"
    
    return SystemStats(
        total_users=total_users,
        total_detections=total_detections,
        active_model=yolo_service.current_model,
        device=yolo_service.device,
        uptime=uptime_str
    )

@router.get("/users", response_model=List[UserStats])
async def get_users_stats(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get user statistics (admin only)
    """
    users = db.query(User).all()
    
    user_stats = []
    for user in users:
        detection_count = db.query(func.count(Detection.id))\
            .filter(Detection.user_id == user.id)\
            .scalar()
        
        last_detection_obj = db.query(Detection)\
            .filter(Detection.user_id == user.id)\
            .order_by(Detection.created_at.desc())\
            .first()
        
        user_stats.append(UserStats(
            user_id=user.id,
            username=user.username,
            total_detections=detection_count,
            last_detection=last_detection_obj.created_at if last_detection_obj else None
        ))
    
    return user_stats

@router.get("/models", response_model=ModelListResponse)
async def list_models(
    request: Request,
    current_admin: User = Depends(get_current_admin_user)
):
    """
    List all available YOLO models (admin only)
    """
    yolo_service = request.app.state.yolo_service
    available_models = yolo_service.list_available_models()
    
    model_info_list = []
    for model in available_models:
        model_info_list.append({
            "model_name": model["name"],
            "model_path": model["path"],
            "description": f"YOLOv8 model: {model['name']}",
            "is_active": model["is_current"],
            "classes_count": len(yolo_service.model.names) if model["is_current"] else 0,
            "classes": list(yolo_service.model.names.values()) if model["is_current"] else []
        })
    
    return ModelListResponse(
        models=model_info_list,
        current_model=yolo_service.current_model
    )

@router.post("/switch-model")
async def switch_model(
    request: Request,
    model_request: ModelSwitchRequest,
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Switch to a different YOLO model (admin only)
    """
    yolo_service = request.app.state.yolo_service
    
    try:
        result = yolo_service.load_model(model_request.model_name)
        return {
            "success": True,
            "message": f"Model switched to {model_request.model_name}",
            **result
        }
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Model file not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load model: {str(e)}")

@router.delete("/detection/{detection_id}")
async def delete_detection(
    detection_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Delete a detection record (admin only)
    """
    detection = db.query(Detection).filter(Detection.id == detection_id).first()
    
    if not detection:
        raise HTTPException(status_code=404, detail="Detection not found")
    
    # Delete associated files
    from pathlib import Path
    if detection.file_path and Path(detection.file_path).exists():
        Path(detection.file_path).unlink()
    if detection.result_path and Path(detection.result_path).exists():
        Path(detection.result_path).unlink()
    
    db.delete(detection)
    db.commit()
    
    return {"message": "Detection deleted successfully"}
