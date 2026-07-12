"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Phone, IdCard, ShieldAlert, Award } from "lucide-react";
import { Driver, DriverStatus } from "@/src/lib/type";
import {
  useDriver,
  useReinstateDriver,
  useSuspendDriver,
} from "@/src/feature/drivers/api";

const STATUS_META: Record<DriverStatus, { label: string; pill: string }> = {
  AVAILABLE: { label: "Available", pill: "bg-emerald-100 text-emerald-700" },
  ON_TRIP: { label: "On Trip", pill: "bg-blue-100 text-blue-700" },
  OFF_DUTY: { label: "Off Duty", pill: "bg-slate-100 text-slate-600" },
  SUSPENDED: { label: "Suspended", pill: "bg-rose-100 text-rose-700" },
};

function isExpired(dateStr: string) {
  return new Date(dateStr) < new Date();
}

function formatExpiry(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Same eligibility rule as the Drivers list — Safety reflects assignment
 * eligibility, not the raw duty status. See app/(protected)/drivers/page.tsx. */
function eligibility(driver: Driver): { label: string; className: string } {
  if (driver.status === "SUSPENDED" || isExpired(driver.licenseExpiry)) {
    return { label: "Blocked from assignment", className: "text-rose-600" };
  }
  if (driver.status === "ON_TRIP") {
    return { label: "Currently on a trip", className: "text-blue-600" };
  }
  return { label: "Eligible for assignment", className: "text-emerald-600" };
}

export default function DriverDetailPage({
  params,
}: {
  params: Promise<{ driverId: string }>;
}) {
  const { driverId } = use(params);
  const id = Number(driverId);

  const { data: driver, isLoading } = useDriver(id);
  const suspend = useSuspendDriver();
  const reinstate = useReinstateDriver();

  if (isLoading || !driver) {
    return <p className="text-sm text-slate-400">Loading driver…</p>;
  }

  const expired = isExpired(driver.licenseExpiry);
  const elig = eligibility(driver);
  const statusMeta = STATUS_META[driver.status];

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/drivers"
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Drivers
      </Link>

      <div className="flex items-start justify-between rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-lg font-semibold text-white">
            {driver.name[0]}
          </span>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              {driver.name}
            </h1>
            <p className="text-sm text-slate-500">
              {driver.licenseNumber} · {driver.licenseCategory}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${statusMeta.pill}`}
          >
            {statusMeta.label}
          </span>
          {driver.status === "SUSPENDED" ? (
            <button
              onClick={() => reinstate.mutate(id)}
              disabled={expired || reinstate.isPending}
              title={
                expired
                  ? "License expired — update it before reinstating"
                  : undefined
              }
              className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
            >
              Reinstate Driver
            </button>
          ) : (
            driver.status !== "ON_TRIP" && (
              <button
                onClick={() => suspend.mutate(id)}
                disabled={suspend.isPending}
                className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
              >
                Suspend Driver
              </button>
            )
          )}
        </div>
      </div>

      {(expired || driver.status === "SUSPENDED") && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            {driver.status === "SUSPENDED" && expired
              ? "This driver is suspended and their license has expired — blocked from trip assignment on both counts."
              : driver.status === "SUSPENDED"
                ? "This driver is suspended and cannot be assigned to new trips until reinstated."
                : "This driver's license has expired and they are blocked from new trip assignments until it's renewed."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat
          icon={IdCard}
          label="License Expiry"
          value={formatExpiry(driver.licenseExpiry)}
          warn={expired}
        />
        <Stat icon={Phone} label="Contact" value={driver.contactNumber} />
        <Stat
          icon={Award}
          label="Safety Score"
          value={String(driver.safetyScore)}
        />
        <Stat
          icon={Award}
          label="Trip Completions"
          value={`${driver.tripCompletions}%`}
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Assignment Eligibility
        </h2>
        <p className={`text-sm font-medium ${elig.className}`}>{elig.label}</p>
        <p className="mt-1 text-xs text-slate-500">
          Rule: expired license or Suspended status blocks trip assignment
          automatically, regardless of duty status shown above.
        </p>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  warn,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p
        className={`mt-1 font-medium ${warn ? "text-rose-600" : "text-slate-900"}`}
      >
        {value}
      </p>
    </div>
  );
}
