import React, { useEffect, useState } from 'react';
import { detectionAPI } from '../services/api';
import { History as HistoryIcon, Image, Video, Trash2, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const History = () => {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, image, video

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await detectionAPI.getHistory({ limit: 100 });
      setDetections(response.data);
    } catch (error) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const filteredDetections = detections.filter((d) => {
    if (filter === 'all') return true;
    return d.file_type === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="p-8 animate-slideIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <HistoryIcon className="w-8 h-8 text-primary-500" />
          Detection History
        </h1>
        <p className="text-dark-400">View all your past object detection results</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-dark-800 text-dark-400 hover:bg-dark-700 hover:text-white'
          }`}
        >
          All ({detections.length})
        </button>
        <button
          onClick={() => setFilter('image')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'image'
              ? 'bg-primary-600 text-white'
              : 'bg-dark-800 text-dark-400 hover:bg-dark-700 hover:text-white'
          }`}
        >
          Images ({detections.filter((d) => d.file_type === 'image').length})
        </button>
        <button
          onClick={() => setFilter('video')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'video'
              ? 'bg-primary-600 text-white'
              : 'bg-dark-800 text-dark-400 hover:bg-dark-700 hover:text-white'
          }`}
        >
          Videos ({detections.filter((d) => d.file_type === 'video').length})
        </button>
      </div>

      {/* History List */}
      {filteredDetections.length === 0 ? (
        <div className="bg-dark-900 border border-dark-700 rounded-2xl p-12 text-center">
          <HistoryIcon className="w-16 h-16 text-dark-500 mx-auto mb-4" />
          <p className="text-dark-400">No detection history found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDetections.map((detection) => (
            <div
              key={detection.id}
              className="bg-dark-900 border border-dark-700 rounded-2xl p-6 hover:border-primary-500 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      detection.file_type === 'image'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {detection.file_type === 'image' ? (
                      <Image className="w-5 h-5" />
                    ) : (
                      <Video className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium truncate max-w-[180px]">
                      {detection.file_name}
                    </p>
                    <p className="text-dark-400 text-xs">
                      {new Date(detection.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-400">Objects Detected</span>
                  <span className="text-white font-medium">{detection.total_objects}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-400">Processing Time</span>
                  <span className="text-white font-medium">
                    {detection.processing_time.toFixed(2)}s
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-400">Model Used</span>
                  <span className="text-white font-medium text-xs">{detection.model_used}</span>
                </div>
              </div>

              {/* Actions */}
              {detection.result_path && (
                <div className="flex gap-2">
                  <a
                    href={`http://localhost:8000${detection.result_path}`}
                    download
                    className="flex-1 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
