"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/lib/auth";

const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password"];
const CHAT_PATH_PREFIX = "/chat/";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, setUser, logout, setLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isPublic = PUBLIC_PATHS.includes(pathname) || pathname.startsWith(CHAT_PATH_PREFIX);

    if (!token) {
      setLoading(false);
      if (!isPublic) router.push("/login");
      return;
    }

    // Verify token and fetch user
    authApi.getMe()
      .then((res) => setUser(res.data))
      .catch(() => {
        logout();
        if (!isPublic) router.push("/login");
      });
  }, [token, pathname, setUser, logout, router, setLoading]);

  return <>{children}</>;
}
