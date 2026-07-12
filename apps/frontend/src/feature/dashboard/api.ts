import { apiClient } from "@/src/lib/api-client";
import { queryKeys } from "@/src/lib/query-keys";
import { DashboardSummary, VehicleStatus, VehicleType } from "@/src/lib/type";
import { useQuery } from "@tanstack/react-query";

export interface DashboardFilters {
  vehicleType?: VehicleType;
  status?: VehicleStatus;
  region?: string;
  [key: string]: string | VehicleType | VehicleStatus | undefined;
}

class DashboardService {
  get(filters?: DashboardFilters) {
    return apiClient.get<DashboardSummary>("/dashboard", filters);
  }
}

export const dashboardService = new DashboardService();

export function useDashboard(filters?: DashboardFilters) {
  return useQuery({
    queryKey: queryKeys.dashboard(filters),
    queryFn: () => dashboardService.get(filters),
    // Dashboard is a live ops view — refetch a bit more eagerly than other screens.
    refetchInterval: 60_000,
  });
}
