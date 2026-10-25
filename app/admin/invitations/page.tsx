"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import {
  UserPlus,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  RefreshCw,
  AlertCircle,
  KeyRound,
  ExternalLink,
} from "lucide-react";

export default function AdminInvitationsPage() {
  const router = useRouter();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, accepted: 0, expired: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL"); // ALL, PENDING, ACCEPTED, EXPIRED

  // Generate modal / form
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [newInviteLink, setNewInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/invitations?status=${filter}`);
      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setInvitations(data.invitations || []);
      setCounts(data.counts || { total: 0, pending: 0, accepted: 0, expired: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter, router]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  async function handleCreateInvitation(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");
    setNewInviteLink("");

    try {
      const res = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create invitation.");
        return;
      }

      const fullLink = `${window.location.origin}${data.invitation.invitationLink}`;
      setNewInviteLink(fullLink);
      setMessage("Secure administrator invitation generated successfully.");
      setEmail("");
      await fetchInvitations();
    } catch {
      setError("Network or server error creating invitation.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopy() {
    if (newInviteLink) {
      navigator.clipboard.writeText(newInviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <AdminShell
      pageTitle="Administrator Invitation Engine"
      pageSubtitle="Cryptographically secure, single-use administrative invitations for onboarding trusted personnel."
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Administrative Invitations</h2>
            <p className="text-xs text-slate-400">
              Generate time-limited (48h), single-use cryptographic tokens to provision new Administrator nodes.
            </p>
          </div>

          <button
            onClick={fetchInvitations}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Generate Invitation Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <UserPlus className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Issue New Administrator Invitation
            </h3>
          </div>

          {error && (
            <div className="p-3.5 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="p-3.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleCreateInvitation} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter invitee's official email address (e.g. officer.admin@pas.gov.in)..."
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition disabled:opacity-50 shrink-0 flex items-center justify-center gap-2 shadow-xs"
            >
              {submitting ? "Generating Token..." : "Generate Secure Token"}
            </button>
          </form>

          {/* Generated Link Box */}
          {newInviteLink && (
            <div className="p-4 rounded-xl bg-slate-900 border border-blue-500/40 space-y-2 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                  Single-Use Invitation Link (Active for 48 Hours)
                </span>
                <span className="text-[10px] text-slate-500">Share securely with the invitee</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={newInviteLink}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 select-all"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Existing Invitations Table */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm space-y-4">
          <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Invitation History Registry
            </h3>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter("ALL")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  filter === "ALL" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                All ({counts.total})
              </button>
              <button
                onClick={() => setFilter("PENDING")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  filter === "PENDING" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Pending ({counts.pending})
              </button>
              <button
                onClick={() => setFilter("ACCEPTED")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  filter === "ACCEPTED" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Accepted ({counts.accepted})
              </button>
              <button
                onClick={() => setFilter("EXPIRED")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  filter === "EXPIRED" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Expired ({counts.expired})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Invitee Email</th>
                  <th className="px-4 py-3">Designated Role</th>
                  <th className="px-4 py-3">Invited By</th>
                  <th className="px-4 py-3">Created Date</th>
                  <th className="px-4 py-3">Expiration</th>
                  <th className="px-4 py-3 text-right">Standing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      Loading invitation records...
                    </td>
                  </tr>
                ) : invitations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      No invitations found for this filter.
                    </td>
                  </tr>
                ) : (
                  invitations.map((inv) => {
                    const isExpired = new Date(inv.expiresAt) < new Date();
                    return (
                      <tr key={inv.id} className="hover:bg-slate-900/50 transition">
                        <td className="px-4 py-3.5 font-mono text-slate-200">{inv.email}</td>
                        <td className="px-4 py-3.5">
                          <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-amber-950 text-amber-300 border border-amber-600/40">
                            {inv.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-400">{inv.invitedBy}</td>
                        <td className="px-4 py-3.5 text-slate-400">
                          {new Date(inv.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                          {new Date(inv.expiresAt).toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {inv.isAccepted ? (
                            <span className="inline-flex items-center gap-1 font-bold text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-600/30">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>ACCEPTED</span>
                            </span>
                          ) : isExpired ? (
                            <span className="inline-flex items-center gap-1 font-bold text-[10px] text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-600/30">
                              <XCircle className="w-3 h-3" />
                              <span>EXPIRED</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-bold text-[10px] text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-600/30">
                              <Clock className="w-3 h-3" />
                              <span>PENDING ACCEPTANCE</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
