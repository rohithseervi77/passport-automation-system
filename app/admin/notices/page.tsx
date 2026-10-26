"use client";

import React, { useState, useEffect, useCallback } from "react";
import AdminShell from "@/components/AdminShell";
import {
  Bell,
  Search,
  Plus,
  Filter,
  Calendar,
  Pin,
  CheckCircle2,
  AlertCircle,
  Archive,
  Edit,
  Eye,
  Trash2,
  X,
  ExternalLink,
  MapPin,
  FileCheck2,
} from "lucide-react";
import Link from "next/link";

interface Notice {
  id: number;
  noticeId: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  priority: "NORMAL" | "IMPORTANT" | "CRITICAL";
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  isPinned: boolean;
  publishedAt: string;
  effectiveDate?: string | null;
  expiryDate?: string | null;
  region?: string | null;
  affectedCentre?: string | null;
  sourceLabel?: string | null;
  sourceUrl?: string | null;
  author?: string | null;
  lastEditedBy?: string | null;
  createdAt: string;
}

interface NoticeCategory {
  id: number;
  name: string;
  slug: string;
}

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [categories, setCategories] = useState<NoticeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedPriority, setSelectedPriority] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategory, setFormCategory] = useState("Passport Fee & Payment Updates");
  const [formPriority, setFormPriority] = useState<"NORMAL" | "IMPORTANT" | "CRITICAL">("NORMAL");
  const [formStatus, setFormStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("PUBLISHED");
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formSummary, setFormSummary] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formRegion, setFormRegion] = useState("All India");
  const [formAffectedCentre, setFormAffectedCentre] = useState("");
  const [formSourceLabel, setFormSourceLabel] = useState("Ministry of External Affairs");
  const [formSourceUrl, setFormSourceUrl] = useState("https://www.passportindia.gov.in/psp/News");

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);
      if (selectedCategory !== "ALL") params.set("category", selectedCategory);
      if (selectedPriority !== "ALL") params.set("priority", selectedPriority);
      params.set("page", page.toString());
      params.set("limit", "15");

      const res = await fetch(`/api/admin/notices?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load administrative notices");
      const data = await res.json();

      setNotices(data.notices || []);
      setCategories(data.categories || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
      setError("Failed to load notice management records.");
    } finally {
      setLoading(false);
    }
  }, [search, selectedStatus, selectedCategory, selectedPriority, page]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  function openCreateModal() {
    setEditingNotice(null);
    setFormTitle("");
    setFormSlug("");
    setFormCategory("Passport Fee & Payment Updates");
    setFormPriority("NORMAL");
    setFormStatus("PUBLISHED");
    setFormIsPinned(false);
    setFormSummary("");
    setFormContent("");
    setFormRegion("All India");
    setFormAffectedCentre("");
    setFormSourceLabel("Ministry of External Affairs");
    setFormSourceUrl("https://www.passportindia.gov.in/psp/News");
    setIsModalOpen(true);
  }

  function openEditModal(n: Notice) {
    setEditingNotice(n);
    setFormTitle(n.title);
    setFormSlug(n.slug);
    setFormCategory(n.category);
    setFormPriority(n.priority);
    setFormStatus(n.status as any);
    setFormIsPinned(n.isPinned);
    setFormSummary(n.summary);
    setFormContent(n.content);
    setFormRegion(n.region || "All India");
    setFormAffectedCentre(n.affectedCentre || "");
    setFormSourceLabel(n.sourceLabel || "Ministry of External Affairs");
    setFormSourceUrl(n.sourceUrl || "https://www.passportindia.gov.in/psp/News");
    setIsModalOpen(true);
  }

  async function handleSaveNotice(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        title: formTitle,
        slug: formSlug || undefined,
        category: formCategory,
        priority: formPriority,
        status: formStatus,
        isPinned: formIsPinned,
        summary: formSummary,
        content: formContent,
        region: formRegion,
        affectedCentre: formAffectedCentre,
        sourceLabel: formSourceLabel,
        sourceUrl: formSourceUrl,
      };

      let res;
      if (editingNotice) {
        res = await fetch(`/api/admin/notices/${editingNotice.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/notices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save notice.");

      setActionSuccess(editingNotice ? "Notice updated successfully." : "Notice created & published.");
      setIsModalOpen(false);
      fetchNotices();
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while saving notice.");
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(id: number, title: string) {
    if (!confirm(`Are you sure you want to archive notice "${title}"? This maintains audit history but removes it from public view.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/notices/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to archive notice");
      setActionSuccess("Notice archived successfully.");
      fetchNotices();
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      console.error(err);
      setError("Failed to archive notice.");
    }
  }

  async function togglePin(n: Notice) {
    try {
      const res = await fetch(`/api/admin/notices/${n.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !n.isPinned }),
      });
      if (!res.ok) throw new Error("Failed to update pin state");
      fetchNotices();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <AdminShell
      pageTitle="News & Public Notices Management"
      pageSubtitle="Publish, draft, schedule, and archive statutory announcements, daily quotas, and advisories."
    >
      <div className="space-y-6">
        {/* Feedback Alerts */}
        {actionSuccess && (
          <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, ref number, region..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs text-slate-300 focus:outline-none hidden md:block"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="IMPORTANT">Important</option>
              <option value="NORMAL">Normal</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/news"
              target="_blank"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition"
            >
              <Eye className="w-3.5 h-3.5" />
              View Public Feed
            </Link>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Create Announcement
            </button>
          </div>
        </div>

        {/* Notices Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-800/50 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Ref & Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Published Date</th>
                  <th className="py-3 px-4">Region / RPO</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Loading announcements...
                    </td>
                  </tr>
                ) : notices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No notices match the selected criteria. Click "Create Announcement" to publish one.
                    </td>
                  </tr>
                ) : (
                  notices.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-700/20 transition">
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {n.isPinned && (
                            <span className="p-0.5 rounded bg-amber-400/20 text-amber-400" title="Pinned Announcement">
                              <Pin className="w-3 h-3" />
                            </span>
                          )}
                          <span className="font-mono text-[10px] text-purple-300 font-bold">{n.noticeId}</span>
                        </div>
                        <div className="font-semibold text-white truncate" title={n.title}>
                          {n.title}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
                          {n.category}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            n.priority === "CRITICAL"
                              ? "bg-rose-950 text-rose-300 border border-rose-800"
                              : n.priority === "IMPORTANT"
                              ? "bg-amber-950 text-amber-300 border border-amber-800"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {n.priority}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            n.status === "PUBLISHED"
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              : n.status === "DRAFT"
                              ? "bg-slate-800 text-slate-400 border border-slate-700"
                              : "bg-amber-950 text-amber-400 border border-amber-800"
                          }`}
                        >
                          {n.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(n.publishedAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3 px-4 text-slate-300">{n.region || "All India"}</td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => togglePin(n)}
                            title={n.isPinned ? "Unpin notice" : "Pin notice to top"}
                            className={`p-1.5 rounded hover:bg-slate-700 transition ${
                              n.isPinned ? "text-amber-400" : "text-slate-400"
                            }`}
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>

                          <Link
                            href={`/news/${n.slug}`}
                            target="_blank"
                            title="Preview Public Notice"
                            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => openEditModal(n)}
                            title="Edit Notice Details"
                            className="p-1.5 rounded hover:bg-slate-700 text-purple-400 hover:text-purple-300 transition"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {n.status !== "ARCHIVED" && (
                            <button
                              onClick={() => handleArchive(n.id, n.title)}
                              title="Archive Notice"
                              className="p-1.5 rounded hover:bg-slate-700 text-rose-400 hover:text-rose-300 transition"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Create / Edit Notice */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl text-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingNotice ? `Edit Announcement: ${editingNotice.noticeId}` : "Create Public Announcement"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Publish official notices visible across citizen and public portal directories.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveNotice} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Announcement Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                    placeholder="e.g. Special Saturday Passport Mela in Chennai"
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Category <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Priority Level
                    </label>
                    <select
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white focus:outline-none"
                    >
                      <option value="NORMAL">Normal</option>
                      <option value="IMPORTANT">Important</option>
                      <option value="CRITICAL">Critical Advisory</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Publication Status
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white focus:outline-none"
                    >
                      <option value="PUBLISHED">Published (Live)</option>
                      <option value="DRAFT">Draft</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Region / Jurisdiction
                    </label>
                    <input
                      type="text"
                      value={formRegion}
                      onChange={(e) => setFormRegion(e.target.value)}
                      placeholder="e.g. All India, RPO Chennai"
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Affected Centre(s)
                    </label>
                    <input
                      type="text"
                      value={formAffectedCentre}
                      onChange={(e) => setFormAffectedCentre(e.target.value)}
                      placeholder="e.g. PSK Saligramam, All POPSKs"
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Executive Summary <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formSummary}
                    onChange={(e) => setFormSummary(e.target.value)}
                    required
                    placeholder="Brief 1-2 sentence overview shown on index cards..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Full Content & Directives <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={6}
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    required
                    placeholder="Detailed statutory circular text, bullet points, schedules..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Issuing Directorate / Source
                    </label>
                    <input
                      type="text"
                      value={formSourceLabel}
                      onChange={(e) => setFormSourceLabel(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Official Source Reference Link
                    </label>
                    <input
                      type="url"
                      value={formSourceUrl}
                      onChange={(e) => setFormSourceUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isPinned"
                    checked={formIsPinned}
                    onChange={(e) => setFormIsPinned(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="isPinned" className="text-xs text-slate-300 font-semibold cursor-pointer">
                    Pin notice to top of public announcements feed
                  </label>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs disabled:opacity-50"
                  >
                    {saving ? "Saving Notice..." : editingNotice ? "Update Notice" : "Publish Announcement"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
