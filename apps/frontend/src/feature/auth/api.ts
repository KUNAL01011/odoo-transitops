// ================================================================
// Auth — API_DOCUMENTATION.md §5
// If you end up using NextAuth's own signIn()/signOut()/useSession(),
// you may only need useMe() from this file — keep the rest for a
// fully custom auth flow.
// ================================================================

import { apiClient } from "@/src/lib/api-client";
import { queryKeys } from "@/src/lib/query-keys";
import { RolePermission, User } from "@/src/lib/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface LoginInput {
  email: string;
  password: string;
}

interface LoginResponse {
  user: Pick<User, "id" | "name" | "email" | "role">;
  token?: string;
}

interface MeResponse extends Pick<User, "id" | "name" | "email" | "role"> {
  permissions: RolePermission[];
}

class AuthService {
  login(payload: LoginInput) {
    return apiClient.post<LoginResponse>("/auth/login", payload);
  }
  logout() {
    return apiClient.post<void>("/auth/logout");
  }
  me() {
    return apiClient.get<MeResponse>("/auth/me");
  }
  forgotPassword(email: string) {
    return apiClient.post<void>("/auth/forgot-password", { email });
  }
  resetPassword(token: string, password: string) {
    return apiClient.post<void>("/auth/reset-password", { token, password });
  }
}

export const authService = new AuthService();

export function useMe() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => authService.me(),
    retry: false, // a 401 here means "not logged in," don't retry it
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authService.login.bind(authService),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.auth.me }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authService.logout.bind(authService),
    onSuccess: () => qc.clear(), // wipe the entire cache on logout — don't leak the next user's stale data
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: authService.forgotPassword.bind(authService),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authService.resetPassword(token, password),
  });
}

/** Small helper for route guards / conditional nav rendering. */
export function hasModuleAccess(
  permissions: RolePermission[] | undefined,
  module: RolePermission["module"],
  need: "view" | "edit" = "view"
): boolean {
  const perm = permissions?.find(p => p.module === module);
  if (!perm) return false;
  return need === "view" ? perm.canView : perm.canEdit;
}
