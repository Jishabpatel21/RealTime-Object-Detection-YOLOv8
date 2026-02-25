import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (user, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
      },
      
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useDetectionStore = create((set) => ({
  detections: [],
  currentDetection: null,
  isProcessing: false,
  
  setDetections: (detections) => set({ detections }),
  setCurrentDetection: (detection) => set({ currentDetection: detection }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  
  addDetection: (detection) =>
    set((state) => ({
      detections: [detection, ...state.detections],
    })),
}));
