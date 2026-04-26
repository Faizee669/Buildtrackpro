import { useCallback } from "react";
import { useQuery, useQueryClient, useIsRestoring } from "@tanstack/react-query";
import type { AuthUser } from "@workspace/api-client-react";

export type { AuthUser };

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

export function useAuth(): AuthState {
  const queryClient = useQueryClient();
  const isRestoring = useIsRestoring();

  const { data: user, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const apiBase = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL) || "";
      const res = await fetch(`${apiBase}/api/auth/user`, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { user: AuthUser | null };
      return data.user ?? null;
    },
    // Prevent clearing cache aggressively
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days (persists in IDB)
    retry: false, // Don't aggressively retry auth calls when offline
  });

  const login = useCallback(() => {
    // We handle local email login, so redirect to root or /login
    window.location.href = "/";
  }, []);

  const logout = useCallback(() => {
    // Immediately clear local cache so the UI updates without waiting for network
    queryClient.setQueryData(["authUser"], null);
    const apiBase = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL) || "";
    window.location.href = `${apiBase}/api/logout`;
  }, [queryClient]);

  return {
    user: user ?? null,
    // When offline, React Query uses cached data immediately, so isLoading is false
    isLoading: isLoading || isRestoring,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
