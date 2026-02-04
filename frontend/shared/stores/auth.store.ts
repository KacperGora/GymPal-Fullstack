import { AuthResponseUser } from "@gympal/shared";
import { create } from "zustand";

interface AuthState {
  user: AuthResponseUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
}

interface AuthActions {
  setUser: (user: AuthResponseUser) => void;
  clearUser: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,

  setUser: (user) => set({ user, isAuthenticated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
  setHydrated: () => set({ isHydrated: true }),
}));
