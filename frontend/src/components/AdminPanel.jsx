import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import { Settings, Users, Activity, Cpu, RefreshCw, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [statsRes, usersRes, modelsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.listModels(),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setModels(modelsRes.data.models);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchModel = async (modelName) => {
    try {
      await adminAPI.switchModel({ model_name: modelName });
      toast.success(`Switched to ${modelName}`);
      loadAdminData();
    } catch (error) {
      toast.error('Failed to switch model');
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
    <div className="p-8 animate-slideIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary-500" />
          Admin Panel
        </h1>
        <p className="text-dark-400">System overview and management</p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-dark-400 text-sm mb-1">Total Users</p>
          <p className="text-3xl font-bold text-white">{stats?.total_users}</p>
        </div>

        <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-dark-400 text-sm mb-1">Total Detections</p>
          <p className="text-3xl font-bold text-white">{stats?.total_detections}</p>
        </div>

        <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Cpu className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-dark-400 text-sm mb-1">Device</p>
          <p className="text-2xl font-bold text-white capitalize">{stats?.device}</p>
        </div>

        <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-dark-400 text-sm mb-1">Uptime</p>
          <p className="text-2xl font-bold text-white">{stats?.uptime}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Model Management */}
        <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Model Management</h2>
            <button
              onClick={loadAdminData}
              className="p-2 bg-dark-800 hover:bg-dark-700 rounded-lg transition-all"
            >
              <RefreshCw className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="space-y-3">
            {models.map((model) => (
              <div
                key={model.model_name}
                className={`p-4 rounded-xl border-2 transition-all ${
                  model.is_active
                    ? 'bg-primary-500/10 border-primary-500'
                    : 'bg-dark-800 border-dark-700 hover:border-dark-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-medium">{model.model_name}</p>
                      {model.is_active && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-dark-400 text-sm">
                      {model.classes_count > 0
                        ? `${model.classes_count} classes`
                        : 'Not loaded'}
                    </p>
                  </div>
                  {!model.is_active && (
                    <button
                      onClick={() => handleSwitchModel(model.model_name)}
                      className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-all"
                    >
                      Activate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Statistics */}
        <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">User Statistics</h2>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.user_id}
                className="p-4 bg-dark-800 rounded-xl hover:bg-dark-700 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.username}</p>
                      <p className="text-dark-400 text-xs">ID: {user.user_id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-primary-500 font-bold">{user.total_detections}</p>
                    <p className="text-dark-400 text-xs">detections</p>
                  </div>
                </div>
                {user.last_detection && (
                  <p className="text-dark-500 text-xs">
                    Last active: {new Date(user.last_detection).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="mt-8 bg-dark-900 border border-dark-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-dark-800 rounded-lg">
            <p className="text-dark-400 text-sm mb-1">Active Model</p>
            <p className="text-white font-medium">{stats?.active_model}</p>
          </div>
          <div className="p-4 bg-dark-800 rounded-lg">
            <p className="text-dark-400 text-sm mb-1">Computing Device</p>
            <p className="text-white font-medium capitalize">{stats?.device}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
