import { useQuery } from "@tanstack/react-query";
import { apiClient, API_BASE_URL } from "@/src/lib/api-client";
import { queryKeys } from "@/src/lib/query-keys";
import {
  AnalyticsSummary,
  TopCostVehicle,
  PerformanceAlert,
} from "@/src/lib/type";

export interface AnalyticsFilters extends Record<string, any> {
  vehicleId?: number;
  from?: string;
  to?: string;
}

interface MonthlyTrendPoint {
  month: string;
  cost: number;
}

interface MonthlyRevenuePoint {
  month: string;
  revenue: number;
}

class AnalyticsService {
  summary(filters?: AnalyticsFilters) {
    return apiClient.get<AnalyticsSummary>("/analytics/summary", filters);
  }
  monthlyTrend() {
    return apiClient.get<MonthlyTrendPoint[]>("/analytics/monthly-trend");
  }
  topMaintenanceVehicles() {
    return apiClient.get<TopCostVehicle[]>(
      "/analytics/top-maintenance-vehicles"
    );
  }
  /** NOT YET BUILT on the backend — needs a Revenue data source (per-trip
   * revenue field, most likely) before this route can return real numbers. */
  monthlyRevenue() {
    return apiClient.get<MonthlyRevenuePoint[]>("/analytics/monthly-revenue");
  }
  /** NOT YET BUILT on the backend — needs a rules engine or scheduled job
   * comparing live metrics against thresholds (e.g. fuel efficiency < X for
   * N consecutive days, maintenance overdue by date). */
  performanceAlerts() {
    return apiClient.get<PerformanceAlert[]>("/analytics/performance-alerts");
  }
  /** Triggers a file download rather than returning JSON — handled outside
   * the shared ApiClient since the response isn't application/json.
   * PDF returns 501 today (spec marks it optional) — default to CSV. */
  async export(format: "csv" | "pdf" = "csv") {
    const res = await fetch(
      `${API_BASE_URL}/analytics/export?format=${format}`,
      { credentials: "include" }
    );
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

/** Errors until /analytics/monthly-revenue exists — page renders an empty
 * state rather than crashing in the meantime. */
export function useMonthlyRevenueTrend() {
  return useQuery({
    queryKey: ["analytics", "monthly-revenue"],
    queryFn: () => analyticsService.monthlyRevenue(),
    retry: false,
  });
}

/** Errors until /analytics/performance-alerts exists — same graceful
 * empty-state handling. */
export function usePerformanceAlerts() {
  return useQuery({
    queryKey: ["analytics", "performance-alerts"],
    queryFn: () => analyticsService.performanceAlerts(),
    retry: false,
  });
}
