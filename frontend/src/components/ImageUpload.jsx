import React, { useState, useCallback } from 'react';
import { detectionAPI } from '../services/api';
import { Upload, Image as ImageIcon, Sliders, Loader2, Download, X } from 'lucide-react';
import toast from 'react-hot-toast';
import DetectionResults from './DetectionResults';

const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [confidence, setConfidence] = useState(0.25);
  const [iou, setIou] = useState(0.45);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      setResult(null);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect({ target: { files: [file] } });
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDetect = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setProcessing(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('confidence', confidence.toString());
    formData.append('iou', iou.toString());

    try {
      const response = await detectionAPI.detectImage(formData);
      setResult(response.data);
      toast.success(`Detected ${response.data.total_objects} objects!`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Detection failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
  };

  const downloadResult = () => {
    if (result?.annotated_image) {
      const link = document.createElement('a');
      link.href = result.annotated_image;
      link.download = `detected_${result.file_name}`;
      link.click();
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-slideIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <ImageIcon className="w-8 h-8 text-primary-500" />
          Image Detection
        </h1>
        <p className="text-dark-400">Upload an image to detect objects using YOLOv8</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="space-y-6">
          {/* Drop Zone */}
          {!preview ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-dark-700 rounded-2xl p-12 text-center hover:border-primary-500 transition-all bg-dark-900 cursor-pointer"
              onClick={() => document.getElementById('file-input').click()}
            >
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="w-16 h-16 text-dark-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Drop image here</h3>
              <p className="text-dark-400 mb-4">or click to browse</p>
              <p className="text-sm text-dark-500">Supports: JPG, PNG, BMP, WebP</p>
            </div>
          ) : (
            <div className="bg-dark-900 border border-dark-700 rounded-2xl p-4">
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-auto rounded-xl"
                />
                <button
                  onClick={handleReset}
                  className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-white mt-3 font-medium truncate">{selectedFile?.name}</p>
            </div>
          )}

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
                  className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer slider"
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
                  className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer slider"
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
                  Processing...
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5" />
                  Detect Objects
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div>
          {result ? (
            <div className="space-y-6">
              {/* Annotated Image */}
              <div className="bg-dark-900 border border-dark-700 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">Detection Result</h3>
                  <button
                    onClick={downloadResult}
                    className="flex items-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
                <img
                  src={result.annotated_image}
                  alt="Detection Result"
                  className="w-full h-auto rounded-xl"
                />
              </div>

              {/* Detection Results */}
              <DetectionResults result={result} />
            </div>
          ) : (
            <div className="bg-dark-900 border border-dark-700 rounded-2xl p-12 text-center h-full flex items-center justify-center">
              <div>
                <ImageIcon className="w-16 h-16 text-dark-500 mx-auto mb-4" />
                <p className="text-dark-400">Detection results will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
