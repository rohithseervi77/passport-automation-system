"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import {
  Bell,
  Send,
  Users,
  Shield,
  AlertTriangle,
  Info,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Clock,
  Radio,
} from "lucide-react";

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Broadcast form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("INFO");
  const [targetRole, setTargetRole] = useState("ALL");
  const [broadcasting, setBroadcasting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to load notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
      setTotalCount(data.totalCount || 0);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function handleBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setFeedback({ type: "error", text: "Please provide both a title and notification content." });
      return;
    }

    setBroadcasting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          type,
          targetRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to dispatch broadcast");

      setFeedback({ type: "success", text: data.message || "Broadcast successfully dispatched to target users." });
      setTitle("");
      setMessage("");
      fetchNotifications();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to broadcast notification" });
    } finally {
      setBroadcasting(false);
    }
  }

  function getTypeBadge(t: string) {
    switch (t) {
      case "ALERT":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">ALERT</span>;
      case "WARNING":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">WARNING</span>;
      case "SUCCESS":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">SUCCESS</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">INFO</span>;
    }
  }

  return (
    <AdminShell pageTitle="System Announcements & Notifications" pageSubtitle="Broadcast official alerts, maintenance advisories, and track user notifications">
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Total Delivered</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalCount}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-600 uppercase">Unread by Citizens</p>
              <h3 className="text-2xl font-bold text-amber-700 mt-1">{unreadCount}</h3>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-600 uppercase">Broadcast Channel</p>
              <h3 className="text-lg font-bold text-emerald-700 mt-1">Multi-Audience</h3>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Radio className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Broadcast Composer */}
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
              <Radio className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Broadcast New Advisory</h2>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="ALL">All Active Users (Citizens, Officers, Police)</option>
                  <option value="USER">Citizens & Applicants Only</option>
                  <option value="OFFICER">Passport Officers Only</option>
                  <option value="POLICE">Police Verification Staff Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notification Category / Urgency</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "INFO", val: "INFO" },
                    { label: "SUCCESS", val: "SUCCESS" },
                    { label: "WARNING", val: "WARNING" },
                    { label: "ALERT", val: "ALERT" },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setType(item.val)}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        type === item.val
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Advisory Title</label>
                <input
                  type="text"
                  placeholder="e.g. Scheduled Server Maintenance Tonight"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Advisory Message Body</label>
                <textarea
                  rows={4}
                  placeholder="Enter the full announcement details visible in citizens' or officers' notification centers..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              {feedback && (
                <div
                  className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    feedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {feedback.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{feedback.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={broadcasting}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {broadcasting ? "Broadcasting..." : "Dispatch Advisory to Recipients"}
              </button>
            </form>
          </div>

          {/* Recent Broadcasts & Notifications Feed */}
          <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-slate-700" />
                  <h2 className="text-sm font-bold text-slate-900">Recent System Notifications Log</h2>
                </div>
                <button
                  onClick={() => fetchNotifications()}
                  className="p-1.5 text-xs text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>

              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {loading ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                    Fetching notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No recent notifications logged in the database.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeBadge(n.type)}
                          <span className="font-bold text-slate-900">{n.title}</span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{n.message}</p>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                        <span>
                          Recipient: <span className="font-medium text-slate-700">{n.user?.username || `User #${n.userId}`}</span> ({n.user?.role || "CITIZEN"})
                        </span>
                        <span className={`font-semibold ${n.isRead ? "text-slate-400" : "text-amber-600"}`}>
                          {n.isRead ? "Read" : "Unread"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
