import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth";
import type { LoginRequest } from "../types";
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  CubeIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

/**
 * PantryPal — Minimal, modern, and accessible login screen
 * Design goals:
 * - Calm neutrals + single accent
 * - High contrast, no heavy glows or busy backgrounds
 * - Generous white space, clear hierarchy, floating labels
 * - Motion kept subtle and purposeful
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: () => navigate("/"),
    onError: (error: any) => {
      setError(
        error?.response?.data?.detail || "Login failed. Please try again."
      );
    },
  });

  const onSubmit = (data: LoginRequest) => {
    setError("");
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Top nav brand (optional) */}
      <header className="px-6 py-5">
        <div className="mx-auto max-w-7xl flex items-center gap-3">
          <div className="inline-flex items-center justify-center rounded-xl bg-slate-900 text-white w-9 h-9">
            <CubeIcon className="w-5 h-5" />
          </div>
          <span className="font-semibold tracking-tight text-slate-900">
            PantryPal
          </span>
        </div>
      </header>

      <main className="px-6">
        <div className="mx-auto max-w-7xl grid gap-10 lg:grid-cols-2 items-center py-8 lg:py-16">
          {/* Left: value prop */}
          <section className="order-2 lg:order-1">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="mt-3 text-slate-600">
              Sign in to manage inventory with clarity and speed.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-slate-400" /> Secure &
                encrypted
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block w-5 h-5 rounded-full bg-slate-200" />
                Reliable by design
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block w-5 h-5 rounded-full bg-slate-200" />
                Minimal distractions
              </li>
            </ul>
          </section>

          {/* Right: auth card */}
          <section className="order-1 lg:order-2">
            <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-6 sm:p-8 shadow-sm">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 text-red-800 px-3 py-2 text-sm"
                  >
                    {error}
                  </div>
                )}

                {/* Email */}
                <div className="relative">
                  <label htmlFor="username" className="sr-only">
                    Email address
                  </label>
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="username"
                    type="email"
                    autoComplete="email"
                    aria-invalid={errors.username ? "true" : "false"}
                    placeholder=" "
                    className="peer w-full rounded-xl border border-slate-200 bg-white px-10 py-3 text-slate-900 placeholder-transparent shadow-inner focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    {...register("username", {
                      required: "Email address is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Please enter a valid email address",
                      },
                    })}
                  />
                  <span className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-slate-400 peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-6 peer-focus:text-xs peer-focus:text-slate-500 transition-all">
                    Email address
                  </span>
                  {errors.username && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="relative">
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <LockClosedIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    aria-invalid={errors.password ? "true" : "false"}
                    placeholder=" "
                    className="peer w-full rounded-xl border border-slate-200 bg-white px-10 pr-12 py-3 text-slate-900 placeholder-transparent shadow-inner focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute inset-y-0 right-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-slate-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-slate-400" />
                    )}
                  </button>
                  <span className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-slate-400 peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-6 peer-focus:text-xs peer-focus:text-slate-500 transition-all">
                    Password
                  </span>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-white font-medium shadow hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/30 disabled:opacity-60"
                >
                  {loginMutation.isPending ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          className="opacity-25"
                        />
                        <path
                          d="M4 12a8 8 0 0 1 8-8"
                          stroke="currentColor"
                          strokeWidth="4"
                          className="opacity-75"
                        />
                      </svg>
                      Signing in…
                    </>
                  ) : (
                    <>
                      <ShieldCheckIcon className="h-5 w-5" />
                      Sign in
                    </>
                  )}
                </button>

                {/* Help row */}
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <a
                    href="#"
                    className="hover:text-slate-900 underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </a>
                  <span className="text-slate-400">v1.0</span>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>

      <footer className="px-6 pb-10">
        <div className="mx-auto max-w-7xl text-slate-400 text-sm">
          © {new Date().getFullYear()} PantryPal. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
