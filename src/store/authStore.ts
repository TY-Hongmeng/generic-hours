import { create } from 'zustand';
import type { User } from '../types';
import { getCurrentUser, logout as logoutService } from '../services/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  login: (user) => set({ user, isAuthenticated: true, isLoading: false }),
  
  logout: async () => {
    await logoutService();
    set({ user: null, isAuthenticated: false });
  },
  
  checkAuth: async () => {
    set({ isLoading: true });
    const user = await getCurrentUser();
    set({ user, isAuthenticated: !!user, isLoading: false });
  },
}));
