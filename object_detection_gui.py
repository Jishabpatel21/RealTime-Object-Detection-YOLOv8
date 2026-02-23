from ultralytics import YOLO
import cv2
import tkinter as tk
from tkinter import filedialog, ttk, messagebox
from PIL import Image, ImageTk
import threading
import os

class ObjectDetectionGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("YOLO Object Detection System")
        self.root.geometry("1200x850")
        self.root.configure(bg='#2b2b2b')
        
        # Load YOLO model
        self.model = None
        self.model_path = 'yolov8n.pt'  # Default model
        self.current_video_capture = None
        self.video_running = False
        self.current_image_path = None  # Store current image for reprocessing
        
        # Create GUI components first
        self.create_widgets()
        
        # Initialize model in background after GUI is created (no reprocessing on initial load)
        threading.Thread(target=self.load_model, args=(None, False), daemon=True).start()
        
    def load_model(self, model_path=None, reprocess=True):
        """Load YOLO model in background"""
        try:
            if model_path:
                self.model_path = model_path
            
            self.status_label.config(text=f"Loading model: {os.path.basename(self.model_path)}...")
            self.model = YOLO(self.model_path)
            
            num_classes = len(self.model.names)
            self.status_label.config(
                text=f"✅ Model loaded: {os.path.basename(self.model_path)} ({num_classes} classes)"
            )
            
            # Reprocess current image with new model if exists
            if reprocess and self.current_image_path and os.path.exists(self.current_image_path):
                self.status_label.config(text=f"Reprocessing with new model...")
                self.process_image(self.current_image_path)
            # Update status if webcam/video is running
            elif self.video_running:
                model_name = os.path.basename(self.model_path)
                self.status_label.config(text=f"Webcam running... | Model: {model_name}")
        except Exception as e:
            self.status_label.config(text=f"❌ Error loading model: {str(e)}")
    
    def create_widgets(self):
        # Status bar (fixed at bottom)
        self.status_label = tk.Label(
            self.root,
            text="Initializing...",
            font=('Arial', 10),
            bg='#1e1e1e',
            fg='#00ff00',
            anchor='w',
            padx=10,
            pady=5
        )
        self.status_label.pack(side=tk.BOTTOM, fill=tk.X)
        
        # Create main canvas for whole page scrolling
        main_canvas = tk.Canvas(self.root, bg='#2b2b2b', highlightthickness=0)
        main_scrollbar = tk.Scrollbar(self.root, orient=tk.VERTICAL, command=main_canvas.yview)
        self.scrollable_frame = tk.Frame(main_canvas, bg='#2b2b2b')
        
        self.scrollable_frame.bind(
            '<Configure>',
            lambda e: main_canvas.configure(scrollregion=main_canvas.bbox('all'))
        )
        
        main_canvas.create_window((0, 0), window=self.scrollable_frame, anchor='nw')
        main_canvas.configure(yscrollcommand=main_scrollbar.set)
        
        # Bind mouse wheel scrolling to entire window
        def _on_mousewheel(event):
            main_canvas.yview_scroll(int(-1 * (event.delta / 120)), 'units')
        
        # Bind to all widgets
        self.root.bind_all('<MouseWheel>', _on_mousewheel)
        
        # Pack canvas and scrollbar
        main_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        main_canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        # Title
        title_frame = tk.Frame(self.scrollable_frame, bg='#2b2b2b')
        title_frame.pack(pady=15)
        
        title_label = tk.Label(
            title_frame,
            text="🎯 YOLO Object Detection System",
            font=('Arial', 24, 'bold'),
            bg='#2b2b2b',
            fg='#00ff00'
        )
        title_label.pack()
        
        subtitle_label = tk.Label(
            title_frame,
            text="AI-Powered Object Detection",
            font=('Arial', 10),
            bg='#2b2b2b',
            fg='#888888'
        )
        subtitle_label.pack()
        
        # Button frame
        button_frame = tk.Frame(self.scrollable_frame, bg='#2b2b2b')
        button_frame.pack(pady=10)
        
        # Row 1: Main action buttons
        # Upload Image Button
        self.upload_image_btn = tk.Button(
            button_frame,
            text="📷 Upload Image",
            command=self.upload_image,
            font=('Arial', 11, 'bold'),
            bg='#4CAF50',
            fg='white',
            padx=15,
            pady=10,
            cursor='hand2'
        )
        self.upload_image_btn.grid(row=0, column=0, padx=8)
        
        # Upload Video Button
        self.upload_video_btn = tk.Button(
            button_frame,
            text="🎥 Upload Video",
            command=self.upload_video,
            font=('Arial', 11, 'bold'),
            bg='#2196F3',
            fg='white',
            padx=15,
            pady=10,
            cursor='hand2'
        )
        self.upload_video_btn.grid(row=0, column=1, padx=8)
        
        # Webcam Button
        self.webcam_btn = tk.Button(
            button_frame,
            text="📹 Start Webcam",
            command=self.start_webcam,
            font=('Arial', 11, 'bold'),
            bg='#FF9800',
            fg='white',
            padx=15,
            pady=10,
            cursor='hand2'
        )
        self.webcam_btn.grid(row=0, column=2, padx=8)
        
        # Stop Button
        self.stop_btn = tk.Button(
            button_frame,
            text="⏹ Stop",
            command=self.stop_video,
            font=('Arial', 11, 'bold'),
            bg='#f44336',
            fg='white',
            padx=15,
            pady=10,
            cursor='hand2',
            state='disabled'
        )
        self.stop_btn.grid(row=0, column=3, padx=8)
        
        # Row 2: Model management
        # Change Model Button
        self.change_model_btn = tk.Button(
            button_frame,
            text="🔄 Change Model",
            command=self.change_model,
            font=('Arial', 11, 'bold'),
            bg='#9C27B0',
            fg='white',
            padx=15,
            pady=10,
            cursor='hand2'
        )
        self.change_model_btn.grid(row=1, column=0, columnspan=2, padx=8, pady=(10, 0))
        
        # Model Info Button
        self.info_btn = tk.Button(
            button_frame,
            text="ℹ️ Model Info",
            command=self.show_model_info,
            font=('Arial', 11, 'bold'),
            bg='#607D8B',
            fg='white',
            padx=15,
            pady=10,
            cursor='hand2'
        )
        self.info_btn.grid(row=1, column=2, columnspan=2, padx=8, pady=(10, 0))
        
        # Display frame
        display_frame = tk.Frame(self.scrollable_frame, bg='#1e1e1e', relief=tk.RIDGE, bd=2)
        display_frame.pack(pady=20, padx=20, fill=tk.BOTH, expand=True)
        
        # Image/Video display label
        self.display_label = tk.Label(
            display_frame,
            text="Upload an image or video to start detection",
            font=('Arial', 14),
            bg='#1e1e1e',
            fg='#ffffff'
        )
        self.display_label.pack(expand=True, fill=tk.BOTH, padx=10, pady=10)
        
        # Detection results frame
        results_frame = tk.Frame(self.scrollable_frame, bg='#2b2b2b')
        results_frame.pack(pady=10, padx=20, fill=tk.X)
        
        # Results text area with scrollbar
        results_label = tk.Label(
            results_frame,
            text="Detection Results:",
            font=('Arial', 12, 'bold'),
            bg='#2b2b2b',
            fg='#00ff00'
        )
        results_label.pack(anchor='w')
        
        text_frame = tk.Frame(results_frame, bg='#2b2b2b')
        text_frame.pack(fill=tk.BOTH, expand=True)
        
        scrollbar = tk.Scrollbar(text_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.results_text = tk.Text(
            text_frame,
            height=8,
            font=('Courier', 10),
            bg='#1e1e1e',
            fg='#ffffff',
            yscrollcommand=scrollbar.set
        )
        self.results_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.results_text.yview)
        
        # Add padding at bottom for scrolling
        bottom_padding = tk.Frame(self.scrollable_frame, bg='#2b2b2b', height=20)
        bottom_padding.pack()
    
    def upload_image(self):
        """Handle image upload and detection"""
        if self.model is None:
            messagebox.showerror("Error", "Model is still loading. Please wait...")
            return
        
        file_path = filedialog.askopenfilename(
            title="Select Image",
            filetypes=[
                ("Image Files", "*.jpg *.jpeg *.png *.bmp *.gif"),
                ("All Files", "*.*")
            ]
        )
        
        if file_path:
            self.stop_video()
            self.status_label.config(text=f"Processing: {os.path.basename(file_path)}")
            threading.Thread(target=self.process_image, args=(file_path,), daemon=True).start()
    
    def process_image(self, image_path):
        """Process and display image with detections"""
        try:
            # Store current image path for reprocessing
            self.current_image_path = image_path
            
            # Run detection
            results = self.model(image_path)
            
            # Get annotated image
            annotated_image = results[0].plot()
            
            # Convert BGR to RGB
            annotated_image = cv2.cvtColor(annotated_image, cv2.COLOR_BGR2RGB)
            
            # Resize to fit display
            h, w = annotated_image.shape[:2]
            max_width = 1000
            max_height = 500
            
            if w > max_width or h > max_height:
                scale = min(max_width/w, max_height/h)
                new_w = int(w * scale)
                new_h = int(h * scale)
                annotated_image = cv2.resize(annotated_image, (new_w, new_h))
            
            # Convert to PIL Image
            pil_image = Image.fromarray(annotated_image)
            photo = ImageTk.PhotoImage(pil_image)
            
            # Update display
            self.display_label.config(image=photo, text="")
            self.display_label.image = photo
            
            # Update results
            self.update_detection_results(results[0])
            
            model_name = os.path.basename(self.model_path)
            self.status_label.config(text=f"Detection completed: {os.path.basename(image_path)} | Model: {model_name}")
            
        except Exception as e:
            self.status_label.config(text=f"Error: {str(e)}")
            messagebox.showerror("Error", f"Failed to process image: {str(e)}")
    
    def upload_video(self):
        """Handle video upload and detection"""
        if self.model is None:
            messagebox.showerror("Error", "Model is still loading. Please wait...")
            return
        
        file_path = filedialog.askopenfilename(
            title="Select Video",
            filetypes=[
                ("Video Files", "*.mp4 *.avi *.mov *.mkv"),
                ("All Files", "*.*")
            ]
        )
        
        if file_path:
            self.stop_video()
            self.status_label.config(text=f"Processing video: {os.path.basename(file_path)}")
            threading.Thread(target=self.process_video, args=(file_path,), daemon=True).start()
    
    def start_webcam(self):
        """Start webcam detection"""
        if self.model is None:
            messagebox.showerror("Error", "Model is still loading. Please wait...")
            return
        
        self.stop_video()
        self.status_label.config(text="Starting webcam...")
        threading.Thread(target=self.process_video, args=(0,), daemon=True).start()
    
    def process_video(self, video_source):
        """Process video or webcam with detections"""
        try:
            self.current_video_capture = cv2.VideoCapture(video_source)
            self.video_running = True
            self.stop_btn.config(state='normal')
            
            if isinstance(video_source, int):
                model_name = os.path.basename(self.model_path)
                self.status_label.config(text=f"Webcam running... | Model: {model_name}")
            else:
                model_name = os.path.basename(self.model_path)
                self.status_label.config(text=f"Playing: {os.path.basename(video_source)} | Model: {model_name}")
            
            frame_count = 0
            while self.video_running and self.current_video_capture.isOpened():
                ret, frame = self.current_video_capture.read()
                
                if not ret:
                    break
                
                frame_count += 1
                
                # Run detection
                results = self.model(frame, verbose=False)
                
                # Get annotated frame
                annotated_frame = results[0].plot()
                
                # Convert BGR to RGB
                annotated_frame = cv2.cvtColor(annotated_frame, cv2.COLOR_BGR2RGB)
                
                # Resize to fit display
                h, w = annotated_frame.shape[:2]
                max_width = 1000
                max_height = 500
                
                if w > max_width or h > max_height:
                    scale = min(max_width/w, max_height/h)
                    new_w = int(w * scale)
                    new_h = int(h * scale)
                    annotated_frame = cv2.resize(annotated_frame, (new_w, new_h))
                
                # Convert to PIL Image
                pil_image = Image.fromarray(annotated_frame)
                photo = ImageTk.PhotoImage(pil_image)
                
                # Update display
                self.display_label.config(image=photo, text="")
                self.display_label.image = photo
                
                # Update results every frame for better responsiveness
                frame_info = f"Frame: {frame_count}"
                if isinstance(video_source, int):
                    frame_info = "Webcam Live"
                self.update_detection_results(results[0], frame_info)
            
            self.stop_video()
            self.status_label.config(text="Video/Webcam stopped")
            
        except Exception as e:
            self.status_label.config(text=f"Error: {str(e)}")
            messagebox.showerror("Error", f"Failed to process video: {str(e)}")
            self.stop_video()
    
    def stop_video(self):
        """Stop video/webcam capture"""
        self.video_running = False
        if self.current_video_capture is not None:
            self.current_video_capture.release()
            self.current_video_capture = None
        self.stop_btn.config(state='disabled')
    
    def change_model(self):
        """Allow user to load a different model"""
        file_path = filedialog.askopenfilename(
            title="Select YOLO Model",
            filetypes=[
                ("PyTorch Model", "*.pt"),
                ("All Files", "*.*")
            ],
            initialdir=os.getcwd()
        )
        
        if file_path:
            self.status_label.config(text=f"Loading new model: {os.path.basename(file_path)}...")
            threading.Thread(target=self.load_model, args=(file_path, True), daemon=True).start()
    
    def show_model_info(self):
        """Display information about the current model"""
        if self.model is None:
            messagebox.showinfo("Model Info", "No model loaded yet. Please wait...")
            return
        
        num_classes = len(self.model.names)
        class_list = "\n".join([f"{i}: {name}" for i, name in list(self.model.names.items())[:20]])
        
        if num_classes > 20:
            class_list += f"\n... and {num_classes - 20} more classes"
        
        info_text = f"""Current Model Information:
        
📦 Model: {os.path.basename(self.model_path)}
📊 Total Classes: {num_classes}
📍 Model Path: {self.model_path}

🏷️ Classes (showing first 20):
{class_list}

💡 To use different models:
   1. Click "Change Model" button
   2. Select any YOLOv8 .pt model file
"""
        
        # Create a new window for model info
        info_window = tk.Toplevel(self.root)
        info_window.title("Model Information")
        info_window.geometry("600x700")
        info_window.configure(bg='#2b2b2b')
        
        text_widget = tk.Text(
            info_window,
            font=('Courier', 10),
            bg='#1e1e1e',
            fg='#ffffff',
            wrap=tk.WORD,
            padx=10,
            pady=10
        )
        text_widget.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        text_widget.insert(1.0, info_text)
        text_widget.config(state=tk.DISABLED)
        
        close_btn = tk.Button(
            info_window,
            text="Close",
            command=info_window.destroy,
            font=('Arial', 11, 'bold'),
            bg='#4CAF50',
            fg='white',
            padx=20,
            pady=8
        )
        close_btn.pack(pady=10)
    
    def update_detection_results(self, result, frame_info=None):
        """Update the detection results text area"""
        self.results_text.delete(1.0, tk.END)
        
        # Show frame info for video/webcam
        if frame_info:
            self.results_text.insert(tk.END, f"🔴 LIVE DETECTION | {frame_info}\n")
            self.results_text.insert(tk.END, "=" * 50 + "\n\n")
        
        if len(result.boxes) == 0:
            self.results_text.insert(tk.END, "No objects detected\n")
            return
        
        # Count detections by class
        detections = {}
        for box in result.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])
            class_name = result.names[class_id]
            
            if class_name not in detections:
                detections[class_name] = []
            detections[class_name].append(confidence)
        
        # Display results
        self.results_text.insert(tk.END, f"Total Objects Detected: {len(result.boxes)}\n")
        self.results_text.insert(tk.END, "=" * 50 + "\n\n")
        
        for class_name, confidences in sorted(detections.items()):
            count = len(confidences)
            avg_conf = sum(confidences) / count
            self.results_text.insert(tk.END, f"• {class_name}: {count} (Avg confidence: {avg_conf:.2%})\n")
    
    def on_closing(self):
        """Handle window closing"""
        self.stop_video()
        self.root.destroy()

def main():
    root = tk.Tk()
    app = ObjectDetectionGUI(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()

if __name__ == "__main__":
    main()
