import React, { useEffect, useState } from 'react';
import { detectionAPI } from '../services/api';
import { Info, Cpu, Layers, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const ModelInfo = () => {
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModelInfo();
  }, []);

  const loadModelInfo = async () => {
    try {
      const response = await detectionAPI.getModelInfo();
      setModelInfo(response.data);
    } catch (error) {
      toast.error('Failed to load model information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto animate-slideIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Info className="w-8 h-8 text-primary-500" />
          Model Information
        </h1>
        <p className="text-dark-400">Details about the active YOLOv8 model</p>
      </div>

      {/* Model Overview */}
      <div className="bg-dark-900 border border-dark-700 rounded-2xl p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{modelInfo?.model_name}</h2>
            <p className="text-dark-400">Currently active detection model</p>
          </div>
          <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
            <span className="text-green-400 font-medium">Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-800 rounded-xl p-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <p className="text-dark-400 text-sm mb-1">Device</p>
            <p className="text-2xl font-bold text-white capitalize">{modelInfo?.device}</p>
          </div>

          <div className="bg-dark-800 rounded-xl p-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <p className="text-dark-400 text-sm mb-1">Total Classes</p>
            <p className="text-2xl font-bold text-white">{modelInfo?.classes_count}</p>
          </div>

          <div className="bg-dark-800 rounded-xl p-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-white" />
            </div>
            <p className="text-dark-400 text-sm mb-1">Framework</p>
            <p className="text-2xl font-bold text-white">YOLOv8</p>
          </div>
        </div>
      </div>

      {/* Detectable Classes */}
      <div className="bg-dark-900 border border-dark-700 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">Detectable Object Classes</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {modelInfo?.classes.map((className, index) => (
            <div
              key={index}
              className="px-4 py-3 bg-dark-800 hover:bg-dark-700 border border-dark-700 hover:border-primary-500 rounded-lg text-white text-sm font-medium transition-all capitalize text-center"
            >
              {className}
            </div>
          ))}
        </div>
      </div>

      {/* Model Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Supported Operations</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-dark-300">Image Detection</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-dark-300">Video Processing</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-dark-300">Real-time Webcam</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-dark-300">Batch Processing</span>
            </div>
          </div>
        </div>

        <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Key Features</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span className="text-dark-300">High Accuracy Detection</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span className="text-dark-300">Adjustable Confidence Threshold</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span className="text-dark-300">GPU Acceleration Support</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span className="text-dark-300">Fast Inference Speed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelInfo;
