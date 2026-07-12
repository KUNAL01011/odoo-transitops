import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { VehicleStatus, VehicleType } from "@/src/lib/type";
import {
  ArrowLeft,
  Pencil,
  Ban,
  Gauge,
  Wallet,
  Truck,
  Loader2,
} from "lucide-react";

import {
  useVehicle,
  useVehicleHistory,
  useVehicleOperationalCost,
  useRetireVehicle,
} from "@/src/feature/vehicles/api";

const TYPE_LABEL: Record<VehicleType, string> = {
  VAN: "Van",
  TRUCK: "Truck",
  MINI_TRUCK: "Mini Truck",
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

export default function VehicleDetailPage() {
  const params = useParams<{ vehicleId: string }>();
  const router = useRouter();
  const vehicleId = Number(params.vehicleId);

  const { data: vehicle, isLoading, isError } = useVehicle(vehicleId);
  const history = useVehicleHistory(vehicleId);
  const operationalCost = useVehicleOperationalCost(vehicleId);
  const retireVehicle = useRetireVehicle();

  function handleRetire() {
    if (!vehicle) return;
    if (confirm(`Retire ${vehicle.regNo}? This can't be undone.`)) {
      retireVehicle.mutate(vehicle.id, {
        onSuccess: () => router.refresh(),
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading vehicle…
      </div>
    );
  }

  if (isError || !vehicle) {
    return (
      <div className="space-y-4">
        <BackLink />
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-600">
          Couldn't load this vehicle. It may not exist or may have been removed.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackLink />

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-900">{vehicle.name}</h1>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${STATUS_BADGE[vehicle.status]}`}
            >
              {STATUS_LABEL[vehicle.status]}
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            {vehicle.regNo} • {TYPE_LABEL[vehicle.type]}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/fleet/${vehicle.id}/edit`}
            className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
          {vehicle.status !== "RETIRED" && (
            <button
              type="button"
              onClick={handleRetire}
              disabled={retireVehicle.isPending}
              className="flex items-center gap-2 rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60"
            >
              {retireVehicle.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Ban className="h-4 w-4" />
              )}
              Retire Vehicle
            </button>
          )}
        </div>
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-2 gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:grid-cols-4">
        <DetailStat
          label="Capacity"
          value={formatCapacity(vehicle.maxLoadCapacity)}
        />
        <DetailStat label="Odometer" value={formatOdometer(vehicle.odometer)} />
        <DetailStat
          label="Acquisition Cost"
          value={formatCurrency(vehicle.acquisitionCost)}
        />
        <DetailStat label="Type" value={TYPE_LABEL[vehicle.type]} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-indigo-600" />
            <h2 className="font-semibold text-zinc-900">Operational Cost</h2>
          </div>

          {operationalCost.isLoading && (
            <p className="text-sm text-zinc-400">Loading…</p>
          )}
          {operationalCost.isError && (
            <p className="text-sm text-zinc-400">
              Operational cost data isn't available yet.
            </p>
          )}
          {operationalCost.data && (
            <pre className="overflow-x-auto rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600">
              {JSON.stringify(operationalCost.data, null, 2)}
            </pre>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Truck className="h-4 w-4 text-indigo-600" />
            <h2 className="font-semibold text-zinc-900">History</h2>
          </div>

          {history.isLoading && (
            <p className="text-sm text-zinc-400">Loading…</p>
          )}
          {history.isError && (
            <p className="text-sm text-zinc-400">
              History isn't available yet.
            </p>
          )}
          {history.data && (
            <div className="space-y-4">
              <HistorySection
                title="Allocations"
                icon={<Gauge className="h-3.5 w-3.5" />}
                items={history.data.allocations}
              />
              <HistorySection
                title="Maintenance"
                icon={<Ban className="h-3.5 w-3.5" />}
                items={history.data.maintenance}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/fleet"
      className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-700"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Vehicle Registry
    </Link>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-zinc-900">{value}</p>
    </div>
  );
}

function HistorySection({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: unknown[];
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        {icon}
        {title} ({items.length})
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-400">
          No {title.toLowerCase()} recorded.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li
              key={i}
              className="rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-600"
            >
              <pre className="overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(item, null, 2)}
              </pre>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
