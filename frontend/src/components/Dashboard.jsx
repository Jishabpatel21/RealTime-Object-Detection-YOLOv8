import React, { useEffect, useState } from 'react';
import { detectionAPI } from '../services/api';
import { useAuthStore } from '../store/store';
import {
  TrendingUp,
  Image as ImageIcon,
  Video,
  Clock,
  Zap,
  Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [recentDetections, setRecentDetections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const historyRes = await detectionAPI.getHistory({ limit: 10 });
      const detections = historyRes.data;
      setRecentDetections(detections);

      // Calculate stats
      const imageCount = detections.filter((d) => d.file_type === 'image').length;
      const videoCount = detections.filter((d) => d.file_type === 'video').length;
      const totalObjects = detections.reduce((sum, d) => sum + d.total_objects, 0);
      const avgTime =
        detections.length > 0
          ? detections.reduce((sum, d) => sum + d.processing_time, 0) / detections.length
          : 0;

      setStats({
        totalDetections: detections.length,
        imageDetections: imageCount,
        videoDetections: videoCount,
        totalObjects,
        avgProcessingTime: avgTime.toFixed(2),
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Detections',
      value: stats?.totalDetections || 0,
      icon: Activity,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Image Detections',
      value: stats?.imageDetections || 0,
      icon: ImageIcon,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Video Detections',
      value: stats?.videoDetections || 0,
      icon: Video,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Objects Detected',
      value: stats?.totalObjects || 0,
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-slideIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.username}! 👋
        </h1>
        <p className="text-dark-400">
          Here's an overview of your object detection activities
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-dark-900 border border-dark-700 rounded-2xl p-6 hover:border-primary-500 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-dark-400 text-sm mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Avg Processing Time</h3>
              <p className="text-dark-400 text-sm">Per detection</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {stats?.avgProcessingTime || '0.00'}s
          </p>
        </div>

        <div className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-10 h-10" />
            <div>
              <h3 className="font-semibold">Quick Start</h3>
              <p className="text-blue-100 text-sm">Start detecting now</p>
            </div>
          </div>
          <div className="space-y-2">
            <a
              href="/image"
              className="block px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-center"
            >
              Upload Image
            </a>
            <a
              href="/webcam"
              className="block px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-center"
            >
              Start Webcam
            </a>
          </div>
        </div>
      </div>

      {/* Recent Detections */}
      <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Detections</h2>
        {recentDetections.length === 0 ? (
          <p className="text-dark-400 text-center py-8">No detections yet. Start detecting!</p>
        ) : (
          <div className="space-y-3">
            {recentDetections.slice(0, 5).map((detection) => (
              <div
                key={detection.id}
                className="flex items-center justify-between p-4 bg-dark-800 rounded-xl hover:bg-dark-700 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      detection.file_type === 'image'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {detection.file_type === 'image' ? (
                      <ImageIcon className="w-5 h-5" />
                    ) : (
                      <Video className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{detection.file_name}</p>
                    <p className="text-dark-400 text-sm">
                      {detection.total_objects} objects • {detection.processing_time.toFixed(2)}s
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-dark-400 text-sm">
                    {new Date(detection.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-dark-500 text-xs">
                    {new Date(detection.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
