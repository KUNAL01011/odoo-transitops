"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutGrid,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  Settings as SettingsIcon,
  Search,
  Bell,
} from "lucide-react";
import { AppModule } from "@/src/lib/type";
import { hasModuleAccess, useLogout, useMe } from "@/src/feature/auth/api";
import { useNotifications } from "@/src/feature/notifications/api";

const NAV_ITEMS: Array<{
  label: string;
  href: string;
  module: AppModule;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { label: "Dashboard", href: "/", module: "DASHBOARD", icon: LayoutGrid },
  { label: "Fleet", href: "/fleet", module: "FLEET", icon: Truck },
  { label: "Drivers", href: "/drivers", module: "DRIVERS", icon: Users },
  { label: "Trips", href: "/trips", module: "TRIPS", icon: Route },
  {
    label: "Maintenance",
    href: "/maintenance",
    module: "MAINTENANCE",
    icon: Wrench,
  },
  {
    label: "Fuel & Expenses",
    href: "/fuel-expenses",
    module: "FUEL_EXPENSES",
    icon: Fuel,
  },
  {
    label: "Analytics",
    href: "/analytics",
    module: "ANALYTICS",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/settings",
    module: "SETTINGS",
    icon: SettingsIcon,
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map(p => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: me, isLoading, isError } = useMe();
  const { data: notifications } = useNotifications();
  const logout = useLogout();
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  const unreadCount =
    notifications?.filter(n => !(n as any).isRead).length ?? 0;

  useEffect(() => {
    if (isError) router.replace("/login");
  }, [isError, router]);

  // Bounce a role away from a module it can't view if they hit the URL directly.
  useEffect(() => {
    if (!me) return;
    const current = NAV_ITEMS.find(item => item.href === pathname);
    if (current && !hasModuleAccess(me.permissions, current.module, "view")) {
      router.replace("/");
    }
  }, [me, pathname, router]);

  if (isLoading || !me) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-400">
        Loading…
      </div>
    );
  }

  const visibleNav = NAV_ITEMS.filter(item =>
    hasModuleAccess(me.permissions, item.module, "view")
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-2 px-6 py-5">
          <Truck className="h-6 w-6 text-slate-900" />
          <span className="text-lg font-semibold text-slate-900">
            TransitOps
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {visibleNav.map(item => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <button
            onClick={() =>
              logout.mutate(undefined, {
                onSuccess: () => router.replace("/login"),
              })
            }
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-3">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:bg-white"
            />
          </div>

          <Link
            href="/notifications"
            className="relative text-slate-500 hover:text-slate-700"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-medium text-white">
                {unreadCount}
              </span>
            )}
          </Link>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{me.name}</p>
              <span className="inline-block rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                {me.role.replace("_", " ")}
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
              {initials(me.name)}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
