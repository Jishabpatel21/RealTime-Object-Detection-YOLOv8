import React, { useState } from 'react';
import { detectionAPI } from '../services/api';
import { Upload, Video as VideoIcon, Sliders, Loader2, Download, X, Play } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const VideoUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [confidence, setConfidence] = useState(0.25);
  const [iou, setIou] = useState(0.45);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a video file');
        return;
      }
      setSelectedFile(file);
      setResult(null);
    }
  };

  const handleDetect = async () => {
    if (!selectedFile) {
      toast.error('Please select a video first');
      return;
    }

    setProcessing(true);
    setProgress(0);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('confidence', confidence.toString());
    formData.append('iou', iou.toString());

    try {
      // Simulate progress (in real app, use upload progress)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 90));
      }, 500);

      const response = await detectionAPI.detectVideo(formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        },
      });

      clearInterval(progressInterval);
      setProgress(100);
      setResult(response.data);
      toast.success('Video processing complete!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Video processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setProgress(0);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-slideIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <VideoIcon className="w-8 h-8 text-primary-500" />
          Video Detection
        </h1>
        <p className="text-dark-400">Upload a video file for object detection on every frame</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="space-y-6">
          {/* File Input */}
          <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6">
            {!selectedFile ? (
              <div
                onClick={() => document.getElementById('video-input').click()}
                className="border-2 border-dashed border-dark-700 rounded-xl p-8 text-center hover:border-primary-500 transition-all cursor-pointer"
              >
                <input
                  id="video-input"
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload className="w-12 h-12 text-dark-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Select Video File</h3>
                <p className="text-dark-400 text-sm">Supports: MP4, AVI, MOV, MKV</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <VideoIcon className="w-8 h-8 text-primary-500" />
                    <div>
                      <p className="text-white font-medium truncate">{selectedFile.name}</p>
                      <p className="text-dark-400 text-sm">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {processing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-400">Processing...</span>
                      <span className="text-primary-500 font-medium">{progress}%</span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-accent-500 h-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

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
                  <span className="text-primary-500 font-medium">{confidence}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={confidence}
                  onChange={(e) => setConfidence(parseFloat(e.target.value))}
                  className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer"
                  disabled={processing}
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-dark-300 text-sm">IOU Threshold</label>
                  <span className="text-primary-500 font-medium">{iou}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={iou}
                  onChange={(e) => setIou(parseFloat(e.target.value))}
                  className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer"
                  disabled={processing}
                />
              </div>
            </div>

            <button
              onClick={handleDetect}
              disabled={!selectedFile || processing}
              className="w-full mt-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing Video...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Process Video
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div>
          {result ? (
            <div className="space-y-6">
              {/* Result Video */}
              <div className="bg-dark-900 border border-dark-700 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">Processed Video</h3>
                  <a
                    href={`${API_BASE_URL}${result.result_url}`}
                    download
                    className="flex items-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
                <video
                  controls
                  className="w-full rounded-xl bg-black"
                  src={`${API_BASE_URL}${result.result_url}`}
                />
              </div>

              {/* Stats */}
              <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">Processing Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-dark-800 rounded-lg">
                    <span className="text-dark-400">Frames Processed</span>
                    <span className="text-white font-bold">{result.total_objects}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-dark-800 rounded-lg">
                    <span className="text-dark-400">Processing Time</span>
                    <span className="text-white font-bold">{result.processing_time.toFixed(2)}s</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-dark-800 rounded-lg">
                    <span className="text-dark-400">Model Used</span>
                    <span className="text-white font-bold">{result.model_used}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-dark-900 border border-dark-700 rounded-2xl p-12 text-center h-full flex items-center justify-center">
              <div>
                <VideoIcon className="w-16 h-16 text-dark-500 mx-auto mb-4" />
                <p className="text-dark-400">Processed video will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoUpload;
