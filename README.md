# YOLO Object Detection GUI

A professional desktop application for object detection using YOLOv8. Detect objects in images, videos, and live webcam feeds with an intuitive graphical interface.

## 🌟 Features

- 🖼️ **Image Detection** - Analyze images and identify objects with bounding boxes
- 🎥 **Video Processing** - Real-time object detection in video files
- 📹 **Webcam Support** - Live detection using your computer's camera
- 🔄 **Multiple Models** - Switch between different YOLOv8 models on the fly
- 📊 **Visual Results** - See detected objects with labels, confidence scores, and bounding boxes
- 🎨 **Modern UI** - Clean and intuitive graphical interface with dark theme
- ⚡ **Fast Processing** - Utilizes GPU acceleration when available

## 📋 Prerequisites

- Python 3.8 or higher
- Webcam (optional, only for live detection)
- GPU with CUDA support (optional, for faster processing)

## 📦 Installation

1. **Clone or download this repository** to your local machine

2. **Navigate to the project directory:**
```bash
cd "Project Model"
```

3. **Install required dependencies:**
```bash
pip install -r requirements.txt
```

This will install:
- ultralytics (YOLOv8)
- opencv-python (Computer vision)
- numpy (Numerical operations)
- torch & torchvision (Deep learning framework)
- Pillow (Image processing)
- flask & werkzeug (Web framework dependencies)

## 🚀 Running the Application

Simply run the main Python script:

```bash
python object_detection_gui.py
```

The GUI window will open automatically.

## 📖 How to Use

### 1. Image Detection

1. Click the **"📷 Upload Image"** button
2. Select an image file from your computer (JPG, PNG, BMP, etc.)
3. View the detected objects with bounding boxes and labels
4. Detection results are displayed in the bottom panel

### 2. Video Detection

1. Click the **"🎥 Upload Video"** button
2. Select a video file (MP4, AVI, MOV, MKV, etc.)
3. The video will play with real-time object detection
4. Click **"⏹ Stop"** button to stop video processing
5. Detection counts are shown in real-time

### 3. Webcam Detection

1. Click the **"📹 Start Webcam"** button
2. Allow camera access if prompted
3. Objects will be detected in real-time from your webcam feed
4. Click **"⏹ Stop"** button to stop the webcam
5. Live detection statistics are displayed

### 4. Switch Models

1. Click the **"🔄 Change Model"** button
2. Browse and select a different YOLOv8 model file (.pt)
3. The new model will load automatically
4. If you have an image displayed, it will be reprocessed with the new model

### 5. View Model Information

1. Click the **"ℹ️ Model Info"** button
2. See details about the currently loaded model
3. View the number of classes and all detectable object categories

## 📁 Project Structure

```
Project Model/
├── object_detection_gui.py    # Main GUI application
├── requirements.txt            # Python dependencies
├── yolov8n.pt                 # YOLOv8 Nano model (default, 80 classes)
├── yolov8s-oiv7.pt           # YOLOv8 Small model trained on Open Images (600+ classes)
├── yolov8m-worldv2.pt        # YOLOv8 Medium World model (advanced features)
└── README.md                  # This documentation
```

## 🎯 Included Models

### Default Model (Auto-loaded)
- **yolov8n.pt** - YOLOv8 Nano model
  - Size: ~6MB
  - Speed: Fastest
  - Classes: 80 common objects
  - Best for: Real-time detection, limited hardware

### Additional Models
- **yolov8s-oiv7.pt** - YOLOv8 Small trained on Open Images V7
  - Size: ~22MB
  - Classes: 600+ objects
  - Best for: Detecting a wider variety of objects

- **yolov8m-worldv2.pt** - YOLOv8 Medium World V2
  - Size: ~50MB
  - Advanced detection capabilities
  - Best for: High accuracy requirements

