"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import {
  Activity,
  LogOut,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  User,
  Clock,
  Laptop,
} from "lucide-react";

export default function AdminActiveSessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/security/sessions");
      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error("Failed to load active sessions:", err);
      setError("Network error loading active sessions.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  async function handleRevoke(sessionId: string, isCurrent: boolean) {
    if (
      isCurrent &&
      !confirm("WARNING: This is your CURRENT administrative session! Revoking it will log you out immediately. Proceed?")
    ) {
      return;
    } else if (
      !isCurrent &&
      !confirm("Revoke this active user session? The user will be required to re-authenticate.")
    ) {
      return;
    }

    setRevokingId(sessionId);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/admin/security/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to revoke session.");
        return;
      }

      if (data.isCurrentSession) {
        router.push("/admin/login");
        return;
      }

      setMessage(data.message);
      await fetchSessions();
    } catch {
      setError("Error executing session revocation.");
    } finally {
      setRevokingId(null);
    }
  }

  return (
    <AdminShell
      pageTitle="Concurrent Session Telemetry & Revocation"
      pageSubtitle="Live monitoring of active JWT sessions across the platform with cryptographic one-click revocation."
    >
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Active Cryptographic Sessions</h2>
            <p className="text-xs text-slate-400">
              Total {sessions.length} sessions active within the last 48 hours.
            </p>
          </div>

          <button
            onClick={fetchSessions}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>

        {message && (
          <div className="p-3.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Sessions List Cards */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Polling live session telemetry...
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500">
              No active sessions detected within the 48-hour activity window.
            </div>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                className={`bg-slate-950 border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                  s.isCurrent ? "border-blue-500/50 bg-blue-950/10" : "border-slate-800"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{s.email}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono uppercase bg-slate-900 text-slate-400 border border-slate-800">
                      {s.role}
                    </span>
                    {s.isCurrent && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-900 text-blue-300 border border-blue-600/40">
                        THIS SESSION
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Login: {new Date(s.loginTime).toLocaleString("en-IN")}</span>
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Laptop className="w-3.5 h-3.5 text-slate-500" />
                      <span>IP: {s.ipAddress}</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono truncate max-w-xl">
                    Client: {s.userAgent}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleRevoke(s.sessionId, s.isCurrent)}
                    disabled={revokingId === s.sessionId}
                    className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{revokingId === s.sessionId ? "Revoking..." : "Revoke Session"}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminShell>
  );
}
