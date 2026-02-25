from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

# Detection Schemas
class DetectedObject(BaseModel):
    class_name: str
    confidence: float
    bbox: List[float]  # [x1, y1, x2, y2]

class DetectionRequest(BaseModel):
    confidence_threshold: Optional[float] = Field(0.25, ge=0.0, le=1.0)
    iou_threshold: Optional[float] = Field(0.45, ge=0.0, le=1.0)

class DetectionResponse(BaseModel):
    success: bool
    file_name: str
    file_type: str
    model_used: str
    objects_detected: List[DetectedObject]
    total_objects: int
    processing_time: float
    result_url: Optional[str] = None
    annotated_image: Optional[str] = None  # Base64 encoded for images

class DetectionHistory(BaseModel):
    id: int
    file_name: str
    file_type: str
    model_used: str
    total_objects: int
    processing_time: float
    created_at: datetime
    result_path: Optional[str]
    
    class Config:
        from_attributes = True

# Model Info Schemas
class ModelInfo(BaseModel):
    model_name: str
    model_path: str
    description: Optional[str]
    is_active: bool
    classes_count: int
    classes: List[str]

class ModelListResponse(BaseModel):
    models: List[ModelInfo]
    current_model: str

class ModelSwitchRequest(BaseModel):
    model_name: str

# Admin Schemas
class SystemStats(BaseModel):
    total_users: int
    total_detections: int
    active_model: str
    device: str
    uptime: str

class UserStats(BaseModel):
    user_id: int
    username: str
    total_detections: int
    last_detection: Optional[datetime]
    
    class Config:
        from_attributes = True
