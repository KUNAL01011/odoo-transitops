import {
  format,
  formatDistanceToNow,
  differenceInDays,
  isPast,
} from "date-fns";

export function formatCurrency(
  amount: number,
  currency: string = "INR"
): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string): string {
  return format(new Date(iso), "dd MMM yyyy");
}

export function formatDateTime(iso: string): string {
  return format(new Date(iso), "dd MMM yyyy, HH:mm");
}

/** "45 min ago" / "in 3 days" style relative labels — used for ETA + notifications. */
export function timeAgo(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

/** Positive = days remaining, negative = already expired. */
export function daysUntil(iso: string): number {
  return differenceInDays(new Date(iso), new Date());
}

export function isLicenseExpired(licenseExpiry: string): boolean {
  return isPast(new Date(licenseExpiry));
}

/** True when expiry falls inside the configured alert window (Settings → licenseAlertDays). */
export function isLicenseExpiringSoon(
  licenseExpiry: string,
  alertDays: number
): boolean {
  const days = daysUntil(licenseExpiry);
  return days >= 0 && days <= alertDays;
}

export function formatDistanceKm(km: number): string {
  return `${km.toLocaleString("en-IN")} km`;
}

export function formatWeightKg(kg: number): string {
  return `${kg.toLocaleString("en-IN")} kg`;
}

/** Vehicle/Driver/Trip status → Tailwind color class, so every badge across
 * the app uses one source of truth instead of a switch statement per component. */
export function statusColor(status: string): string {
  const map: Record<string, string> = {
    AVAILABLE: "bg-emerald-500/15 text-emerald-500",
    ON_TRIP: "bg-blue-500/15 text-blue-500",
    DISPATCHED: "bg-blue-500/15 text-blue-500",
    IN_SHOP: "bg-amber-500/15 text-amber-500",
    ACTIVE: "bg-amber-500/15 text-amber-500",
    DRAFT: "bg-slate-500/15 text-slate-400",
    OFF_DUTY: "bg-slate-500/15 text-slate-400",
    PENDING: "bg-slate-500/15 text-slate-400",
    RETIRED: "bg-rose-500/15 text-rose-500",
    SUSPENDED: "bg-rose-500/15 text-rose-500",
    CANCELLED: "bg-rose-500/15 text-rose-500",
    COMPLETED: "bg-emerald-500/15 text-emerald-500",
  };
  return map[status] ?? "bg-slate-500/15 text-slate-400";
}
