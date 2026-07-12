"use client";

import { useState } from "react";
import Link from "next/link";
import { VehicleStatus, VehicleType } from "@/src/lib/type";
import { useDashboard } from "@/src/feature/dashboard/api";

const STATUS_BADGE: Record<string, string> = {
  ON_TRIP: "bg-blue-50 text-blue-700",
  DISPATCHED: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  DRAFT: "bg-slate-100 text-slate-500",
  CANCELLED: "bg-rose-50 text-rose-700",
};

const DISTRIBUTION_ROWS = [
  { key: "AVAILABLE", label: "Available", bar: "bg-emerald-500" },
  { key: "ON_TRIP", label: "On Trip", bar: "bg-blue-500" },
  { key: "IN_SHOP", label: "In Shop (Maintenance)", bar: "bg-amber-500" },
  { key: "RETIRED", label: "Retired", bar: "bg-rose-500" },
] as const;

export default function DashboardPage() {
  const [vehicleType, setVehicleType] = useState<VehicleType | "">("");
  const [status, setStatus] = useState<VehicleStatus | "">("");
  const [region, setRegion] = useState("");

  const { data, isLoading, isError } = useDashboard({
    vehicleType: vehicleType || undefined,
    status: status || undefined,
    region: region || undefined,
  });

  if (isLoading)
    return <p className="text-sm text-slate-400">Loading dashboard…</p>;
  if (isError || !data)
    return (
      <p className="text-sm text-rose-500">
        Couldn't load the dashboard. Try refreshing.
      </p>
    );

  // 1. Updated mapping for KPI cards
  const kpis = [
    {
      label: "Active Vehicles",
      value: data.vehicles.active,
      accent: "border-l-blue-500",
    },
    {
      label: "Available Vehicles",
      value: data.vehicles.available,
      accent: "border-l-emerald-500",
    },
    {
      label: "In Maintenance",
      value: data.vehicles.inShop,
      accent: "border-l-amber-500",
    },
    {
      label: "Active Trips",
      value: data.trips.active,
      accent: "border-l-transparent",
    },
    {
      label: "Pending Trips",
      value: data.trips.pending,
      accent: "border-l-transparent",
    },
    {
      label: "Drivers on Duty",
      value: data.drivers.onDuty,
      accent: "border-l-transparent",
    },
    {
      label: "Utilization Rate",
      value: `${data.fleetUtilizationPct}%`,
      accent: "border-l-transparent",
    },
  ];

  // 2. Updated mapping for Distribution Bars
  const vehicleStatusBreakdown = {
    AVAILABLE: data.vehicles.available,
    ON_TRIP: data.vehicles.onTrip,
    IN_SHOP: data.vehicles.inShop,
    RETIRED: data.vehicles.retired,
  };
  const maxCount = Math.max(1, ...Object.values(vehicleStatusBreakdown));

  // Optional: Fallback empty array if recentTrips was removed from this specific API response
  const recentTrips = data.recentTrips || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Filters
        </span>
        <FilterSelect
          label="Vehicle Type"
          value={vehicleType}
          onChange={v => setVehicleType(v as VehicleType | "")}
          options={[
            { value: "", label: "All" },
            { value: "VAN", label: "Van" },
            { value: "TRUCK", label: "Truck" },
            { value: "MINI_TRUCK", label: "Mini Truck" },
            { value: "BUS", label: "Bus" },
          ]}
        />
        <FilterSelect
          label="Status"
          value={status}
          onChange={v => setStatus(v as VehicleStatus | "")}
          options={[
            { value: "", label: "All" },
            { value: "AVAILABLE", label: "Available" },
            { value: "ON_TRIP", label: "On Trip" },
            { value: "IN_SHOP", label: "In Shop" },
            { value: "RETIRED", label: "Retired" },
          ]}
        />
        <FilterSelect
          label="Region"
          value={region}
          onChange={setRegion}
          options={[{ value: "", label: "All" }]}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
        {kpis.map(kpi => (
          <div
            key={kpi.label}
            className={`rounded-lg border border-slate-200 border-l-4 ${kpi.accent} bg-white p-4 shadow-sm`}
          >
            <p className="text-sm text-slate-500">{kpi.label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Recent Trips
            </h2>
            <Link
              href="/trips"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              View All
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="pb-2">Trip</th>
                <th className="pb-2">Vehicle</th>
                <th className="pb-2">Driver</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">ETA</th>
              </tr>
            </thead>
            <tbody>
              {recentTrips.length > 0 ? (
                recentTrips.map((trip: any) => (
                  <tr key={trip.tripCode} className="border-t border-slate-100">
                    <td className="py-3 font-medium text-slate-900">
                      {trip.tripCode}
                    </td>
                    <td className="py-3 text-slate-700">{trip.vehicle}</td>
                    <td className="py-3 text-slate-700">{trip.driver}</td>
                    <td className="py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium uppercase ${
                          STATUS_BADGE[trip.status] ??
                          "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {trip.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">{trip.eta}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-500">
                    No recent trips available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Vehicle Status Distribution
          </h2>
          <div className="space-y-4">
            {DISTRIBUTION_ROWS.map(row => {
              const count =
                vehicleStatusBreakdown[
                  row.key as keyof typeof vehicleStatusBreakdown
                ] ?? 0;
              return (
                <div key={row.key}>
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className="text-sm text-slate-700">{row.label}</span>
                    <span className="text-sm font-medium text-slate-900">
                      {count} Units
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className={`h-2 rounded-full ${row.bar}`}
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
      <span className="text-slate-400">{label}:</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-transparent text-slate-900 outline-none"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
