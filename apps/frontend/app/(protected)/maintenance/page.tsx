"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useVehicles } from "@/src/feature/vehicles/api";
import { Vehicle, VehicleType } from "@/src/lib/type";

import {
  Wrench,
  Wallet,
  AlertTriangle,
  Lock,
  ChevronDown,
  ArrowRight,
  Info,
  MoreVertical,
  Loader2,
  Car,
  Truck as TruckIcon,
  Bus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  MaintenanceFilters,
  useMaintenanceLogs,
  useCreateMaintenanceLog,
  useCloseMaintenanceLog,
} from "@/src/feature/maintenance/api";

const PAGE_SIZE = 4;
const MONTHLY_TARGET = 30_000; // no /maintenance summary endpoint exists — hardcoded target line, same as the mock

const SERVICE_TYPES = [
  "Oil Change",
  "Engine Repair",
  "Tyre Replace",
  "A/C Refill",
  "Brake Service",
  "Inspection",
  "Other",
];

const STATUS_BADGE: Record<string, string> = {
  IN_SHOP: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
};

const STATUS_LABEL: Record<string, string> = {
  IN_SHOP: "In Shop",
  COMPLETED: "Completed",
};

function VehicleIcon({
  type,
  className,
}: {
  type?: VehicleType;
  className?: string;
}) {
  switch (type) {
    case "TRUCK":
    case "MINI_TRUCK":
      return <TruckIcon className={className} />;
    case "BUS":
      return <Bus className={className} />;
    default:
      return <Car className={className} />;
  }
}

