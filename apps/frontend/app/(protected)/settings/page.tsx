"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Download,
  Plus,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AppModule, RolePermission } from "@/src/lib/type";
import { Role } from "@/src/lib/type";
import {
  useRbacMatrix,
  useSettings,
  useUpdateRbacMatrix,
  useUpdateSettings,
  useSecurityOverview,
} from "@/src/feature/settings/api";
import { SettingsInput, settingsSchema } from "@/src/helpers/validation";

const ROLES: Role[] = [
  "FLEET_MANAGER",
  "DISPATCHER",
  "SAFETY_OFFICER",
  "FINANCIAL_ANALYST",
];
const ROLE_LABELS: Record<Role, string> = {
  FLEET_MANAGER: "Fleet Manager",
  DISPATCHER: "Dispatcher",
  SAFETY_OFFICER: "Safety Officer",
  FINANCIAL_ANALYST: "Financial Analyst",
};

const MODULES: AppModule[] = [
  "FLEET",
  "DRIVERS",
  "TRIPS",
  "FUEL_EXPENSES",
  "ANALYTICS",
];
const MODULE_LABELS: Record<AppModule, string> = {
  DASHBOARD: "Dashboard",
  FLEET: "Fleet",
  DRIVERS: "Drivers",
  TRIPS: "Trips",
  MAINTENANCE: "Maintenance",
  FUEL_EXPENSES: "Fuel/Exp.",
  ANALYTICS: "Analytics",
  SETTINGS: "Settings",
};

export default function SettingsPage() {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const { data: rbac } = useRbacMatrix();
  const updateRbac = useUpdateRbacMatrix();
  const { data: security } = useSecurityOverview(); // not built on backend yet — see StatCard fallback

  const [matrix, setMatrix] = useState<RolePermission[]>([]);
  useEffect(() => {
    if (rbac) setMatrix(rbac);
  }, [rbac]);

  const { register, handleSubmit, setValue, watch } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    values: settings as SettingsInput,
  });

  const distanceUnit = watch("distanceUnit");

  function permFor(role: Role, module: AppModule) {
    return (
      matrix.find(p => p.role === role && p.module === module) ?? {
        canView: false,
        canEdit: false,
      }
    );
  }

  function cycleCell(role: Role, module: AppModule) {
    setMatrix(prev => {
      const existing = prev.find(p => p.role === role && p.module === module);
      const nextState =
        !existing || (!existing.canView && !existing.canEdit)
          ? { canView: true, canEdit: false }
          : existing.canView && !existing.canEdit
            ? { canView: true, canEdit: true }
            : { canView: false, canEdit: false };

      if (!existing) return [...prev, { role, module, ...nextState }];
      return prev.map(p =>
        p.role === role && p.module === module ? { ...p, ...nextState } : p
      );
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            System Preferences
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your organizational parameters and user permissions.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
            <Download className="h-4 w-4" />
            Export Logs
          </button>
          <button
            disabled
            title="Custom roles beyond the 4 fixed roles aren't supported yet — Role is a fixed enum in the current schema, not a table you can add rows to."
            className="flex cursor-not-allowed items-center gap-1.5 rounded-lg bg-indigo-300 px-4 py-2 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" />
            New Role
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <form
            onSubmit={handleSubmit(values => updateSettings.mutate(values))}
            className="space-y-4 rounded-lg border border-slate-200 bg-white p-5"
          >
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              General
            </h2>

            <label className="block text-xs text-slate-500">
              Depot Name
              <input {...register("depotName")} className="input mt-1" />
            </label>

            <label className="block text-xs text-slate-500">
              Currency
              <select {...register("currency")} className="input mt-1">
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </label>

            <div>
              <p className="mb-1.5 text-xs text-slate-500">Distance Unit</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setValue("distanceUnit", "km")}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    distanceUnit === "km"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-slate-200 text-slate-500"
                  }`}
                >
                  Kilometers
                </button>
                <button
                  type="button"
                  onClick={() => setValue("distanceUnit", "miles")}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    distanceUnit === "miles"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-slate-200 text-slate-500"
                  }`}
                >
                  Miles
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={updateSettings.isPending}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Save changes
            </button>
          </form>

          <div className="rounded-lg bg-indigo-600 p-5 text-white">
            <ShieldCheck className="h-5 w-5" />
            <h3 className="mt-3 text-sm font-semibold">
              Two-Factor Authentication
            </h3>
            <p className="mt-1 text-xs text-indigo-100">
              Strengthen your account security by enabling 2FA for all
              dispatcher logins.
            </p>
            <button
              disabled
              title="2FA isn't implemented yet — this is a placeholder for a future auth feature"
              className="mt-3 text-sm font-semibold underline decoration-indigo-300 underline-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Configure Security
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={ShieldCheck}
              iconBg="bg-emerald-100"
              iconColor="text-emerald-600"
              label="Active Sessions"
              value={security?.activeSessions?.toString() ?? "—"}
              caveat="Needs a server-side session store — current auth is stateless JWT cookies"
            />
            <StatCard
              icon={ShieldAlert}
              iconBg="bg-amber-100"
              iconColor="text-amber-600"
              label="Auth Failures"
              value={security?.authFailures24h?.toString() ?? "—"}
              suffix="(24h)"
              caveat="Needs failed-login events written to AuditLog with timestamps"
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Role-Based Access (RBAC)
              </h2>
              <button
                disabled
                title="No audit log page/route built yet — AuditLog exists in the schema but has no UI"
                className="flex items-center gap-1 text-xs font-medium text-indigo-300"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Audit Log
              </button>
            </div>

            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-5 py-2">Role</th>
                  {MODULES.map(m => (
                    <th key={m} className="px-2 py-2 text-center">
                      {MODULE_LABELS[m]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROLES.map(role => (
                  <tr key={role} className="border-t border-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {ROLE_LABELS[role]}
                    </td>
                    {MODULES.map(module => {
                      const perm = permFor(role, module);
                      return (
                        <td key={module} className="px-2 py-3 text-center">
                          <button
                            onClick={() => cycleCell(role, module)}
                            title="Click to cycle: No access → View → Edit"
                            className="text-sm"
                          >
                            {perm.canEdit ? (
                              <span className="font-semibold text-emerald-500">
                                ✓
                              </span>
                            ) : perm.canView ? (
                              <span className="font-medium text-indigo-600">
                                View
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
              <p className="text-xs text-slate-400">
                Changes to RBAC policies require Administrator authorization.
              </p>
              <div
                className="flex items-center gap-2 text-xs text-slate-300"
                title="Only 4 fixed roles exist today — pagination isn't meaningful until custom roles are supported"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Page 1 of 1
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => updateRbac.mutate(matrix)}
              disabled={updateRbac.isPending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Save RBAC Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  suffix,
  caveat,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  suffix?: string;
  caveat: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}
        >
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-900">
        {value}{" "}
        {suffix && (
          <span className="text-sm font-normal text-rose-500">{suffix}</span>
        )}
      </p>
      <p className="mt-1 text-[10px] text-slate-400">{caveat}</p>
    </div>
  );
}
