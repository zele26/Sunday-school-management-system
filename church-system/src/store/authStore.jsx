import { create } from 'zustand';

const useAuthStore = create((set) => ({
  accessToken: null,
  user: null,
  isLoggedIn: false,
  login: (accessToken, user) => set({ accessToken, user, isLoggedIn: true }),
  logout: () => set({ accessToken: null, user: null, isLoggedIn: false }),
  setAccessToken: (accessToken) => set({ accessToken }),
}));

export default useAuthStore;