import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isLoggedIn: false,
      login: (accessToken, user) => set({ accessToken, user, isLoggedIn: true }),
      logout: () => set({ accessToken: null, user: null, isLoggedIn: false }),
      setAccessToken: (accessToken) => set({ accessToken }),
    }),
    {
      name: 'auth-storage',     // key in localStorage
      getStorage: () => localStorage,
    }
  )
);

export default useAuthStore;