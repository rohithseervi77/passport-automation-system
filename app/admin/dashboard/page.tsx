"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"APPLICATIONS" | "LOGINS">("APPLICATIONS");

  // Application Workload State
  const [applications, setApplications] = useState<any[]>([]);
  const [appLoading, setAppLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Login Activity State
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginFilter, setLoginFilter] = useState("ALL");
  const [loginPage, setLoginPage] = useState(1);
  const [loginTotalPages, setLoginTotalPages] = useState(1);
  const [loginStats, setLoginStats] = useState({
    totalLogins: 0,
    successfulLogins: 0,
    failedAttempts: 0,
    activeSessions: 0,
  });

  useEffect(() => {
    if (activeTab === "APPLICATIONS") {
      fetchApplications();
    } else {
      fetchLoginHistory();
    }
  }, [activeTab, filter, page, loginFilter, loginPage]);

  async function fetchApplications() {
    setAppLoading(true);
    try {
      const res = await fetch(`/api/admin/applications?status=${filter}&page=${page}`);
      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setApplications(data.applications || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setAppLoading(false);
    }
  }

  async function fetchLoginHistory() {
    setLoginLoading(true);
    try {
      const res = await fetch(
        `/api/admin/login-history?status=${loginFilter}&page=${loginPage}`
      );
      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setLoginHistory(data.logins || []);
      setLoginTotalPages(data.pagination?.totalPages || 1);
      if (data.stats) {
        setLoginStats(data.stats);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoginLoading(false);
    }
  }

  function getStatusBadge(status: string) {
    if (status.includes("APPROVED") || status.includes("ISSUED") || status.includes("DISPATCHED")) {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    }
    if (status.includes("REJECTED")) {
      return "bg-red-500/10 text-red-400 border-red-500/30";
    }
    if (status.includes("PENDING") || status.includes("VERIFICATION")) {
      return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    }
    return "bg-blue-500/10 text-blue-400 border-blue-500/30";
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 font-bold text-white shadow-lg shadow-purple-600/30">
              PAS
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg leading-tight tracking-tight">
                System Administration Console
              </h1>
              <p className="text-xs text-slate-400">
                Centralized Governance, Workload Oversight & Security Audit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase text-purple-300">
              ADMIN
            </span>
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                router.push("/login");
              }}
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-4">
          <button
            onClick={() => setActiveTab("APPLICATIONS")}
            className={`pb-3 text-sm font-semibold transition border-b-2 ${
              activeTab === "APPLICATIONS"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Application Workload
          </button>
          <button
            onClick={() => setActiveTab("LOGINS")}
            className={`pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
              activeTab === "LOGINS"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <span>Login Activity</span>
            {loginStats.failedAttempts > 0 && (
              <span className="rounded-full bg-red-500/20 px-2 py-0.2 text-[10px] font-bold text-red-400 border border-red-500/30">
                {loginStats.failedAttempts} failed
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: APPLICATION WORKLOAD */}
        {activeTab === "APPLICATIONS" && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  System Application Workload
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Overview of all incoming, verified, and pending citizen passport requests.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="filter-status" className="text-xs text-slate-400">
                  Filter:
                </label>
                <select
                  id="filter-status"
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white outline-none focus:border-purple-500 transition"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="UNDER_OFFICER_VERIFICATION">Officer Verification</option>
                  <option value="POLICE_VERIFICATION_PENDING">Police Pending</option>
                  <option value="POLICE_CLEARED">Police Cleared</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="PASSPORT_ISSUED">Passport Issued</option>
                  <option value="PASSPORT_DISPATCHED">Passport Dispatched</option>
                </select>
              </div>
            </div>

            {appLoading ? (
              <div className="flex justify-center items-center h-64 rounded-2xl border border-slate-800 bg-slate-900/40">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-800 text-left">
                    <thead className="bg-slate-950/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-6 py-3.5">Application ID</th>
                        <th className="px-6 py-3.5">Applicant Name</th>
                        <th className="px-6 py-3.5">Type</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5">Last Updated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {applications.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-800/30 transition">
                          <td className="px-6 py-4 font-mono font-bold text-blue-400 whitespace-nowrap">
                            {app.applicationId}
                          </td>
                          <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                            {app.applicant?.name || "Unknown"}
                          </td>
                          <td className="px-6 py-4 text-slate-300 text-xs whitespace-nowrap">
                            {app.passportType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getStatusBadge(
                                app.status
                              )}`}
                            >
                              {app.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">
                            {new Date(app.updatedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                      {applications.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                            No applications found for the selected status.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/60 px-6 py-3.5 text-xs text-slate-400">
                  <div>
                    Showing page <span className="font-semibold text-white">{page}</span> of{" "}
                    <span className="font-semibold text-white">{totalPages}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB 2: LOGIN ACTIVITY & SECURITY AUDIT */}
        {activeTab === "LOGINS" && (
          <>
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <span className="text-xs text-slate-400">Total Logins</span>
                <p className="text-2xl font-bold mt-1 text-white">{loginStats.totalLogins}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <span className="text-xs text-slate-400">Successful Logins</span>
                <p className="text-2xl font-bold mt-1 text-emerald-400">
                  {loginStats.successfulLogins}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <span className="text-xs text-slate-400">Failed Attempts</span>
                <p className="text-2xl font-bold mt-1 text-red-400">
                  {loginStats.failedAttempts}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <span className="text-xs text-slate-400">Active Sessions</span>
                <p className="text-2xl font-bold mt-1 text-purple-400">
                  {loginStats.activeSessions}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Authentication & Login Activity
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Immutable record of user logins, timestamps, session states, and security events. Passwords are never stored or logged.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="filter-login" className="text-xs text-slate-400">
                  Filter:
                </label>
                <select
                  id="filter-login"
                  value={loginFilter}
                  onChange={(e) => {
                    setLoginFilter(e.target.value);
                    setLoginPage(1);
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white outline-none focus:border-purple-500 transition"
                >
                  <option value="ALL">All Events</option>
                  <option value="SUCCESS">Successful Only</option>
                  <option value="FAILED">Failed Attempts Only</option>
                </select>
              </div>
            </div>

            {loginLoading ? (
              <div className="flex justify-center items-center h-64 rounded-2xl border border-slate-800 bg-slate-900/40">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-800 text-left">
                    <thead className="bg-slate-950/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-6 py-3.5">User ID / Auth ID</th>
                        <th className="px-6 py-3.5">Email</th>
                        <th className="px-6 py-3.5">Role</th>
                        <th className="px-6 py-3.5">Login Time</th>
                        <th className="px-6 py-3.5">IP Address</th>
                        <th className="px-6 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {loginHistory.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-800/30 transition">
                          <td className="px-6 py-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                            {log.authUserId ? log.authUserId.slice(0, 13) + "..." : "N/A"}
                          </td>
                          <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                            {log.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                              {log.role || "USER"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-300 whitespace-nowrap">
                            {new Date(log.loginTime).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                            {log.ipAddress || "unknown"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {log.success ? (
                              <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                                SUCCESS
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-red-400">
                                FAILED
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {loginHistory.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                            No login history events found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/60 px-6 py-3.5 text-xs text-slate-400">
                  <div>
                    Showing page <span className="font-semibold text-white">{loginPage}</span> of{" "}
                    <span className="font-semibold text-white">{loginTotalPages}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setLoginPage((p) => Math.max(1, p - 1))}
                      disabled={loginPage === 1}
                      className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setLoginPage((p) => Math.min(loginTotalPages, p + 1))}
                      disabled={loginPage === loginTotalPages}
                      className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
