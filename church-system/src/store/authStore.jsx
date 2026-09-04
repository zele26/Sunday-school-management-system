'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const customStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(name);
  },
  setItem: (name, value) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(name);
    }
  },
};

const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isLoggedIn: false,
      _hasHydrated: false,

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      login: (accessToken, user) => {
        if (typeof window !== 'undefined' && accessToken) {
          localStorage.setItem('token', accessToken);
        }
        set({ accessToken, user, isLoggedIn: true, _hasHydrated: true });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        set({ accessToken: null, user: null, isLoggedIn: false });
      },

      setAccessToken: (accessToken) => {
        if (typeof window !== 'undefined' && accessToken) {
          localStorage.setItem('token', accessToken);
        }
        set({ accessToken });
      },

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : userData,
        })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => customStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export default useAuthStore;