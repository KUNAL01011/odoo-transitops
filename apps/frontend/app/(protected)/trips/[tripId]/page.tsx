"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCancelTrip,
  useCompleteTrip,
  useTrip,
} from "@/src/feature/trips/api";
import { formatDateTime } from "@/src/lib/utils/format";
import { TripLifecycleStepper } from "@/src/feature/trips/TripLifecycleStepper";

export default function TripDetailPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = use(params);
  const id = Number(tripId);
  const router = useRouter();

  const { data: trip, isLoading } = useTrip(id);
  const completeTrip = useCompleteTrip();
  const cancelTrip = useCancelTrip();

  const [finalOdometer, setFinalOdometer] = useState("");
  const [fuelConsumed, setFuelConsumed] = useState("");

  if (isLoading || !trip)
    return <p className="text-sm text-slate-400">Loading trip…</p>;

  const vehicle = (trip as any).vehicle;
  const driver = (trip as any).driver;

  return (
    <div className="max-w-xl space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <TripLifecycleStepper status={trip.status} />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm">
        <h1 className="text-lg font-semibold text-slate-900">
          {trip.tripCode}
        </h1>
        <p className="mt-2 text-slate-700">
          {trip.source} → {trip.destination}
        </p>
        <p className="mt-1 text-slate-500">
          {vehicle?.name ?? "—"} / {driver?.name ?? "—"} · {trip.cargoWeight} kg
          · {trip.plannedDistance} km
        </p>
        {trip.dispatchedAt && (
          <p className="mt-2 text-xs text-slate-400">
            Dispatched {formatDateTime(trip.dispatchedAt)}
          </p>
        )}
        {trip.completedAt && (
          <p className="text-xs text-slate-400">
            Completed {formatDateTime(trip.completedAt)}
          </p>
        )}
        {trip.cancelledAt && (
          <p className="text-xs font-medium text-rose-600">
            Cancelled {formatDateTime(trip.cancelledAt)} —{" "}
            {trip.cancellationReason ?? "no reason given"}
          </p>
        )}
      </div>

      {trip.status === "DISPATCHED" && (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Complete Trip
          </h2>
          <label className="block text-xs text-slate-500">
            Final Odometer
            <input
              value={finalOdometer}
              onChange={e => setFinalOdometer(e.target.value)}
              type="number"
              className="input mt-1"
            />
          </label>
          <label className="block text-xs text-slate-500">
            Fuel Consumed (L)
            <input
              value={fuelConsumed}
              onChange={e => setFuelConsumed(e.target.value)}
              type="number"
              className="input mt-1"
            />
          </label>
          <div className="flex gap-3 pt-1">
            <button
              onClick={() =>
                completeTrip.mutate({
                  id,
                  payload: {
                    finalOdometer: Number(finalOdometer),
                    fuelConsumedLiters: Number(fuelConsumed),
                  },
                })
              }
              disabled={!finalOdometer || completeTrip.isPending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Complete
            </button>
            <button
              onClick={() =>
                cancelTrip.mutate({ id, reason: "Cancelled by dispatcher" })
              }
              className="rounded-lg border border-rose-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-rose-600 hover:bg-rose-50"
            >
              Cancel Trip
            </button>
          </div>
        </div>
      )}

      {trip.status === "DRAFT" && (
        <button
          onClick={() =>
            cancelTrip.mutate(
              { id, reason: "Cancelled before dispatch" },
              { onSuccess: () => router.push("/trips") }
            )
          }
          className="rounded-lg border border-rose-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-rose-600 hover:bg-rose-50"
        >
          Cancel Trip
        </button>
      )}
    </div>
  );
}
