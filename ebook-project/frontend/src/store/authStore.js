import { create } from 'zustand';
import { setTokens, removeTokens } from '../utils/token';

const useAuthStore = create((set) => ({
  user: null,
  isLoggedIn: false,

  setUser: (user) => set({ user, isLoggedIn: true }),

  loginSuccess: (accessToken, refreshToken, user) => {
    setTokens(accessToken, refreshToken);
    set({ user, isLoggedIn: true });
  },

  logout: () => {
    removeTokens();
    set({ user: null, isLoggedIn: false });
  },

  updatePoint: (pointBalance) =>
    set((state) => ({
      user: state.user ? { ...state.user, pointBalance } : null,
    })),
}));

export default useAuthStore;
