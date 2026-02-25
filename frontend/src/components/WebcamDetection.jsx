import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, Sliders, AlertCircle, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { detectionAPI } from '../services/api';

const WebcamDetection = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);
  const [confidence, setConfidence] = useState(0.25);
  const [iou, setIou] = useState(0.45);
  const [detectionResults, setDetectionResults] = useState([]);
  const [fps, setFps] = useState(0);
  const [processing, setProcessing] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const processingRef = useRef(false);
  const isDetectingRef = useRef(false);
  const isStreamingRef = useRef(false);
  const confidenceRef = useRef(confidence);
  const iouRef = useRef(iou);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsStreaming(true);
          isStreamingRef.current = true;
          setError(null);
          toast.success('Webcam started - Ready for detection');
        };
      }
    } catch (err) {
      console.error('Webcam error:', err);
      setError('Failed to access webcam. Please check permissions.');
      toast.error('Webcam access denied');
    }
  };

  const stopWebcam = () => {
    stopDetection();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsStreaming(false);
      isStreamingRef.current = false;
      toast.success('Webcam stopped');
    }
  };

  // Update refs when confidence or iou changes
  useEffect(() => {
    confidenceRef.current = confidence;
  }, [confidence]);

  useEffect(() => {
    iouRef.current = iou;
  }, [iou]);

  const captureFrame = () => {
    const video = videoRef.current;
    console.log('captureFrame called - video:', !!video, 'readyState:', video?.readyState, 'HAVE_ENOUGH_DATA:', video?.HAVE_ENOUGH_DATA);
    
    if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
      console.warn('Video not ready for capture');
      return Promise.resolve(null);
    }
    
    console.log('Video ready, dimensions:', video.videoWidth, 'x', video.videoHeight);
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        console.log('Blob created:', blob ? `${blob.size} bytes` : 'null');
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const drawDetections = (detections) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) {
      console.log('Cannot draw: video or canvas not ready');
      return;
    }

    // Match canvas size to video's DISPLAY size (not internal resolution)
    const displayWidth = video.clientWidth;
    const displayHeight = video.clientHeight;
    
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      console.log(`Canvas resized to display size: ${displayWidth}x${displayHeight}`);
    }

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!detections || detections.length === 0) {
      console.log('No detections to draw');
      return;
    }

    console.log(`Drawing ${detections.length} detections on canvas (display: ${displayWidth}x${displayHeight}, video: ${video.videoWidth}x${video.videoHeight})`);

    // Calculate scaling factors
    const scaleX = displayWidth / video.videoWidth;
    const scaleY = displayHeight / video.videoHeight;
    console.log(`Scale factors: X=${scaleX}, Y=${scaleY}`);

    detections.forEach((detection) => {
      // Backend sends bbox as [x1, y1, x2, y2] (xyxy format from YOLO)
      const [x1, y1, x2, y2] = detection.bbox;
      
      // Convert to x, y, width, height
      const x = x1;
      const y = y1;
      const w = x2 - x1;
      const h = y2 - y1;
      
      // Scale coordinates to match display size
      const scaledX = x * scaleX;
      const scaledY = y * scaleY;
      const scaledW = w * scaleX;
      const scaledH = h * scaleY;
      
      console.log(`Drawing ${detection.class_name}: xyxy [${x1.toFixed(0)}, ${y1.toFixed(0)}, ${x2.toFixed(0)}, ${y2.toFixed(0)}] → xywh [${x.toFixed(0)}, ${y.toFixed(0)}, ${w.toFixed(0)}, ${h.toFixed(0)}] → scaled [${scaledX.toFixed(0)}, ${scaledY.toFixed(0)}, ${scaledW.toFixed(0)}, ${scaledH.toFixed(0)}]`);
      
      // Draw bounding box
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.strokeRect(scaledX, scaledY, scaledW, scaledH);

      // Draw label background
      const label = `${detection.class_name} ${(detection.confidence * 100).toFixed(0)}%`;
      ctx.font = 'bold 16px Arial';
      const textWidth = ctx.measureText(label).width;
      
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(scaledX, scaledY - 25, textWidth + 10, 25);
      
      // Draw label text
      ctx.fillStyle = '#000000';
      ctx.fillText(label, scaledX + 5, scaledY - 7);
    });
  };

  const startDetection = () => {
    console.log('🚀 startDetection called');
    console.log('  isStreaming:', isStreaming);
    console.log('  videoRef.current:', videoRef.current);
    console.log('  video readyState:', videoRef.current?.readyState);
    console.log('  video dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
    
    if (!isStreaming) {
      toast.error('Please start webcam first');
      return;
    }
    
    if (!videoRef.current || videoRef.current.readyState < 2) {
      toast.error('Video not ready yet. Please wait a moment and try again.');
      return;
    }
    
    console.log('✅ Setting isDetecting to true');
    setIsDetecting(true);
    isDetectingRef.current = true;
    toast.success('Real-time detection started');
  };

  const stopDetection = () => {
    setIsDetecting(false);
    isDetectingRef.current = false;
    processingRef.current = false;
    setProcessing(false);
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setDetectionResults([]);
    setFps(0);
  };

  // Continuous detection loop - similar to desktop app's video processing
  useEffect(() => {
    console.log('Detection useEffect - isDetecting:', isDetecting);
    
    if (!isDetecting) {
      console.log('Not detecting, returning');
      return;
    }

    let frameCount = 0;
    console.log('✅ Starting detection interval...');
    
    const detectionInterval = setInterval(async () => {
      // Use refs to avoid closure issues
      if (!videoRef.current || !isStreamingRef.current) {
        console.log('⏭️ Skipping: no video or not streaming');
        return;
      }
      
      if (processingRef.current) {
        console.log('⏭️ Skipping: already processing');
        return;
      }
      
      if (!isDetectingRef.current) {
        console.log('⏭️ Skipping: detection stopped');
        return;
      }
      
      frameCount++;
      console.log(`\n🎬 Frame ${frameCount}: Starting detection...`);
      processingRef.current = true;
      setProcessing(true);
      const startTime = performance.now();
      
      try {
        // Capture frame  
        const blob = await captureFrame();
        if (!blob) {
          console.log('❌ No blob returned from captureFrame');
          processingRef.current = false;
          setProcessing(false);
          return;
        }
        
        console.log('📸 Frame captured, blob size:', blob.size);
        
        // Send to backend for detection
        const formData = new FormData();
        formData.append('file', blob, 'frame.jpg');
        formData.append('confidence', confidenceRef.current);
        formData.append('iou', iouRef.current);

        console.log('📤 Sending to API...');
        const response = await detectionAPI.detectWebcamFrame(formData);
        console.log('📥 API response received:', response);
        
        const data = response.data; // Axios returns data in response.data
        if (data && data.success) {
          const objects = data.objects_detected || [];
          console.log(`✅ Detected ${objects.length} objects:`, objects.map(o => o.class_name).join(', '));
          setDetectionResults(objects);
          drawDetections(objects);
          
          // Calculate FPS
          const endTime = performance.now();
          const processingTime = endTime - startTime;
          const currentFps = 1000 / processingTime;
          setFps(Math.round(currentFps));
          console.log(`⏱️ Processing time: ${processingTime.toFixed(0)}ms, FPS: ${Math.round(currentFps)}`);
        }
      } catch (error) {
        console.error('❌ Detection error:', error);
        if (error.response?.status === 401) {
          toast.error('Session expired. Please login again.');
          clearInterval(detectionInterval);
          setIsDetecting(false);
          isDetectingRef.current = false;
        }
      } finally {
        processingRef.current = false;
        setProcessing(false);
      }
    }, 200); // Process every 200ms for better performance
    
    animationRef.current = detectionInterval;
    console.log('✅ Detection interval started with ID:', detectionInterval);

    return () => {
      console.log('🧹 Cleaning up detection interval');
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
      processingRef.current = false;
    };
  }, [isDetecting]); // Only depend on isDetecting to start/stop the loop

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto animate-slideIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Camera className="w-8 h-8 text-primary-500" />
          Webcam Live Detection
        </h1>
        <p className="text-dark-400">Real-time object detection using your webcam with YOLOv8</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Webcam Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl p-4">
            <div className="aspect-video bg-black rounded-xl overflow-hidden relative">
              {error ? (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <p className="text-red-400">{error}</p>
                  </div>
                </div>
              ) : !isStreaming ? (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-dark-500 mx-auto mb-4" />
                    <p className="text-dark-400">Webcam feed will appear here</p>
                  </div>
                </div>
              ) : null}
              
              {/* Video Element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
              />
              
              {/* Canvas Overlay for Detections */}
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 pointer-events-none"
                style={{ width: '100%', height: '100%' }}
              />
              
              {/* FPS Counter */}
              {isDetecting && (
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-mono font-semibold">{fps} FPS</span>
                </div>
              )}
              
              {/* Processing Indicator */}
              {processing && (
                <div className="absolute top-4 left-4 bg-blue-500/20 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <span className="text-blue-400 text-sm">Processing...</span>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 gap-4">
            {!isStreaming ? (
              <button
                onClick={startWebcam}
                className="col-span-2 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/25"
              >
                <Camera className="w-5 h-5" />
                Start Webcam
              </button>
            ) : (
              <>
                {!isDetecting ? (
                  <button
                    onClick={startDetection}
                    className="py-4 bg-gradient-to-r from-blue-600 to-primary-600 hover:from-blue-700 hover:to-primary-700 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                  >
                    <Activity className="w-5 h-5" />
                    Start Detection
                  </button>
                ) : (
                  <button
                    onClick={stopDetection}
                    className="py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/25"
                  >
                    <CameraOff className="w-5 h-5" />
                    Stop Detection
                  </button>
                )}
                <button
                  onClick={stopWebcam}
                  className="py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/25"
                >
                  <CameraOff className="w-5 h-5" />
                  Stop Webcam
                </button>
              </>
            )}
          </div>
        </div>

        {/* Settings & Results */}
        <div className="space-y-6">
          {/* Settings */}
          <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sliders className="w-5 h-5 text-primary-500" />
              <h3 className="text-white font-semibold">Detection Settings</h3>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-dark-300 text-sm">Confidence Threshold</label>
                  <span className="text-primary-500 font-medium">{confidence.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={confidence}
                  onChange={(e) => setConfidence(parseFloat(e.target.value))}
                  className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer"
                  disabled={isDetecting}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-dark-300 text-sm">IOU Threshold</label>
                  <span className="text-primary-500 font-medium">{iou.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={iou}
                  onChange={(e) => setIou(parseFloat(e.target.value))}
                  className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer"
                  disabled={isDetecting}
                />
              </div>
            </div>
          </div>

          {/* Detection Results */}
          <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">Detected Objects</h3>
            {detectionResults.length === 0 ? (
              <p className="text-dark-400 text-sm">No objects detected yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {detectionResults.map((obj, idx) => (
                  <div key={idx} className="bg-dark-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium text-sm">{obj.class_name}</span>
                      <span className="text-primary-500 text-sm font-semibold">
                        {(obj.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-accent-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${obj.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">How it works</h3>
            <div className="space-y-3 text-sm text-dark-400">
              <p>1. Click "Start Webcam" to begin</p>
              <p>2. Allow camera access when prompted</p>
              <p>3. Click "Start Detection" for real-time YOLO processing</p>
              <p>4. Adjust thresholds before starting detection</p>
              <p>5. Objects will be detected and highlighted in real-time</p>
            </div>
          </div>

          {/* Performance Note */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">Performance Note</p>
                <p>
                  Detection speed depends on your device's processing power and network speed. 
                  GPU acceleration will provide better performance.
                </p>
              </div>
            </div>
          </div>

          {/* Browser Compatibility */}
          <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-3 text-sm">Browser Compatibility</h3>
            <div className="space-y-2 text-xs text-dark-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Chrome, Edge (Recommended)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Firefox</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Safari (Limited support)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebcamDetection;
