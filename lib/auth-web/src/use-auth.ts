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

  const { data: user, isLoading, isFetching } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const apiBase = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL) || "";
      const res = await fetch(`${apiBase}/api/auth/user`, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { user: AuthUser | null };
      return data.user ?? null;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    retry: false,
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

  // isLoading: true while first fetch in flight OR while restoring from IDB cache OR while refetching after reload
  // This prevents the login page flash when the user IS logged in but auth check isn't done yet
  const authLoading = isLoading || isRestoring || (isFetching && user === undefined);

  return {
    user: user ?? null,
    isLoading: authLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