### Using Different Models
You can switch models anytime using the **"🔄 Change Model"** button in the GUI, or download additional YOLOv8 models from the [Ultralytics repository](https://github.com/ultralytics/ultralytics).

## 📊 Detectable Objects (Default Model)

The default YOLOv8n model can detect **80 common object categories**:

### People & Animals
Person, Dog, Cat, Horse, Bird, Cow, Sheep, Elephant, Bear, Zebra, Giraffe

### Vehicles
Car, Truck, Bus, Motorcycle, Bicycle, Airplane, Boat, Train

### Household Items
Chair, Couch, Bed, Dining Table, TV, Laptop, Mouse, Keyboard, Remote, Cell Phone

### Kitchen & Food
Bottle, Cup, Fork, Knife, Spoon, Bowl, Banana, Apple, Orange, Pizza, Cake, Carrot, Hot Dog, Sandwich, Broccoli

### Sports & Recreation
Sports Ball, Baseball Bat, Baseball Glove, Tennis Racket, Skateboard, Surfboard, Skis, Snowboard, Frisbee, Kite

### Accessories & Items
Backpack, Umbrella, Handbag, Tie, Suitcase, Book, Clock, Vase, Scissors, Teddy Bear, Hair Drier, Toothbrush

**And more!** Use the "ℹ️ Model Info" button in the GUI to see the complete list.

## ⚙️ Configuration

### Default Settings
- **Model:** yolov8n.pt (automatically loaded on startup)
- **Confidence Threshold:** 0.5 (50%)
- **Display:** Bounding boxes with labels and confidence scores

### Performance Tips
- **For Speed:** Use yolov8n.pt (nano model)
- **For Accuracy:** Use yolov8m-worldv2.pt (medium model)
- **For More Classes:** Use yolov8s-oiv7.pt (600+ objects)
- **GPU Acceleration:** Install CUDA for faster processing

## 🔧 Troubleshooting

### Application Won't Start
- **Solution:** Ensure all dependencies are installed
  ```bash
  pip install -r requirements.txt
  ```
- Verify Python version is 3.8 or higher: `python --version`

### Webcam Not Working
- **Solution:** Check camera permissions in your OS settings
- Ensure no other application is using the webcam
- Try closing and reopening the application

### Slow Detection Speed
- **Solution:** Switch to a lighter model (yolov8n.pt)
- Close other resource-intensive applications
- For videos, try processing at lower resolution
- Consider enabling GPU acceleration (requires CUDA)

### Model File Errors
- **Solution:** Ensure .pt files are not corrupted
- Re-download models from official Ultralytics sources
- Check that model files are in the project directory

### Import Errors
- **Solution:** Reinstall specific packages:
  ```bash
  pip install --upgrade ultralytics opencv-python torch
  ```

## 💡 Tips for Best Results

1. **Good Lighting:** Ensure proper lighting for better detection accuracy
2. **Image Quality:** Higher resolution images provide better results
3. **Object Size:** Objects should be clearly visible (not too small or distant)
4. **Camera Stability:** For webcam detection, keep the camera steady
5. **Model Selection:** Choose the right model for your use case
   - Quick tests → yolov8n.pt
   - Diverse objects → yolov8s-oiv7.pt
   - High accuracy → yolov8m-worldv2.pt

## 🖥️ System Requirements

### Minimum Requirements
- **OS:** Windows 10/11, macOS 10.14+, Linux
- **RAM:** 4GB
- **Processor:** Intel Core i3 or equivalent
- **Python:** 3.8 or higher

### Recommended Requirements
- **RAM:** 8GB or more
- **Processor:** Intel Core i5 or better
- **GPU:** NVIDIA GPU with CUDA support
- **Storage:** 500MB free space

## 🚀 Advanced Usage

### Using Custom Models
1. Download any YOLOv8 compatible .pt model
2. Place it in the project directory or any accessible location
3. Click "🔄 Change Model" in the GUI
4. Select your custom model file

### Batch Processing
For processing multiple files, use the GUI to:
1. Process an image/video
2. Save or analyze results
3. Load the next file
4. Repeat as needed

## 📝 Technical Details

- **Framework:** Ultralytics YOLOv8
- **GUI:** Tkinter (Python standard library)
- **Image Processing:** OpenCV, PIL
- **Deep Learning:** PyTorch
- **Interface:** Responsive with scrollable content

## 📞 Support & Resources

- **Ultralytics YOLOv8 Docs:** [https://docs.ultralytics.com](https://docs.ultralytics.com)
- **PyTorch Documentation:** [https://pytorch.org/docs](https://pytorch.org/docs)
- **OpenCV Documentation:** [https://docs.opencv.org](https://docs.opencv.org)

## 📄 License

This project uses open-source libraries and pre-trained models. Please refer to individual library licenses:
- Ultralytics YOLOv8: AGPL-3.0
- OpenCV: Apache 2.0
- PyTorch: BSD-style license

## 🎓 Learning Resources

To learn more about object detection and YOLOv8:
- [YOLOv8 Official Guide](https://docs.ultralytics.com/models/yolov8/)
- [Object Detection Basics](https://docs.ultralytics.com/tasks/detect/)
- [Model Training Tutorial](https://docs.ultralytics.com/modes/train/)

---

**Made with YOLOv8 🎯 | Enjoy detecting objects!**
