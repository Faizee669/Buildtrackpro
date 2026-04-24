import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export interface UserProfile {
  id: string
  email: string | null
  firstName: string | null
  lastName: string | null
  profileImageUrl: string | null
  companyName: string | null
  plan: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  notificationsEmail: boolean
  notificationsOverbudget: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateProfilePayload {
  firstName?: string
  lastName?: string
  companyName?: string
  notificationsEmail?: boolean
  notificationsOverbudget?: boolean
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    credentials: "include",
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

export function useUserProfile() {
  return useQuery<UserProfile>({
    queryKey: ["user-profile"],
    queryFn: () => apiFetch<UserProfile>("/api/settings/profile"),
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateProfilePayload) =>
      apiFetch<UserProfile>("/api/settings/profile", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-profile"] }),
  })
}
