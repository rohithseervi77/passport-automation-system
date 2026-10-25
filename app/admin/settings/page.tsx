"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import {
  Settings,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Save,
  RefreshCw,
  Sliders,
  Bell,
  Lock,
  Clock,
  HardDrive,
} from "lucide-react";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<{ [key: string]: string }>({});
  const [feedback, setFeedback] = useState<{ key: string; type: "success" | "error"; text: string } | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to load settings");
      const data = await res.json();
      setSettings(data.settings || []);

      // initialize edit values
      const initial: { [key: string]: string } = {};
      (data.settings || []).forEach((s: any) => {
        initial[s.key] = s.value;
      });
      setEditedValues(initial);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  async function handleSave(key: string, description?: string) {
    setSavingKey(key);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          value: editedValues[key],
          description,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update setting");

      setFeedback({ key, type: "success", text: "Setting saved and applied across system." });
      fetchSettings();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ key, type: "error", text: err.message || "Failed to update setting" });
    } finally {
      setSavingKey(null);
    }
  }

  function handleToggle(key: string, currentVal: string, description?: string) {
    const newVal = currentVal === "true" ? "false" : "true";
    setEditedValues((prev) => ({ ...prev, [key]: newVal }));
    // trigger auto save for toggles
    setTimeout(() => {
      fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          value: newVal,
          description,
        }),
      })
        .then(() => fetchSettings())
        .catch(console.error);
    }, 100);
  }

  return (
    <AdminShell pageTitle="System Settings & Operational Flags" pageSubtitle="Global portal configuration, security thresholds, and maintenance controls">
      <div className="space-y-6">
        {/* Top Control Alert */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 text-slate-800 rounded-lg">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Global System Parameters</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Parameters are persisted to PostgreSQL and audited upon modification.
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchSettings()}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Values
          </button>
        </div>

        {/* Settings Form Grid */}
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-sm text-center text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
              Loading system settings registry...
            </div>
          ) : (
            settings.map((s) => {
              const isBoolean = s.value === "true" || s.value === "false";
              const isAnnouncement = s.key.toLowerCase().includes("announcement");
              const isMaintenance = s.key === "MAINTENANCE_MODE";
              const currentValue = editedValues[s.key] !== undefined ? editedValues[s.key] : s.value;

              return (
                <div
                  key={s.key}
                  className={`bg-white p-5 rounded-xl border transition-shadow shadow-sm ${
                    isMaintenance && currentValue === "true" ? "border-amber-400 ring-2 ring-amber-100" : "border-slate-200"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {isMaintenance ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                        ) : isAnnouncement ? (
                          <Bell className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-700" />
                        )}
                        <h3 className="text-sm font-bold text-slate-900 font-mono">{s.key}</h3>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {s.description || "System runtime configuration parameter."}
                      </p>
                      <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-2">
                        <span>Last updated: {new Date(s.updatedAt).toLocaleString()}</span>
                        <span>•</span>
                        <span>By: {s.updatedBy || "System"}</span>
                      </div>
                    </div>

                    <div className="w-full md:w-80 flex flex-col items-end gap-2">
                      {isBoolean ? (
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold ${currentValue === "true" ? "text-amber-600" : "text-slate-500"}`}>
                            {currentValue === "true" ? "ACTIVE / ENABLED" : "DISABLED"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggle(s.key, currentValue, s.description)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              currentValue === "true" ? "bg-amber-600" : "bg-slate-300"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                currentValue === "true" ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      ) : (
                        <div className="w-full flex items-center gap-2">
                          <input
                            type="text"
                            value={currentValue}
                            onChange={(e) =>
                              setEditedValues((prev) => ({ ...prev, [s.key]: e.target.value }))
                            }
                            className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                          />
                          <button
                            onClick={() => handleSave(s.key, s.description)}
                            disabled={savingKey === s.key || currentValue === s.value}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 disabled:opacity-40"
                          >
                            <Save className="w-3.5 h-3.5" />
                            {savingKey === s.key ? "Saving..." : "Save"}
                          </button>
                        </div>
                      )}

                      {feedback && feedback.key === s.key && (
                        <span
                          className={`text-[11px] font-semibold ${
                            feedback.type === "success" ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {feedback.text}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AdminShell>
  );
}
