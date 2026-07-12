"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus, Info, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Driver, DriverStatus } from "@/src/lib/type";
import { useCreateDriver, useDrivers } from "@/src/feature/drivers/api";
import { driverSchema } from "@/src/helpers/validation";
import { DriverInput } from "@/src/helpers/validation";

const STATUS_META: Record<
  DriverStatus,
  { label: string; dot: string; pill: string }
> = {
  AVAILABLE: {
    label: "Available",
    dot: "bg-emerald-500",
    pill: "bg-emerald-100 text-emerald-700",
  },
  ON_TRIP: {
    label: "On Trip",
    dot: "bg-blue-500",
    pill: "bg-blue-100 text-blue-700",
  },
  OFF_DUTY: {
    label: "Off Duty",
    dot: "bg-slate-400",
    pill: "bg-slate-100 text-slate-600",
  },
  SUSPENDED: {
    label: "Suspended",
    dot: "bg-rose-500",
    pill: "bg-rose-100 text-rose-700",
  },
};

const FILTER_STATUSES: DriverStatus[] = [
  "AVAILABLE",
  "ON_TRIP",
  "OFF_DUTY",
  "SUSPENDED",
];

const AVATAR_PALETTE = [
  { bg: "bg-indigo-600", text: "text-white" },
  { bg: "bg-blue-200", text: "text-blue-700" },
  { bg: "bg-amber-800", text: "text-white" },
  { bg: "bg-slate-400", text: "text-white" },
];

function isExpired(dateStr: string) {
  return new Date(dateStr) < new Date();
}

function formatExpiry(dateStr: string) {
  const d = new Date(dateStr);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

/** "Safety" column — eligibility for trip assignment, distinct from the
 * driver's literal duty status. Suspended or expired license always wins;
 * an On Trip driver reads as On Trip; everyone else (Available or Off Duty)
 * reads as eligible/"Available" here even when Status says otherwise. */
function eligibility(driver: Driver): {
  label: string;
  dot: string;
  text: string;
} {
  if (driver.status === "SUSPENDED" || isExpired(driver.licenseExpiry)) {
    return { label: "Suspended", dot: "bg-rose-500", text: "text-rose-600" };
  }
  if (driver.status === "ON_TRIP") {
    return { label: "On Trip", dot: "bg-blue-500", text: "text-blue-600" };
  }
  return {
    label: "Available",
    dot: "bg-emerald-500",
    text: "text-emerald-600",
  };
}

export default function DriversPage() {
  const [activeFilters, setActiveFilters] = useState<Set<DriverStatus>>(
    new Set(FILTER_STATUSES) // all four on by default — see note on filter defaults
  );
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const pageSize = 4;

  const { data: drivers, isLoading } = useDrivers();
  const createDriver = useCreateDriver();

  const filtered = useMemo(
    () => (drivers ?? []).filter(d => activeFilters.has(d.status)),
    [drivers, activeFilters]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  function toggleFilter(status: DriverStatus) {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
    setPage(1);
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DriverInput>({ resolver: zodResolver(driverSchema) });

  const onSubmit = (values: DriverInput) => {
    createDriver.mutate(values, {
      onSuccess: () => {
        reset();
        setShowForm(false);
      },
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Drivers &amp; Safety Profiles
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage personnel documentation, trip history, and safety compliance.
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <UserPlus className="h-4 w-4" />
          Add Driver
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-3"
        >
          <Field label="Name" error={errors.name?.message}>
            <input {...register("name")} className="input" />
          </Field>
          <Field label="License No." error={errors.licenseNumber?.message}>
            <input {...register("licenseNumber")} className="input" />
          </Field>
          <Field label="Category" error={errors.licenseCategory?.message}>
            <select {...register("licenseCategory")} className="input">
              <option value="LMV">LMV</option>
              <option value="HMV">HMV</option>
              <option value="OTHER">Other</option>
            </select>
          </Field>
          <Field label="License Expiry" error={errors.licenseExpiry?.message}>
            <input
              type="date"
              {...register("licenseExpiry")}
              className="input"
            />
          </Field>
          <Field label="Contact Number" error={errors.contactNumber?.message}>
            <input {...register("contactNumber")} className="input" />
          </Field>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              disabled={createDriver.isPending}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Toggle Status Filters
        </p>
        <div className="flex flex-wrap gap-3">
          {FILTER_STATUSES.map(status => {
            const meta = STATUS_META[status];
            const active = activeFilters.has(status);
            return (
              <button
                key={status}
                onClick={() => toggleFilter(status)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "border-slate-200 bg-white"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${active ? meta.dot : "bg-slate-300"}`}
                />
                <span className={active ? "text-slate-700" : "text-slate-400"}>
                  {meta.label}
                </span>
                <span
                  className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                    active ? meta.dot : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 translate-x-0.5 transform rounded-full bg-white shadow transition-transform ${
                      active ? "translate-x-3.5" : "translate-x-0.5"
                    }`}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Driver</th>
              <th className="px-4 py-3">License No.</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Expiry</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Trip Compl.</th>
              <th className="px-4 py-3">Safety</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-400">
                  Loading drivers…
                </td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-400">
                  No drivers match the selected filters.
                </td>
              </tr>
            ) : (
              paged.map((driver, i) => {
                const expired = isExpired(driver.licenseExpiry);
                const elig = eligibility(driver);
                const statusMeta = STATUS_META[driver.status];
                const suspended = driver.status === "SUSPENDED";
                const avatar = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
                return (
                  <tr
                    key={driver.id}
                    className={`border-b border-slate-50 last:border-0 ${suspended ? "bg-rose-50/60" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatar.bg} ${avatar.text}`}
                        >
                          {driver.name[0]}
                        </span>
                        <span className="font-medium text-slate-900">
                          {driver.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {driver.licenseNumber}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded border border-slate-200 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                        {driver.licenseCategory}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={expired ? "text-rose-600" : "text-slate-700"}
                      >
                        {formatExpiry(driver.licenseExpiry)}
                      </span>
                      {expired && (
                        <span className="ml-1.5 text-[10px] font-semibold text-rose-600">
                          EXPIRED
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {driver.contactNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-700">
                          {driver.tripCompletions}%
                        </span>
                        <span className="block h-0.5 w-16 rounded-full bg-slate-100">
                          <span
                            className={`block h-0.5 rounded-full ${suspended ? "bg-rose-500" : "bg-indigo-500"}`}
                            style={{
                              width: `${Math.min(100, driver.tripCompletions)}%`,
                            }}
                          />
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`flex items-center gap-1.5 text-xs font-medium ${elig.text}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${elig.dot}`}
                        />
                        {elig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusMeta.pill}`}
                      >
                        {statusMeta.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <p>
          Showing {paged.length} of {filtered.length} active drivers
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-md border border-slate-200 p-1.5 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`h-7 w-7 rounded-md text-xs font-medium ${
                page === i + 1
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-200 text-slate-600"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-md border border-slate-200 p-1.5 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>
          Rule: Expired license or Suspended status → blocked from trip
          assignment. Automatic system override prevents scheduling.
        </p>
      </div>
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
