"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  Search,
  Plus,
  MoreVertical,
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

import {
  VehicleFilters,
  useVehicles,
  useRetireVehicle,
} from "@/src/feature/vehicles/api";
import { Vehicle, VehicleStatus, VehicleType } from "@/src/lib/type";

const PAGE_SIZE = 10;

const TYPE_LABEL: Record<VehicleType, string> = {
  VAN: "Van",
  TRUCK: "Truck",
  MINI_TRUCK: "Mini",
  BUS: "Bus",
  OTHER: "Other",
};

const STATUS_BADGE: Record<VehicleStatus, string> = {
  AVAILABLE: "bg-emerald-50 text-emerald-700",
  ON_TRIP: "bg-blue-50 text-blue-700",
  IN_SHOP: "bg-amber-50 text-amber-700",
  RETIRED: "bg-white border border-rose-300 text-rose-600",
};

const STATUS_LABEL: Record<VehicleStatus, string> = {
  AVAILABLE: "Available",
  ON_TRIP: "On Trip",
  IN_SHOP: "In Shop",
  RETIRED: "Retired",
};

function formatCapacity(kg: number) {
  return kg >= 1000 ? `${kg / 1000} Ton` : `${kg} kg`;
}

function formatOdometer(km: number) {
  return `${new Intl.NumberFormat("en-IN").format(km)} km`;
}

function formatCurrency(amount: number) {
  return `₹ ${new Intl.NumberFormat("en-IN").format(amount)}`;
}

export default function FleetPage() {
  const [type, setType] = useState<VehicleType | "">("");
  const [status, setStatus] = useState<VehicleStatus | "">("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Debounce the reg. no. search box
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // VehicleFilters only accepts type/status/search (all strings) — the API
  // has no server-side pagination, so page/pageSize can't be sent here.
  const filters: VehicleFilters = {
    type: type || undefined,
    status: status || undefined,
    search: search || undefined,
  };

  // useVehicles() resolves to vehicleService.list(), which returns a plain
  // Vehicle[] (no { vehicles, total } envelope) — paginate client-side.
  const { data: allVehicles, isLoading, isError } = useVehicles(filters);

  const total = allVehicles?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const vehicles = useMemo(() => {
    if (!allVehicles) return [];
    const start = (page - 1) * PAGE_SIZE;
    return allVehicles.slice(start, start + PAGE_SIZE);
  }, [allVehicles, page]);

  const retireVehicle = useRetireVehicle();

  function handleRetire(vehicle: Vehicle) {
    setOpenMenuId(null);
    if (confirm(`Retire ${vehicle.regNo}? This can't be undone.`)) {
      retireVehicle.mutate(vehicle.id);
    }
  }

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Vehicle Registry</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage and track your operational fleet assets.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <ToolbarSelect
          label="Type"
          value={type}
          onChange={v => {
            setType(v as VehicleType | "");
            setPage(1);
          }}
          options={[
            { value: "", label: "All" },
            { value: "VAN", label: "Van" },
            { value: "TRUCK", label: "Truck" },
            { value: "MINI_TRUCK", label: "Mini Truck" },
            { value: "BUS", label: "Bus" },
          ]}
        />
        <ToolbarSelect
          label="Status"
          value={status}
          onChange={v => {
            setStatus(v as VehicleStatus | "");
            setPage(1);
          }}
          options={[
            { value: "", label: "All" },
            { value: "AVAILABLE", label: "Available" },
            { value: "ON_TRIP", label: "On Trip" },
            { value: "IN_SHOP", label: "In Shop" },
            { value: "RETIRED", label: "Retired" },
          ]}
        />

        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search reg. no..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Export CSV removed: vehicleService has no exportCsv endpoint */}

        <Link
          href="/fleet/new"
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-zinc-100 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-6 py-3">Reg. No. (Unique)</th>
              <th className="px-6 py-3">Name/Model</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Capacity</th>
              <th className="px-6 py-3">Odometer</th>
              <th className="px-6 py-3">Acq. Cost</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-10 text-center text-zinc-400"
                >
                  Loading vehicles…
                </td>
              </tr>
            )}

            {isError && !isLoading && (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-10 text-center text-rose-500"
                >
                  Couldn't load vehicles. Try refreshing.
                </td>
              </tr>
            )}

            {!isLoading && !isError && vehicles.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-10 text-center text-zinc-400"
                >
                  No vehicles match these filters.
                </td>
              </tr>
            )}

            {vehicles.map(vehicle => (
              <tr key={vehicle.id} className="border-t border-zinc-100">
                <td className="px-6 py-4 text-zinc-700">{vehicle.regNo}</td>
                <td className="px-6 py-4 font-semibold text-zinc-900">
                  {vehicle.name}
                </td>
                <td className="px-6 py-4 text-zinc-700">
                  {TYPE_LABEL[vehicle.type]}
                </td>
                <td className="px-6 py-4 text-zinc-700">
                  {formatCapacity(vehicle.maxLoadCapacity)}
                </td>
                <td className="px-6 py-4 text-zinc-700">
                  {formatOdometer(vehicle.odometer)}
                </td>
                <td className="px-6 py-4 text-zinc-700">
                  {formatCurrency(vehicle.acquisitionCost)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${STATUS_BADGE[vehicle.status]}`}
                  >
                    {STATUS_LABEL[vehicle.status]}
                  </span>
                </td>
                <td className="relative px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenuId(id =>
                        id === vehicle.id ? null : vehicle.id
                      )
                    }
                    className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                    aria-label="Row actions"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {openMenuId === vehicle.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenuId(null)}
                      />
                      <div className="absolute right-6 top-10 z-20 w-40 rounded-lg border border-zinc-200 bg-white py-1 text-left shadow-lg">
                        <Link
                          href={`/fleet/${vehicle.id}`}
                          className="block px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                        >
                          View Details
                        </Link>
                        <Link
                          href={`/fleet/${vehicle.id}/edit`}
                          className="block px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                        >
                          Edit
                        </Link>
                        {vehicle.status !== "RETIRED" && (
                          <button
                            type="button"
                            onClick={() => handleRetire(vehicle)}
                            className="block w-full px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                          >
                            Retire Vehicle
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer: rule note + pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Info className="h-4 w-4 text-rose-400" />
            Rule: Registration No. must be unique • Retired/In Shop vehicles are
            hidden from Trip Dispatcher
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-500">
              Showing {vehicles.length} of {total} vehicles
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded border border-zinc-200 p-1.5 text-zinc-500 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded border border-zinc-200 p-1.5 text-zinc-500 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/*
        Fleet Health Monitor and Registry Integrity cards removed: the API
        (VehicleService) has no useFleetHealth, useRegistryIntegrity, or
        useRunAuditReport equivalents — only list/available/getById/history/
        create/update/retire/remove/operationalCost. Add those endpoints
        and hooks to src/feature/vehicles/api.ts before reintroducing this
        section.
      */}
    </div>
  );
}

// ---------------------------------------------------------------
// Toolbar select — "Type: All ⌄" pill style
// ---------------------------------------------------------------
function ToolbarSelect({
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
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none rounded-lg border border-zinc-300 bg-white py-2 pl-4 pr-9 text-sm text-zinc-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        aria-label={label}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {label}: {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
    </div>
  );
}
