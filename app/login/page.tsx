"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function fillCredentials(user: string, pass: string) {
    setUsername(user);
    setPassword(pass);
    setError("");
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed.");
        setLoading(false);
        return;
      }

      // Redirect based on the user's role
      if (data.user.role === "APPLICANT") {
        router.push("/applicant/dashboard");
      } else if (data.user.role === "OFFICER") {
        router.push("/officer/dashboard");
      } else if (data.user.role === "POLICE") {
        router.push("/police/dashboard");
      } else {
        setError("Unknown user role.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Unable to connect to the server.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold">
              PAS
            </div>

            <div>
              <h1 className="font-bold">Passport Automation System</h1>

              <p className="text-xs text-slate-400">
                Secure • Simple • Transparent
              </p>
            </div>
          </Link>

          <Link
            href="/register"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Create an account
          </Link>
        </div>
      </header>

      {/* Login Section */}
      <section className="flex min-h-[calc(100vh-81px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
              Secure Portal Login
            </p>

            <h2 className="mt-2 text-3xl font-bold">Welcome back</h2>

            <p className="mt-2 text-sm text-slate-400">
              Sign in to access your role dashboard.
            </p>
          </div>

          {/* Quick Demo Login Preset Buttons */}
          <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              ⚡ Quick Fill Demo Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials("applicant_demo", "Applicant@123")}
                className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2 py-2 text-xs font-medium text-blue-300 hover:bg-blue-500/20 transition text-center"
              >
                👤 Applicant
              </button>
              <button
                type="button"
                onClick={() => fillCredentials("officer_demo", "Officer@123")}
                className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-2 text-xs font-medium text-amber-300 hover:bg-amber-500/20 transition text-center"
              >
                🧑‍💼 Officer
              </button>
              <button
                type="button"
                onClick={() => fillCredentials("police_demo", "Police@123")}
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 transition text-center"
              >
                👮 Police
              </button>
            </div>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl"
          >
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium"
              >
                Username
              </label>

              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your username"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500"
                required
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login"}
            </button>

            {/* Register Link */}
            <p className="text-center text-sm text-slate-400">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-blue-400 hover:text-blue-300"
              >
                Register as Applicant
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
