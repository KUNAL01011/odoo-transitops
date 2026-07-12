// ================================================================
// Drivers — API_DOCUMENTATION.md §8
// ================================================================

import { DriverInput } from "@/src/helpers/validation";
import { apiClient } from "@/src/lib/api-client";
import { queryKeys } from "@/src/lib/query-keys";
import { Driver, DriverStatus } from "@/src/lib/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface DriverFilters {
  status?: DriverStatus;
  search?: string;
  [key: string]: unknown;
}

class DriverService {
  list(filters?: DriverFilters) {
    // apiClient.get expects a QueryParams/index signature; cast filters to a plain record
    return apiClient.get<Driver[]>(
      "/drivers",
      filters as unknown as Record<string, any>
    );
  }
  /** Server-side filters to status=AVAILABLE AND licenseExpiry > now — both
   * conditions, not just status. See API_DOCUMENTATION.md §8. */
  available() {
    return apiClient.get<Driver[]>("/drivers/available");
  }
  getById(id: number) {
    return apiClient.get<Driver>(`/drivers/${id}`);
  }
  create(payload: DriverInput) {
    return apiClient.post<Driver>("/drivers", payload);
  }
  update(id: number, payload: Partial<DriverInput>) {
    return apiClient.patch<Driver>(`/drivers/${id}`, payload);
  }
  suspend(id: number) {
    return apiClient.patch<Driver>(`/drivers/${id}/suspend`);
  }
  reinstate(id: number) {
    return apiClient.patch<Driver>(`/drivers/${id}/reinstate`);
  }
  remove(id: number) {
    return apiClient.delete<void>(`/drivers/${id}`);
  }
}

export const driverService = new DriverService();

export function useDrivers(filters?: DriverFilters) {
  return useQuery({
    queryKey: queryKeys.drivers.list(filters),
    queryFn: () => driverService.list(filters),
  });
}

export function useAvailableDrivers() {
  return useQuery({
    queryKey: queryKeys.drivers.available,
    queryFn: () => driverService.available(),
  });
}

export function useDriver(id: number) {
  return useQuery({
    queryKey: queryKeys.drivers.detail(id),
    queryFn: () => driverService.getById(id),
    enabled: !!id,
  });
}

export function useCreateDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: driverService.create.bind(driverService),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.drivers.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard() });
    },
  });
}

export function useUpdateDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<DriverInput>;
    }) => driverService.update(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.drivers.all });
      qc.invalidateQueries({ queryKey: queryKeys.drivers.detail(id) });
    },
  });
}

export function useSuspendDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: driverService.suspend.bind(driverService),
    onSuccess: () => {
      // A suspended driver disappears from the Trip Dispatcher's pool immediately.
      qc.invalidateQueries({ queryKey: queryKeys.drivers.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard() });
    },
  });
}

export function useReinstateDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: driverService.reinstate.bind(driverService),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.drivers.all }),
  });
}
