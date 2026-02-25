# YOLOv8 Object Detection - Frontend

Modern React frontend with Tailwind CSS for YOLOv8 object detection web application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your backend API URL
```

3. Start development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

## Build for Production

```bash
npm run build
```

Built files will be in the `dist/` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/     # React components
│   ├── services/       # API services
│   ├── store/          # State management
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── public/             # Static assets
├── index.html          # HTML template
└── package.json
```

## Features

- 🎨 Modern dark AI theme
- 📱 Fully responsive design
- 🚀 Fast build with Vite
- 🎭 Smooth animations
- 🔐 JWT authentication
- 📊 Real-time detection results

## Environment Variables

```env
VITE_API_URL=http://localhost:8000
```

## Docker

Build and run:
```bash
docker build -t yolo-frontend .
docker run -p 3000:80 yolo-frontend
```
