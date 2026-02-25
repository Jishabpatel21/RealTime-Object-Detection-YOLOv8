import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/store';
import {
  LayoutDashboard,
  Image,
  Video,
  Camera,
  Info,
  Settings,
  LogOut,
  Sparkles,
  History,
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuthStore();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/image', icon: Image, label: 'Image Detection' },
    { to: '/video', icon: Video, label: 'Video Detection' },
    { to: '/webcam', icon: Camera, label: 'Webcam Live' },
    { to: '/history', icon: History, label: 'History' },
    { to: '/model-info', icon: Info, label: 'Model Info' },
  ];

  if (user?.is_admin) {
    navItems.push({ to: '/admin', icon: Settings, label: 'Admin Panel' });
  }

  return (
    <div className="w-64 h-screen bg-dark-900 border-r border-dark-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">YOLO AI</h1>
            <p className="text-xs text-dark-400">Object Detection</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                    : 'text-dark-400 hover:bg-dark-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-dark-700">
        <div className="flex items-center gap-3 mb-3 p-3 bg-dark-800 rounded-xl">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.username}</p>
            <p className="text-xs text-dark-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-dark-800 hover:bg-red-600 text-dark-400 hover:text-white rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
