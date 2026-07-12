"use client";

import {
  Calendar,
  Download,
  Info,
  TrendingUp,
  TrendingDown,
  Truck,
  AlertTriangle,
  Clock,
} from "lucide-react";
import {
  useAnalyticsSummary,
  useMonthlyTrend,
  useMonthlyRevenueTrend,
  useTopMaintenanceVehicles,
  usePerformanceAlerts,
  analyticsService,
} from "@/src/feature/analytics/api";
import { formatCurrency } from "@/src/lib/utils/format";

export default function AnalyticsPage() {
  const { data: summary, isLoading } = useAnalyticsSummary();
  const { data: costTrend } = useMonthlyTrend();
  const { data: revenueTrend } = useMonthlyRevenueTrend(); // not built on backend yet — see note below chart
  const { data: topCostly } = useTopMaintenanceVehicles();
  const { data: alerts } = usePerformanceAlerts(); // not built on backend yet — see empty state below

  const maxMaintenance = Math.max(1, ...(topCostly?.map(v => v.cost) ?? [1]));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Reports &amp; Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Operational performance overview
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
            <Calendar className="h-4 w-4" />
            Last 30 Days
          </button>
          <button
            onClick={() => analyticsService.export("csv")}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {isLoading || !summary ? (
        <p className="text-sm text-slate-400">Loading analytics…</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <KpiCard
            label="Fuel Efficiency"
            value={`${summary.fuelEfficiencyKmPerL}`}
            unit="km/l"
            delta={summary.fuelEfficiencyDeltaPct}
            deltaGoodDirection="up"
          />
          <KpiCard
            label="Fleet Utilization"
            value={`${summary.fleetUtilizationPct}%`}
            delta={summary.fleetUtilizationDeltaPct}
            deltaGoodDirection="up"
          />
          <KpiCard
            label="Operational Cost"
            value={formatCurrency(summary.operationalCost)}
            delta={summary.operationalCostDeltaPct}
            deltaGoodDirection="down"
            deltaReason={summary.operationalCostDeltaReason}
          />
          <KpiCard
            label="Vehicle ROI"
            value={`${summary.vehicleRoiPct}%`}
            note={
              summary.roiIndustryTargetPct !== undefined
                ? `Above industry target (${summary.roiIndustryTargetPct}%)`
                : undefined
            }
            deltaGoodDirection="up"
          />
        </div>
      )}

      <p className="flex items-center gap-1.5 text-xs text-slate-400">
        <Info className="h-3.5 w-3.5" />
        ROI = [Revenue − (Maintenance + Fuel)] / Acquisition Cost.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Monthly Revenue
            </h2>
            {revenueTrend && (
              <span className="text-sm font-semibold text-indigo-600">
                {formatCurrency(
                  revenueTrend.reduce((sum, p) => sum + p.revenue, 0)
                )}{" "}
                Total
              </span>
            )}
          </div>

          {revenueTrend ? (
            <RevenueBarChart data={revenueTrend} />
          ) : (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-center text-sm text-slate-400">
              <p>Revenue tracking isn't wired up on the backend yet.</p>
              <p className="text-xs">
                Add a Revenue field (e.g. per-trip revenue) and a{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-500">
                  /analytics/monthly-revenue
                </code>{" "}
                route to populate this chart.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Top Costliest Vehicles
            </h2>
            <button className="text-sm font-medium text-indigo-600 hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {topCostly?.slice(0, 3).map((v, i) => {
              const barColor =
                i === 0
                  ? "bg-rose-500"
                  : i === 1
                    ? "bg-amber-500"
                    : "bg-blue-500";
              const textColor =
                i === 0
                  ? "text-rose-600"
                  : i === 1
                    ? "text-amber-600"
                    : "text-blue-600";
              return (
                <div key={v.vehicle}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Truck className="h-4 w-4 text-slate-400" />
                      {v.vehicle}
                    </span>
                    <span className={`text-sm font-semibold ${textColor}`}>
                      {formatCurrency(v.cost)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100">
                    <div
                      className={`h-1.5 rounded-full ${barColor}`}
                      style={{ width: `${(v.cost / maxMaintenance) * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {v.primaryCostReason ?? "Cost breakdown not available yet"}
                  </p>
                </div>
              );
            })}
            {(!topCostly || topCostly.length === 0) && (
              <p className="text-sm text-slate-400">
                No maintenance cost data yet.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Performance Alerts
          </h2>
          {alerts && alerts.length > 0 && (
            <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
              {alerts.length} Action Item{alerts.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <div>
          {alerts && alerts.length > 0 ? (
            alerts.map(alert => (
              <div
                key={alert.id}
                className="flex items-start justify-between gap-4 border-b border-slate-50 px-5 py-4 last:border-0"
              >
                <div className="flex items-start gap-3">
                  {alert.severity === "warning" ? (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                  ) : (
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {alert.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {alert.description}
                    </p>
                  </div>
                </div>
                <a
                  href={alert.actionHref}
                  className="shrink-0 text-sm font-medium text-indigo-600 hover:underline"
                >
                  {alert.actionLabel}
                </a>
              </div>
            ))
          ) : (
            <div className="px-5 py-6 text-center text-sm text-slate-400">
              <p>No performance alerts configured yet.</p>
              <p className="mt-1 text-xs">
                Needs a backend rules engine (e.g. "efficiency below X for N
                days," "maintenance overdue by date") and a{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-500">
                  /analytics/performance-alerts
                </code>{" "}
                route.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  unit,
  delta,
  deltaGoodDirection,
  deltaReason,
  note,
}: {
  label: string;
  value: string;
  unit?: string;
  delta?: number;
  deltaGoodDirection: "up" | "down";
  deltaReason?: string;
  note?: string;
}) {
  const hasDelta = delta !== undefined;
  const isGood =
    hasDelta && (deltaGoodDirection === "up" ? delta! >= 0 : delta! <= 0);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">
        {value}{" "}
        {unit && (
          <span className="text-sm font-normal text-slate-400">{unit}</span>
        )}
      </p>
      {hasDelta && (
        <p
          className={`mt-1 flex items-center gap-1 text-xs font-medium ${isGood ? "text-emerald-600" : "text-rose-600"}`}
        >
          {isGood ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          {delta! > 0 ? "+" : ""}
          {delta}% {deltaReason ? `(${deltaReason})` : "from last month"}
        </p>
      )}
      {!hasDelta && note && (
        <p className="mt-1 text-xs font-medium text-emerald-600">{note}</p>
      )}
    </div>
  );
}

function RevenueBarChart({
  data,
}: {
  data: { month: string; revenue: number }[];
}) {
  const max = Math.max(1, ...data.map(d => d.revenue));
  return (
    <div className="flex h-48 items-end gap-3">
      {data.map((point, i) => (
        <div
          key={point.month}
          className="flex flex-1 flex-col items-center gap-2"
        >
          <div
            className={`w-full rounded-t ${i < data.length - 4 ? "bg-indigo-200" : "bg-indigo-600"}`}
            style={{ height: `${(point.revenue / max) * 100}%` }}
          />
          <span className="text-xs uppercase text-slate-400">
            {point.month}
          </span>
        </div>
      ))}
    </div>
  );
}
