import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/store';

// Components
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ImageUpload from './components/ImageUpload';
import VideoUpload from './components/VideoUpload';
import WebcamDetection from './components/WebcamDetection';
import ModelInfo from './components/ModelInfo';
import AdminPanel from './components/AdminPanel';
import History from './components/History';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin Route component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!user?.is_admin) {
    return <Navigate to="/" />;
  }
  
  return children;
};

// Layout component
const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-dark-950">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/image"
            element={
              <ProtectedRoute>
                <Layout>
                  <ImageUpload />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/video"
            element={
              <ProtectedRoute>
                <Layout>
                  <VideoUpload />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/webcam"
            element={
              <ProtectedRoute>
                <Layout>
                  <WebcamDetection />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <Layout>
                  <History />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/model-info"
            element={
              <ProtectedRoute>
                <Layout>
                  <ModelInfo />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Layout>
                  <AdminPanel />
                </Layout>
              </AdminRoute>
            }
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

export default App;
