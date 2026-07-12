// ================================================================
// Fleet (Vehicles) — API_DOCUMENTATION.md §7
// ================================================================

import { VehicleInput } from "@/src/helpers/validation";
import { apiClient } from "@/src/lib/api-client";
import { queryKeys } from "@/src/lib/query-keys";
import {
  OperationalCost,
  Vehicle,
  VehicleStatus,
  VehicleType,
} from "@/src/lib/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface VehicleFilters extends Record<
  string,
  string | VehicleType | VehicleStatus | undefined
> {
  type?: VehicleType;
  status?: VehicleStatus;
  search?: string;
}

class VehicleService {
  list(filters?: VehicleFilters) {
    return apiClient.get<Vehicle[]>("/vehicles", filters);
  }
  /** The exact query the Trip Dispatcher's dropdown uses — server enforces
   * that Retired/In Shop never come back here, don't re-filter client-side only. */
  available() {
    return apiClient.get<Vehicle[]>("/vehicles/available");
  }
  getById(id: number) {
    return apiClient.get<Vehicle>(`/vehicles/${id}`);
  }
  history(id: number) {
    return apiClient.get<{ allocations: unknown[]; maintenance: unknown[] }>(
      `/vehicles/${id}/history`
    );
  }
  create(payload: VehicleInput) {
    return apiClient.post<Vehicle>("/vehicles", payload);
  }
  update(id: number, payload: Partial<VehicleInput>) {
    return apiClient.patch<Vehicle>(`/vehicles/${id}`, payload);
  }
  retire(id: number) {
    return apiClient.patch<Vehicle>(`/vehicles/${id}/retire`);
  }
  remove(id: number) {
    return apiClient.delete<void>(`/vehicles/${id}`);
  }
  operationalCost(id: number) {
    return apiClient.get<OperationalCost>(`/vehicles/${id}/operational-cost`);
  }
}

export const vehicleService = new VehicleService();

export function useVehicles(filters?: VehicleFilters) {
  return useQuery({
    queryKey: queryKeys.vehicles.list(filters),
    queryFn: () => vehicleService.list(filters),
  });
}

export function useAvailableVehicles() {
  return useQuery({
    queryKey: queryKeys.vehicles.available,
    queryFn: () => vehicleService.available(),
  });
}

export function useVehicle(id: number) {
  return useQuery({
    queryKey: queryKeys.vehicles.detail(id),
    queryFn: () => vehicleService.getById(id),
    enabled: !!id,
  });
}

export function useVehicleHistory(id: number) {
  return useQuery({
    queryKey: queryKeys.vehicles.history(id),
    queryFn: () => vehicleService.history(id),
    enabled: !!id,
  });
}

export function useVehicleOperationalCost(id: number) {
  return useQuery({
    queryKey: queryKeys.vehicles.operationalCost(id),
    queryFn: () => vehicleService.operationalCost(id),
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: vehicleService.create.bind(vehicleService),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard() });
    },
  });
}

export function useUpdateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<VehicleInput>;
    }) => vehicleService.update(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      qc.invalidateQueries({ queryKey: queryKeys.vehicles.detail(id) });
    },
  });
}

export function useRetireVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: vehicleService.retire.bind(vehicleService),
    onSuccess: () => {
      // Retiring changes the dispatch pool, dashboard counts, and analytics —
      // this is exactly the kind of cross-module ripple invalidateQueries exists for.
      qc.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard() });
      qc.invalidateQueries({ queryKey: queryKeys.analytics.summary() });
    },
  });
}
