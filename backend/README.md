# YOLOv8 Object Detection - Backend API

Professional FastAPI backend for YOLOv8 object detection web application.

## Setup

1. Create virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your settings
```

4. Copy YOLO models:
Place your YOLOv8 model files (*.pt) in the `models/` directory or root directory.

5. Run the server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

6. Initialize admin user (first time only):
Visit: http://localhost:8000/api/auth/init-admin

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## Project Structure

```
backend/
├── app/
│   ├── api/            # API endpoints
│   ├── core/           # Core configurations
│   ├── models/         # Database & Pydantic models
│   ├── services/       # Business logic
│   ├── database.py     # Database setup
│   └── main.py         # FastAPI application
├── models/             # YOLO model files
├── uploads/            # Uploaded files
├── results/            # Detection results
└── requirements.txt
```

## Environment Variables

See `.env.example` for all available configuration options.

## Docker

Build and run:
```bash
docker build -t yolo-backend .
docker run -p 8000:8000 yolo-backend
```
