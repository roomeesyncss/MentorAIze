import { create } from "zustand";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("access_token") : null,
  isLoading: true,
  setAuth: (user, token) => {
    localStorage.setItem("access_token", token);
    set({ user, token, isLoading: false });
  },
  logout: () => {
    localStorage.removeItem("access_token");
    set({ user: null, token: null, isLoading: false });
  },
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
