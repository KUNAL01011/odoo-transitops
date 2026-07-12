"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Clock } from "lucide-react";
import {
  useTrips,
  useCreateTrip,
  useDispatchTrip,
  checkCargoCapacity,
} from "@/src/feature/trips/api";
import { useAvailableVehicles } from "@/src/feature/vehicles/api";
import { useAvailableDrivers } from "@/src/feature/drivers/api";
import { TripInput, tripSchema } from "@/src/helpers/validation";
import { TripStatus } from "@/src/lib/type";
import { timeAgo } from "@/src/lib/utils/format";
import { TripLifecycleStepper } from "@/src/feature/trips/TripLifecycleStepper";

const STATUS_PILL: Record<TripStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  DISPATCHED: "bg-indigo-100 text-indigo-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-rose-100 text-rose-700",
};

export default function TripsPage() {
  const { data: trips, isLoading } = useTrips();
  const { data: availableVehicles } = useAvailableVehicles();
  const { data: availableDrivers } = useAvailableDrivers();
  const createTrip = useCreateTrip();
  const dispatchTrip = useDispatchTrip();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<TripInput>({ resolver: zodResolver(tripSchema) });

  const selectedVehicleId = watch("vehicleId");
  const cargoWeight = watch("cargoWeight");
  const selectedVehicle = availableVehicles?.find(
    v => v.id === Number(selectedVehicleId)
  );

  const capacityCheck =
    selectedVehicle && cargoWeight
      ? checkCargoCapacity(Number(cargoWeight), selectedVehicle.maxLoadCapacity)
      : { ok: true, message: null as string | null };

  const isSubmitting = createTrip.isPending || dispatchTrip.isPending;
  const dispatchDisabled = !capacityCheck.ok || isSubmitting;

  // Fill the form + click Dispatch = create the Draft, then immediately
  // dispatch it — two backend calls chained, since there's no combined
  // create+dispatch endpoint (and shouldn't be — dispatch re-validates
  // availability independently, which matters under real concurrency).
  const onSubmit = (values: TripInput) => {
    createTrip.mutate(values, {
      onSuccess: (trip: any) => {
        dispatchTrip.mutate(trip.id, { onSuccess: () => reset() });
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <TripLifecycleStepper status="DISPATCHED" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-lg border border-slate-200 bg-white p-5"
        >
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Create Trip
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Source" error={errors.source?.message}>
              <input
                {...register("source")}
                className="input"
                placeholder="Gandhinagar Depot"
              />
            </Field>
            <Field label="Destination" error={errors.destination?.message}>
              <input
                {...register("destination")}
                className="input"
                placeholder="Ahmedabad Hub"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Vehicle" error={errors.vehicleId?.message}>
              <select
                {...register("vehicleId", { valueAsNumber: true })}
                className="input"
              >
                <option value="">Select…</option>
                {availableVehicles?.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} - {v.maxLoadCapacity} kg capacity
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Driver" error={errors.driverId?.message}>
              <select
                {...register("driverId", { valueAsNumber: true })}
                className="input"
              >
                <option value="">Select…</option>
                {availableDrivers?.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Cargo Weight (KG)"
              error={errors.cargoWeight?.message}
            >
              <input
                type="number"
                {...register("cargoWeight", { valueAsNumber: true })}
                className="input"
              />
            </Field>
            <Field
              label="Planned Distance (KM)"
              error={errors.plannedDistance?.message}
            >
              <input
                type="number"
                {...register("plannedDistance", { valueAsNumber: true })}
                className="input"
              />
            </Field>
          </div>

          {!capacityCheck.ok && selectedVehicle && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p>
                  Vehicle Capacity: {selectedVehicle.maxLoadCapacity} kg | Cargo
                  Weight: {cargoWeight} kg
                </p>
                <p className="font-medium">
                  ✕ {capacityCheck.message} — dispatch blocked
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={dispatchDisabled}
              className={`flex-1 rounded-lg py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                dispatchDisabled
                  ? "cursor-not-allowed bg-slate-200 text-slate-400"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {dispatchDisabled && !isSubmitting
                ? "Dispatch (Disabled)"
                : isSubmitting
                  ? "Dispatching…"
                  : "Dispatch"}
            </button>
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-lg border border-rose-300 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-rose-600 hover:bg-rose-50"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="rounded-lg border border-slate-200 bg-white">
          <h2 className="border-b border-slate-100 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Live Board
          </h2>
          {isLoading ? (
            <p className="p-5 text-sm text-slate-400">Loading trips…</p>
          ) : (
            <ul>
              {trips?.map((trip: any) => (
                <li
                  key={trip.id}
                  className="border-b border-slate-50 px-5 py-4 last:border-0"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-semibold text-indigo-700">
                      {trip.tripCode} <span className="text-slate-300">|</span>{" "}
                      {trip.vehicle && trip.driver
                        ? `${trip.vehicle.name} / ${trip.driver.name.toUpperCase()}`
                        : "Unassigned"}
                    </p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_PILL[trip.status as TripStatus]}`}
                    >
                      {trip.status.charAt(0) +
                        trip.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-slate-600">{trip.source}</p>
                  <p className="text-sm text-slate-600">{trip.destination}</p>

                  {trip.status === "DISPATCHED" && trip.dispatchedAt && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      Dispatched {timeAgo(trip.dispatchedAt)}
                    </p>
                  )}
                  {trip.status === "DRAFT" && (
                    <p className="mt-1.5 text-xs text-slate-400">
                      {!trip.driver
                        ? "Awaiting driver"
                        : !trip.vehicle
                          ? "Awaiting vehicle"
                          : "Awaiting dispatch"}
                    </p>
                  )}
                  {trip.status === "CANCELLED" && trip.cancellationReason && (
                    <p className="mt-1.5 text-xs font-medium text-rose-600">
                      {trip.cancellationReason}
                    </p>
                  )}
                </li>
              ))}
              {trips?.length === 0 && (
                <p className="p-5 text-sm text-slate-400">No trips yet.</p>
              )}
            </ul>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400">
        On Complete: odometer → fuel log → expenses → Vehicle &amp; Driver
        Available.
      </p>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-xs text-slate-500">
      {label}
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-rose-600">{error}</p>}
    </label>
  );
}
