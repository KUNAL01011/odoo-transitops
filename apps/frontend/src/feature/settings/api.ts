// ================================================================
// Settings & RBAC — API_DOCUMENTATION.md §13
// Gated to FLEET_MANAGER per the default role matrix — see useMe()
// + hasModuleAccess() from features/auth/api.ts for guarding the route.
// ================================================================

import { SettingsInput } from "@/src/helpers/validation";
import { apiClient } from "@/src/lib/api-client";
import { queryKeys } from "@/src/lib/query-keys";
import { RolePermission, SystemSettings } from "@/src/lib/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

class SettingsService {
  get() {
    return apiClient.get<SystemSettings>("/settings");
  }
  update(payload: SettingsInput) {
    return apiClient.patch<SystemSettings>("/settings", payload);
  }
  getRbac() {
    return apiClient.get<RolePermission[]>("/settings/rbac");
  }
  updateRbac(permissions: RolePermission[]) {
    return apiClient.patch<RolePermission[]>("/settings/rbac", { permissions });
  }
}

export const settingsService = new SettingsService();

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings.general,
    queryFn: () => settingsService.get(),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: settingsService.update.bind(settingsService),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.settings.general }),
  });
}

export function useRbacMatrix() {
  return useQuery({
    queryKey: queryKeys.settings.rbac,
    queryFn: () => settingsService.getRbac(),
  });
}

export function useUpdateRbacMatrix() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: settingsService.updateRbac.bind(settingsService),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.settings.rbac });
      // Every role's nav/route-guards read from useMe()'s permissions —
      // refresh it immediately so a changed matrix takes effect without reload.
      qc.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}