function formatCurrency(amount: number) {
  return `$${new Intl.NumberFormat("en-US").format(amount)}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function MaintenancePage() {
  const searchParams = useSearchParams();
  const lockedVehicleIdParam = searchParams.get("vehicleId");
  const lockedVehicleId = lockedVehicleIdParam
    ? Number(lockedVehicleIdParam)
    : null;

  // maintenanceService.list() has no server-side pagination, so we pull the
  // full set once and paginate/derive stats client-side, same pattern as
  // the Fleet page.
  const { data: allLogs, isLoading, isError } = useMaintenanceLogs();
  const { data: vehicles } = useVehicles();

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [formVehicleId, setFormVehicleId] = useState<number | null>(
    lockedVehicleId
  );
  const [serviceType, setServiceType] = useState(SERVICE_TYPES[0]);
  const [cost, setCost] = useState("");
  const [date, setDate] = useState(todayISO());

  const createLog = useCreateMaintenanceLog();
  const closeLog = useCloseMaintenanceLog();

  const vehicleById = useMemo(() => {
    const map = new Map<number, Vehicle>();
    (vehicles ?? []).forEach(v => map.set(v.id, v));
    return map;
  }, [vehicles]);

  const filteredLogs = useMemo(() => {
    if (!allLogs) return [];
    return allLogs.filter(log => {
      if (lockedVehicleId && log.vehicleId !== lockedVehicleId) return false;
      if (statusFilter && log.status !== statusFilter) return false;
      return true;
    });
  }, [allLogs, lockedVehicleId, statusFilter]);

  const total = filteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageLogs = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, page]);

  // Derived stats — no dedicated summary endpoint on MaintenanceService,
  // so these are computed from the full unfiltered log list.
  const vehiclesInShop = useMemo(() => {
    if (!allLogs) return 0;
    return new Set(
      allLogs.filter(l => l.status === "IN_SHOP").map(l => l.vehicleId)
    ).size;
  }, [allLogs]);

  const monthlySpend = useMemo(() => {
    if (!allLogs) return 0;
    const now = new Date();
    return allLogs
      .filter(l => {
        const d = new Date(l.date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, l) => sum + (l.cost ?? 0), 0);
  }, [allLogs]);

  function handleSave() {
    if (!formVehicleId) {
      alert("Select a vehicle first.");
      return;
    }
    const parsedCost = Number(cost);
    if (!cost || Number.isNaN(parsedCost)) {
      alert("Enter a valid cost.");
      return;
    }
    createLog.mutate(
      {
        vehicleId: formVehicleId,
        serviceType,
        cost: parsedCost,
        date,
      },
      {
        onSuccess: () => {
          setCost("");
          setServiceType(SERVICE_TYPES[0]);
          setDate(todayISO());
        },
      }
    );
  }

  function handleClose(id: number) {
    setOpenMenuId(null);
    closeLog.mutate(id);
  }

  const lockedVehicle = lockedVehicleId
    ? vehicleById.get(lockedVehicleId)
    : undefined;

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">
          Maintenance Management
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Schedule and monitor vehicle health and service history.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Wrench className="h-5 w-5 text-indigo-600" />}
          iconBg="bg-indigo-50"
          label="Vehicles In Shop"
          value={String(vehiclesInShop)}
        />
        <StatCard
          icon={<Wallet className="h-5 w-5 text-indigo-600" />}
          iconBg="bg-indigo-50"
          label="Monthly Maintenance Spend"
          value={formatCurrency(monthlySpend)}
          suffix={`Target: ${formatCurrency(MONTHLY_TARGET)}`}
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
          iconBg="bg-amber-50"
          label="Pending Inspections"
          value="—"
          suffix="No inspection endpoint yet"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        {/* Log Service Record */}
        <div className="h-fit rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Log Service Record
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Vehicle
              </label>
              {lockedVehicle ? (
                <div className="flex items-center justify-between rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-900">
                  {lockedVehicle.regNo}
                  <Lock className="h-4 w-4 text-zinc-400" />
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={formVehicleId ?? ""}
                    onChange={e =>
                      setFormVehicleId(Number(e.target.value) || null)
                    }
                    className="w-full appearance-none rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Select vehicle…</option>
                    {(vehicles ?? []).map(v => (
                      <option key={v.id} value={v.id}>
                        {v.regNo}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Service Type
              </label>
              <div className="relative">
                <select
                  value={serviceType}
                  onChange={e => setServiceType(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {SERVICE_TYPES.map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Cost (USD)
              </label>
              <input
                type="number"
                min={0}
                value={cost}
                onChange={e => setCost(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Status
              </label>
              <div className="rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
                Active
              </div>
            </div>

            {/* Action impact — informational only, mirrors the vehicle status
                side effect that create()/close() trigger on the backend. */}
            <div className="rounded-lg bg-zinc-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Action Impact
                </span>
                <Info className="h-3.5 w-3.5 text-zinc-400" />
              </div>
              <div className="space-y-2">
                <ImpactRow
                  from="Available"
                  to="In Shop"
                  toClass={STATUS_BADGE.IN_SHOP}
                />
                <ImpactRow
                  from="In Shop"
                  to="Available"
                  toClass="bg-emerald-100 text-emerald-700"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={createLog.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {createLog.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Save Record
            </button>
          </div>
        </div>

        {/* Service Log */}
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Service Log
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={e => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="appearance-none rounded-lg border border-zinc-300 bg-white py-2 pl-4 pr-9 text-sm text-zinc-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">All Records</option>
                  <option value="IN_SHOP">In Shop</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              </div>
              <button
                type="button"
                onClick={() =>
                  alert("CSV export isn't wired to a backend endpoint yet.")
                }
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Export CSV
              </button>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-6 py-3">Vehicle</th>
                <th className="px-6 py-3">Service</th>
                <th className="px-6 py-3">Cost</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-zinc-400"
                  >
                    Loading service log…
                  </td>
                </tr>
              )}

              {isError && !isLoading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-rose-500"
                  >
                    Couldn't load maintenance records. Try refreshing.
                  </td>
                </tr>
              )}

              {!isLoading && !isError && pageLogs.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-zinc-400"
                  >
                    No service records match these filters.
                  </td>
                </tr>
              )}

              {pageLogs.map(log => {
                const vehicle = vehicleById.get(log.vehicleId);
                return (
                  <tr key={log.id} className="border-t border-zinc-100">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100">
                          <VehicleIcon
                            type={vehicle?.type}
                            className="h-4 w-4 text-zinc-500"
                          />
                        </div>
                        <span className="font-semibold text-zinc-900">
                          {vehicle?.regNo ?? `#${log.vehicleId}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-700">
                      {log.serviceType}
                    </td>
                    <td className="px-6 py-4 font-semibold text-zinc-900">
                      {formatCurrency(log.cost)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[log.status] ?? "bg-zinc-100 text-zinc-600"}`}
                      >
                        {STATUS_LABEL[log.status] ?? log.status}
                      </span>
                    </td>
                    <td className="relative px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId(id => (id === log.id ? null : log.id))
                        }
                        className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                        aria-label="Row actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {openMenuId === log.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-6 top-10 z-20 w-44 rounded-lg border border-zinc-200 bg-white py-1 text-left shadow-lg">
                            {log.status !== "COMPLETED" ? (
                              <button
                                type="button"
                                onClick={() => handleClose(log.id)}
                                className="block w-full px-3 py-2 text-left text-sm text-emerald-600 hover:bg-emerald-50"
                              >
                                Mark Completed
                              </button>
                            ) : (
                              <span className="block px-3 py-2 text-sm text-zinc-400">
                                No actions available
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 px-6 py-4">
            <span className="text-sm text-zinc-500">
              Showing {pageLogs.length} of {total} service events
            </span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-500">
                Page {page} of {totalPages}
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
      </div>
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
  suffix,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {label}
        </p>
        <p className="mt-1 flex items-baseline gap-2 text-2xl font-bold text-zinc-900">
          {value}
          {suffix && (
            <span className="text-xs font-normal text-zinc-400">{suffix}</span>
          )}
        </p>
      </div>
    </div>
  );
}

function ImpactRow({
  from,
  to,
  toClass,
}: {
  from: string;
  to: string;
  toClass: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-medium">
      <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-zinc-600">
        {from}
      </span>
      <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
      <span className={`rounded-full px-2.5 py-1 ${toClass}`}>{to}</span>
    </div>
  );
}
