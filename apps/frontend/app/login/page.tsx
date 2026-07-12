"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Truck,
  Mail,
  Lock,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  LogIn,
  Loader2,
} from "lucide-react";
import { LoginInput, loginSchema } from "@/src/helpers/validation";
import { ApiRequestError } from "@/src/lib/api-client";
import { useLogin } from "@/src/feature/auth/api";

const ROLE_OPTIONS: Array<{ value: LoginInput["role"]; label: string }> = [
  { value: "FLEET_MANAGER", label: "Fleet Manager" },
  { value: "DISPATCHER", label: "Dispatcher" },
  { value: "SAFETY_OFFICER", label: "Safety Officer" },
  { value: "FINANCIAL_ANALYST", label: "Financial Analyst" },
];

function getErrorCopy(error: unknown): { title: string; detail: string } {
  if (error instanceof ApiRequestError) {
    if (error.statusCode === 423) {
      return {
        title: "Account locked",
        detail: error.message || "Too many failed attempts. Try again later.",
      };
    }
    if (error.statusCode === 401) {
      return {
        title: "Invalid credentials",
        detail:
          error.message || "The email or password you entered is incorrect.",
      };
    }
    return { title: "Sign in failed", detail: error.message };
  }
  return {
    title: "Sign in failed",
    detail: "Something went wrong. Please try again.",
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "DISPATCHER",
      rememberMe: false,
    },
  });

  useEffect(() => {
    if (loginMutation.isError) setBannerDismissed(false);
  }, [loginMutation.isError, loginMutation.error]);

  const onSubmit = handleSubmit(values => {
    loginMutation.mutate(values, {
      onSuccess: () => router.replace("/"),
    });
  });

  const showErrorBanner = loginMutation.isError && !bannerDismissed;
  const errorCopy = loginMutation.error
    ? getErrorCopy(loginMutation.error)
    : null;

  return (
    <div className="flex min-h-screen w-full">
      {/* ---------------- Left brand panel ---------------- */}
      <div className="relative hidden w-1/2 overflow-hidden bg-zinc-100 lg:flex lg:flex-col">
        {/* Background image layer — sits behind the text, faded so it reads
            as decoration rather than competing with the heading */}
        <div className="absolute inset-0">
          <img
            src="/login.png"
            alt=""
            className="h-full w-full object-cover opacity-20 grayscale"
          />
          {/* Fades the image back to solid background near the top, so the
              logo/heading area stays crisp regardless of what's in the image */}
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-100 via-zinc-100/60 to-transparent" />
        </div>

        <div className="relative z-10 px-16 pt-16">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-zinc-900">
              TransitOps
            </span>
          </div>

          <h1 className="mt-10 max-w-md text-4xl font-bold leading-tight text-zinc-900">
            Smart Transport Operations Platform
          </h1>
          <p className="mt-4 max-w-sm text-base text-zinc-500">
            The unified command center for fleet monitoring, dispatch logistics,
            and operational compliance.
          </p>
        </div>
      </div>

      {/* ---------------- Right form panel ---------------- */}
      <div className="flex w-full flex-1 items-center justify-center bg-white px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <h2 className="text-3xl font-bold text-zinc-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Enter your credentials to continue
          </p>

          {showErrorBanner && errorCopy && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">
                  {errorCopy.title}
                </p>
                <p className="mt-0.5 text-sm text-red-700">
                  {errorCopy.detail}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBannerDismissed(true)}
                aria-label="Dismiss"
                className="text-red-400 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate>
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@transitops.in"
                  aria-invalid={!!errors.email}
                  className="w-full rounded-lg border border-zinc-300 py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  className="w-full rounded-lg border border-zinc-300 py-2.5 pl-10 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="role"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500"
              >
                Role (RBAC)
              </label>
              <div className="relative">
                <Shield className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <select
                  id="role"
                  aria-invalid={!!errors.role}
                  className="w-full appearance-none rounded-lg border border-zinc-300 py-2.5 pl-10 pr-3 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  {...register("role")}
                >
                  {ROLE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.role && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.role.message}
                </p>
              )}
              <p className="mt-1 text-[11px] text-zinc-400">
                This pre-fills your workspace view — your account's actual role
                is what's enforced.
              </p>
            </div>

            <div className="flex items-center pt-1">
              <label className="flex items-center gap-2 text-sm text-zinc-600">
                <input
                  type="checkbox"
                  className="rounded border-zinc-300"
                  {...register("rememberMe")}
                />
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <LogIn className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
