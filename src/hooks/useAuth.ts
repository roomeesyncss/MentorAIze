import { useAuthStore } from "@/stores/authStore";

export function useAuth() {
  const { user, token, isLoading, setAuth, logout, setUser } = useAuthStore();

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    setAuth,
    logout,
    setUser,
  };
}
