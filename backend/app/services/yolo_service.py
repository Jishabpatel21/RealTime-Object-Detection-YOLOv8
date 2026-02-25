from ultralytics import YOLO
import torch
import cv2
import numpy as np
from pathlib import Path
from typing import Optional, Tuple, List
import time
import base64

from app.core.config import settings

class YOLOService:
    def __init__(self):
        self.model: Optional[YOLO] = None
        self.current_model: str = settings.DEFAULT_MODEL
        self.device: str = "cuda" if torch.cuda.is_available() else "cpu"
        self.confidence_threshold: float = settings.CONFIDENCE_THRESHOLD
        self.iou_threshold: float = settings.IOU_THRESHOLD
        
    def load_model(self, model_path: Optional[str] = None):
        """Load YOLO model"""
        if model_path:
            self.current_model = model_path
        
        # Check if model file exists in models directory
        full_model_path = settings.MODELS_DIR / self.current_model
        
        # If not in models directory, check root directory (for existing models)
        if not full_model_path.exists():
            full_model_path = Path(self.current_model)
        
        if not full_model_path.exists():
            raise FileNotFoundError(f"Model file not found: {self.current_model}")
        
        self.model = YOLO(str(full_model_path))
        
        # Move model to appropriate device
        if self.device == "cuda":
            self.model.to('cuda')
        
        return {
            "model": self.current_model,
            "device": self.device,
            "classes": len(self.model.names)
        }
    
    def get_model_info(self) -> dict:
        """Get current model information"""
        if not self.model:
            return None
        
        return {
            "model_name": self.current_model,
            "device": self.device,
            "classes_count": len(self.model.names),
            "classes": list(self.model.names.values())
        }
    
    def detect_image(
        self,
        image_path: str,
        confidence: Optional[float] = None,
        iou: Optional[float] = None
    ) -> Tuple[List[dict], np.ndarray, float]:
        """
        Perform object detection on an image
        
        Returns:
            - List of detected objects with details
            - Annotated image as numpy array
            - Processing time
        """
        if not self.model:
            raise RuntimeError("Model not loaded")
        
        conf = confidence if confidence is not None else self.confidence_threshold
        iou_thresh = iou if iou is not None else self.iou_threshold
        
        start_time = time.time()
        
        # Read image
        image = cv2.imread(str(image_path))
        if image is None:
            raise ValueError(f"Could not read image: {image_path}")
        
        # Perform detection
        results = self.model.predict(
            image,
            conf=conf,
            iou=iou_thresh,
            verbose=False
        )[0]
        
        # Extract detections
        detections = []
        if results.boxes is not None:
            for box in results.boxes:
                cls_id = int(box.cls[0])
                confidence_score = float(box.conf[0])
                bbox = box.xyxy[0].cpu().numpy().tolist()
                
                detections.append({
                    "class_name": self.model.names[cls_id],
                    "confidence": confidence_score,
                    "bbox": bbox
                })
        
        # Get annotated image
        annotated_image = results.plot()
        
        processing_time = time.time() - start_time
        
        return detections, annotated_image, processing_time
    
    def detect_video(
        self,
        video_path: str,
        output_path: str,
        confidence: Optional[float] = None,
        iou: Optional[float] = None
    ) -> Tuple[int, float]:
        """
        Perform object detection on a video
        
        Returns:
            - Total frames processed
            - Processing time
        """
        if not self.model:
            raise RuntimeError("Model not loaded")
        
        conf = confidence if confidence is not None else self.confidence_threshold
        iou_thresh = iou if iou is not None else self.iou_threshold
        
        start_time = time.time()
        
        # Open video
        cap = cv2.VideoCapture(str(video_path))
        if not cap.isOpened():
            raise ValueError(f"Could not open video: {video_path}")
        
        # Get video properties
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Create video writer
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(str(output_path), fourcc, fps, (width, height))
        
        frame_count = 0
        
        try:
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Perform detection on frame
                results = self.model.predict(
                    frame,
                    conf=conf,
                    iou=iou_thresh,
                    verbose=False
                )[0]
                
                # Get annotated frame
                annotated_frame = results.plot()
                
                # Write frame
                out.write(annotated_frame)
                frame_count += 1
        
        finally:
            cap.release()
            out.release()
        
        processing_time = time.time() - start_time
        
        return frame_count, processing_time
    
    def detect_frame_stream(
        self,
        frame: np.ndarray,
        confidence: Optional[float] = None,
        iou: Optional[float] = None
    ) -> Tuple[List[dict], float]:
        """
        Perform object detection on a single frame for streaming (no file I/O)
        
        Returns:
            - List of detected objects with details
            - Processing time
        """
        if not self.model:
            raise RuntimeError("Model not loaded")
        
        conf = confidence if confidence is not None else self.confidence_threshold
        iou_thresh = iou if iou is not None else self.iou_threshold
        
        start_time = time.time()
        
        # Perform detection
        results = self.model.predict(
            frame,
            conf=conf,
            iou=iou_thresh,
            verbose=False
        )[0]
        
        # Extract detections
        detections = []
        if results.boxes is not None:
            for box in results.boxes:
                cls_id = int(box.cls[0])
                confidence_score = float(box.conf[0])
                bbox = box.xyxy[0].cpu().numpy().tolist()
                
                detections.append({
                    "class_name": self.model.names[cls_id],
                    "confidence": confidence_score,
                    "bbox": bbox
                })
        
        processing_time = time.time() - start_time
        
        return detections, processing_time

    @staticmethod
    def encode_image_to_base64(image: np.ndarray) -> str:
        """Encode image to base64 string"""
        _, buffer = cv2.imencode('.jpg', image)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        return f"data:image/jpeg;base64,{img_base64}"
    
    def list_available_models(self) -> List[dict]:
        """List all available YOLO models"""
        models = []
        
        # Check models directory
        for model_file in settings.MODELS_DIR.glob("*.pt"):
            models.append({
                "name": model_file.name,
                "path": str(model_file),
                "is_current": model_file.name == self.current_model
            })
        
        # Also check root directory for existing models
        for model_file in Path(".").glob("*.pt"):
            if not any(m["name"] == model_file.name for m in models):
                models.append({
                    "name": model_file.name,
                    "path": str(model_file),
                    "is_current": model_file.name == self.current_model
                })
        
        return models
