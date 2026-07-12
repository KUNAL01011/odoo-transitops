import { TripCompleteInput, TripInput } from "@/src/helpers/validation";
import { apiClient } from "@/src/lib/api-client";
import { queryKeys } from "@/src/lib/query-keys";

import { Trip, TripStatus } from "@/src/lib/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type TripFilterValue = string | number | boolean | null | undefined;

export interface TripFilters extends Record<string, TripFilterValue> {
  status?: TripStatus;
  search?: string;
}

class TripService {
  list(filters?: TripFilters) {
    return apiClient.get<Trip[]>("/trips", filters);
  }
  getById(id: number) {
    return apiClient.get<Trip>(`/trips/${id}`);
  }
  create(payload: TripInput) {
    return apiClient.post<Trip>("/trips", payload);
  }
  update(id: number, payload: Partial<TripInput>) {
    return apiClient.patch<Trip>(`/trips/${id}`, payload);
  }
  dispatch(id: number) {
    return apiClient.post<Trip>(`/trips/${id}/dispatch`);
  }
  complete(id: number, payload: TripCompleteInput) {
    return apiClient.post<Trip>(`/trips/${id}/complete`, payload);
  }
  cancel(id: number, reason?: string) {
    return apiClient.post<Trip>(`/trips/${id}/cancel`, { reason });
  }
  remove(id: number) {
    return apiClient.delete<void>(`/trips/${id}`);
  }
}

export const tripService = new TripService();

/** Client-side pre-check so the form can show "Capacity exceeded by 200 kg"
 * immediately, before round-tripping to the server. The server re-checks
 * this regardless — never trust this alone. */
export function checkCargoCapacity(
  cargoWeight: number,
  vehicleMaxLoad: number
) {
  const exceeded = cargoWeight - vehicleMaxLoad;
  return {
    ok: exceeded <= 0,
    message: exceeded > 0 ? `Capacity exceeded by ${exceeded} kg` : null,
  };
}

export function useTrips(filters?: TripFilters) {
  return useQuery({
    queryKey: queryKeys.trips.list(filters),
    queryFn: () => tripService.list(filters),
  });
}

export function useTrip(id: number) {
  return useQuery({
    queryKey: queryKeys.trips.detail(id),
    queryFn: () => tripService.getById(id),
    enabled: !!id,
  });
}

function invalidateTripSideEffects(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: queryKeys.trips.all });
  qc.invalidateQueries({ queryKey: queryKeys.vehicles.all });
  qc.invalidateQueries({ queryKey: queryKeys.drivers.all });
  qc.invalidateQueries({ queryKey: queryKeys.dashboard() });
  qc.invalidateQueries({ queryKey: queryKeys.analytics.summary() });
}

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tripService.create.bind(tripService),
    // Creating a Draft has no vehicle/driver side effects, so only trips list needs it.
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.trips.all }),
  });
}

export function useDispatchTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tripId: number) => tripService.dispatch(tripId),
    onSuccess: () => invalidateTripSideEffects(qc),
  });
}

export function useCompleteTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TripCompleteInput }) =>
      tripService.complete(id, payload),
    onSuccess: () => {
      invalidateTripSideEffects(qc);
      // Completing a trip auto-creates a fuel log server-side (spec rule).
      qc.invalidateQueries({ queryKey: queryKeys.fuelLogs.all });
    },
  });
}

export function useCancelTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      tripService.cancel(id, reason),
    onSuccess: () => invalidateTripSideEffects(qc),
  });
}
