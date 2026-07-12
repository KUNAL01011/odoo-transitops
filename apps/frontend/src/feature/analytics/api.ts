import { apiClient } from "@/src/lib/api-client";
import { queryKeys } from "@/src/lib/query-keys";
import { AnalyticsSummary } from "@/src/lib/type";
import { useQuery } from "@tanstack/react-query";

export interface AnalyticsFilters {
  [key: string]: string | number | undefined;
  vehicleId?: number;
  from?: string;
  to?: string;
}

interface MonthlyTrendPoint {
  month: string;
  cost: number;
}

interface TopMaintenanceVehicle {
  vehicle: string;
  cost: number;
}

class AnalyticsService {
  summary(filters?: AnalyticsFilters) {
    return apiClient.get<AnalyticsSummary>("/analytics/summary", filters);
  }
  monthlyTrend() {
    return apiClient.get<MonthlyTrendPoint[]>("/analytics/monthly-trend");
  }
  topMaintenanceVehicles() {
    return apiClient.get<TopMaintenanceVehicle[]>(
      "/analytics/top-maintenance-vehicles"
    );
  }

  async export(format: "csv" | "pdf" = "csv") {
    const res = await fetch(`/api/analytics/export?format=${format}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Export failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transitops-report.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const analyticsService = new AnalyticsService();

export function useAnalyticsSummary(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: queryKeys.analytics.summary(filters),
    queryFn: () => analyticsService.summary(filters),
  });
}

export function useMonthlyTrend() {
  return useQuery({
    queryKey: queryKeys.analytics.monthlyTrend,
    queryFn: () => analyticsService.monthlyTrend(),
  });
}

export function useTopMaintenanceVehicles() {
  return useQuery({
    queryKey: queryKeys.analytics.topMaintenanceVehicles,
    queryFn: () => analyticsService.topMaintenanceVehicles(),
  });
}
