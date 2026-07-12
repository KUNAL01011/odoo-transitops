// ================================================================
// Maintenance — API_DOCUMENTATION.md §10
// ================================================================

import { MaintenanceInput } from "@/src/helpers/validation";
import { apiClient } from "@/src/lib/api-client";
import { queryKeys } from "@/src/lib/query-keys";
import { MaintenanceLog, MaintenanceStatus } from "@/src/lib/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface MaintenanceFilters {
  status?: MaintenanceStatus;
  vehicleId?: number;
  [key: string]: any;
}

class MaintenanceService {
  list(filters?: MaintenanceFilters) {
    return apiClient.get<MaintenanceLog[]>("/maintenance", filters);
  }
  getById(id: number) {
    return apiClient.get<MaintenanceLog>(`/maintenance/${id}`);
  }
  create(payload: MaintenanceInput) {
    return apiClient.post<MaintenanceLog>("/maintenance", payload);
  }
  update(id: number, payload: Partial<MaintenanceInput>) {
    return apiClient.patch<MaintenanceLog>(`/maintenance/${id}`, payload);
  }
  close(id: number) {
    return apiClient.post<MaintenanceLog>(`/maintenance/${id}/close`);
  }
}

export const maintenanceService = new MaintenanceService();

export function useMaintenanceLogs(filters?: MaintenanceFilters) {
  return useQuery({
    queryKey: queryKeys.maintenance.list(filters),
    queryFn: () => maintenanceService.list(filters),
  });
}

export function useMaintenanceLog(id: number) {
  return useQuery({
    queryKey: queryKeys.maintenance.detail(id),
    queryFn: () => maintenanceService.getById(id),
    enabled: !!id,
  });
}

function invalidateMaintenanceSideEffects(
  qc: ReturnType<typeof useQueryClient>
) {
  qc.invalidateQueries({ queryKey: queryKeys.maintenance.all });
  // Opening/closing a record flips the vehicle's status (→ In Shop / → Available).
  qc.invalidateQueries({ queryKey: queryKeys.vehicles.all });
  qc.invalidateQueries({ queryKey: queryKeys.dashboard() });
  qc.invalidateQueries({ queryKey: queryKeys.analytics.summary() });
}

export function useCreateMaintenanceLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: maintenanceService.create.bind(maintenanceService),
    onSuccess: () => invalidateMaintenanceSideEffects(qc),
  });
}

export function useCloseMaintenanceLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: maintenanceService.close.bind(maintenanceService),
    onSuccess: () => invalidateMaintenanceSideEffects(qc),
  });
}
