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
  Upload,
  FileSpreadsheet,
  Download,
  Layers,
  ArrowRight
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

interface YearStat {
  year: number;
  count: number;
}

interface NoticeStats {
  publishedCount: number;
  draftCount: number;
  archivedCount: number;
  yearStats: YearStat[];
}

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [categories, setCategories] = useState<NoticeCategory[]>([]);
  const [stats, setStats] = useState<NoticeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedPriority, setSelectedPriority] = useState("ALL");
  const [selectedYear, setSelectedYear] = useState("ALL");
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
  const [formPublishedAt, setFormPublishedAt] = useState(new Date().toISOString().split("T")[0]);
  const [formRegion, setFormRegion] = useState("All India");
  const [formAffectedCentre, setFormAffectedCentre] = useState("");
  const [formSourceLabel, setFormSourceLabel] = useState("Ministry of External Affairs");
  const [formSourceUrl, setFormSourceUrl] = useState("https://www.passportindia.gov.in/psp/News");

  // Import Modal State (CSV / JSON)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFormat, setImportFormat] = useState<"csv" | "json">("csv");
  const [importRawData, setImportRawData] = useState("");
  const [importValidating, setImportValidating] = useState(false);
  const [importCommitting, setImportCommitting] = useState(false);
  const [importPreview, setImportPreview] = useState<any>(null);
  const [importError, setImportError] = useState("");

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);
      if (selectedCategory !== "ALL") params.set("category", selectedCategory);
      if (selectedPriority !== "ALL") params.set("priority", selectedPriority);
      if (selectedYear !== "ALL") params.set("year", selectedYear);
      params.set("page", page.toString());
      params.set("limit", "15");

      const res = await fetch(`/api/admin/notices?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load administrative notices");
      const data = await res.json();

      setNotices(data.notices || []);
      setCategories(data.categories || []);
      setStats(data.stats || null);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load notice management records from database.");
    } finally {
      setLoading(false);
    }
  }, [search, selectedStatus, selectedCategory, selectedPriority, selectedYear, page]);

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
    setFormPublishedAt(new Date().toISOString().split("T")[0]);
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
    setFormPublishedAt(n.publishedAt ? new Date(n.publishedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);
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
        title: formTitle.trim(),
        slug: formSlug.trim(),
        category: formCategory,
        priority: formPriority,
        status: formStatus,
        isPinned: formIsPinned,
        summary: formSummary.trim(),
        content: formContent.trim(),
        publishedAt: formPublishedAt ? new Date(formPublishedAt).toISOString() : new Date().toISOString(),
        region: formRegion.trim() || null,
        affectedCentre: formAffectedCentre.trim() || null,
        sourceLabel: formSourceLabel.trim() || null,
        sourceUrl: formSourceUrl.trim() || null,
      };

      if (editingNotice) {
        // PUT update
        const res = await fetch(`/api/admin/notices/${editingNotice.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update notice in database");

        setActionSuccess(`Notice "${payload.title}" updated successfully.`);
      } else {
        // POST create
        const res = await fetch("/api/admin/notices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create notice in database");

        setActionSuccess(`Notice "${payload.title}" published successfully.`);
      }

      setIsModalOpen(false);
      fetchNotices();
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err: any) {
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

  // Import Handlers
  async function handleValidateImport() {
    setImportError("");
    setImportValidating(true);
    setImportPreview(null);
    try {
      const res = await fetch("/api/admin/notices/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawData: importRawData,
          format: importFormat,
          commit: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Validation failed");
      setImportPreview(data);
    } catch (err: any) {
      setImportError(err.message || "Validation error");
    } finally {
      setImportValidating(false);
    }
  }

  async function handleCommitImport() {
    setImportError("");
    setImportCommitting(true);
    try {
      const res = await fetch("/api/admin/notices/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawData: importRawData,
          format: importFormat,
          commit: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import commit failed");

      setActionSuccess(`Successfully imported ${data.importedCount} notices into the database.`);
      setIsImportModalOpen(false);
      setImportRawData("");
      setImportPreview(null);
      fetchNotices();
      setTimeout(() => setActionSuccess(""), 5000);
    } catch (err: any) {
      setImportError(err.message || "Import commit error");
    } finally {
      setImportCommitting(false);
    }
  }

  function loadSampleCsv() {
    setImportFormat("csv");
    setImportRawData(`title,summary,category,publishedAt,status,sourceLabel,sourceUrl
"Comprehensive Annual Verification Drive 2025","Special residential address verification audit conducted in collaboration with state police across Tamil Nadu in 2025.","Police Clearance Certificates (PCC)","2025-08-14","PUBLISHED","RPO Chennai Press Cell","https://www.passportindia.gov.in/psp/News"
"Special Student Tatkaal Window 2025","Expedited processing window for overseas university students launched during fall 2025 admissions.","Appointment Availability & Schedules","2025-07-20","PUBLISHED","MEA Education Outreach","https://www.passportindia.gov.in/psp/News"`);
  }

  return (
    <AdminShell
      pageTitle="News & Public Notices Management"
      pageSubtitle="Publish, draft, schedule, and archive statutory announcements, daily quotas, and advisories."
    >
      <div className="space-y-6">
        {/* Academic Simulation Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start space-x-3 text-amber-900 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Database-Driven Information Directorate:</span> This administrative portal reads
            and writes notices directly into Supabase PostgreSQL. Any newly published, edited, or imported announcement
            will immediately appear on the citizen website without code modifications.
          </div>
        </div>

        {/* Feedback Alerts */}
        {actionSuccess && (
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess("")} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError("")} className="text-red-700 hover:text-red-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Database Summary KPI Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total in Database
              </span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">{total}</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Across all categories</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                Published Live
              </span>
              <span className="text-2xl font-bold text-emerald-700 mt-1 block">{stats.publishedCount}</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Visible to public citizens</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                Draft / Archived
              </span>
              <span className="text-2xl font-bold text-amber-700 mt-1 block">
                {stats.draftCount + stats.archivedCount}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {stats.draftCount} Drafts, {stats.archivedCount} Archived
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">
                Yearly Records in DB
              </span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {stats.yearStats && stats.yearStats.length > 0 ? (
                  stats.yearStats.map((ys) => (
                    <span
                      key={ys.year}
                      className="px-2 py-0.5 rounded bg-purple-50 text-purple-900 font-bold text-xs border border-purple-200"
                    >
                      {ys.year}: {ys.count}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No dated records</span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Dynamically queried by year</span>
            </div>
          </div>
        )}

        {/* Top Control Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, ref number, region..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 font-medium focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 font-medium focus:outline-hidden hidden sm:block"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="IMPORTANT">Important</option>
              <option value="NORMAL">Normal</option>
            </select>

            {stats?.yearStats && stats.yearStats.length > 0 && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 font-medium focus:outline-hidden"
              >
                <option value="ALL">All Years</option>
                {stats.yearStats.map((ys) => (
                  <option key={ys.year} value={ys.year}>
                    Year {ys.year} ({ys.count})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsImportModalOpen(true);
                setImportError("");
                setImportPreview(null);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-blue-700" />
              <span>Import (CSV/JSON)</span>
            </button>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Notice</span>
            </button>
          </div>
        </div>

        {/* Notices Table */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
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
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      Loading announcements from database...
                    </td>
                  </tr>
                ) : notices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No notices match the selected criteria in the database.
                    </td>
                  </tr>
                ) : (
                  notices.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {n.isPinned && (
                            <span className="p-0.5 rounded bg-amber-100 text-amber-700" title="Pinned Announcement">
                              <Pin className="w-3 h-3" />
                            </span>
                          )}
                          <span className="font-mono text-[10px] text-blue-700 font-bold">{n.noticeId}</span>
                        </div>
                        <div className="font-semibold text-slate-900 truncate" title={n.title}>
                          {n.title}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[11px]">
                          {n.category}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            n.priority === "CRITICAL"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : n.priority === "IMPORTANT"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {n.priority}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            n.status === "PUBLISHED"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : n.status === "DRAFT"
                              ? "bg-slate-100 text-slate-700 border border-slate-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {n.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {n.publishedAt
                          ? new Date(n.publishedAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </td>

                      <td className="py-3 px-4 text-slate-700">{n.region || "All India"}</td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => togglePin(n)}
                            title={n.isPinned ? "Unpin notice" : "Pin notice to top"}
                            className={`p-1.5 rounded hover:bg-slate-100 transition ${
                              n.isPinned ? "text-amber-600" : "text-slate-400"
                            }`}
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>

                          <Link
                            href={`/news/${n.slug}`}
                            target="_blank"
                            title="Preview Public Notice"
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => openEditModal(n)}
                            title="Edit Notice Details"
                            className="p-1.5 rounded hover:bg-slate-100 text-blue-700 hover:text-blue-900 transition"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {n.status !== "ARCHIVED" && (
                            <button
                              onClick={() => handleArchive(n.id, n.title)}
                              title="Archive Notice"
                              className="p-1.5 rounded hover:bg-slate-100 text-rose-600 hover:text-rose-800 transition"
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

        {/* Create / Edit Notice Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-blue-700" />
                  <h3 className="text-base font-bold text-slate-900">
                    {editingNotice ? `Edit Notice: ${editingNotice.noticeId}` : "Create Public Announcement"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveNotice} className="p-6 space-y-4 text-xs text-slate-700">
                <div>
                  <label className="block font-semibold mb-1">Official Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Gazette Notification: Revised Passport Fees"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Category *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Priority Level</label>
                    <select
                      value={formPriority}
                      onChange={(e: any) => setFormPriority(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="NORMAL">NORMAL</option>
                      <option value="IMPORTANT">IMPORTANT</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e: any) => setFormStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="PUBLISHED">PUBLISHED (Visible to Public)</option>
                      <option value="DRAFT">DRAFT (Hidden from Public)</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Publication Date</label>
                    <input
                      type="date"
                      value={formPublishedAt}
                      onChange={(e) => setFormPublishedAt(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Pin Announcement</label>
                    <div className="pt-2">
                      <label className="inline-flex items-center gap-2 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={formIsPinned}
                          onChange={(e) => setFormIsPinned(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-600"
                        />
                        <span>Pin to top marquee</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Executive Summary *</label>
                  <textarea
                    rows={2}
                    required
                    value={formSummary}
                    onChange={(e) => setFormSummary(e.target.value)}
                    placeholder="Short 2-line summary visible in public feeds..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Complete Circular / Content *</label>
                  <textarea
                    rows={5}
                    required
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Full circular text, guidelines, instructions (Markdown supported)..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Region / Jurisdiction</label>
                    <input
                      type="text"
                      value={formRegion}
                      onChange={(e) => setFormRegion(e.target.value)}
                      placeholder="e.g. All India, RPO Chennai..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Official Source Label</label>
                    <input
                      type="text"
                      value={formSourceLabel}
                      onChange={(e) => setFormSourceLabel(e.target.value)}
                      placeholder="e.g. Ministry of External Affairs"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                  >
                    {saving ? "Saving..." : editingNotice ? "Update Notice" : "Publish to Database"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Import CSV / JSON Modal (Section 29) */}
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-5 h-5 text-blue-700" />
                  <h3 className="text-base font-bold text-slate-900">
                    Import Historical & Public Notices into Database
                  </h3>
                </div>
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs text-slate-700">
                <p className="text-slate-600 leading-relaxed">
                  Safely import 2025 or other historical notices into PostgreSQL. Data is validated before insertion and
                  committed within a database transaction.
                </p>

                {importError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{importError}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-700">Payload Format:</span>
                    <button
                      type="button"
                      onClick={() => setImportFormat("csv")}
                      className={`px-3 py-1 rounded text-xs font-bold transition ${
                        importFormat === "csv" ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      CSV
                    </button>
                    <button
                      type="button"
                      onClick={() => setImportFormat("json")}
                      className={`px-3 py-1 rounded text-xs font-bold transition ${
                        importFormat === "json" ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      JSON
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={loadSampleCsv}
                    className="text-blue-700 font-semibold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Load 2025 Sample Template</span>
                  </button>
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    Paste Raw {importFormat.toUpperCase()} Records *
                  </label>
                  <textarea
                    rows={8}
                    required
                    value={importRawData}
                    onChange={(e) => {
                      setImportRawData(e.target.value);
                      setImportPreview(null);
                    }}
                    placeholder={
                      importFormat === "csv"
                        ? `title,summary,category,publishedAt,status,sourceLabel,sourceUrl\n"Annual Report 2025","Summary text...","Public Notices...","2025-05-10","PUBLISHED","CPV MEA","https://..."`
                        : `[\n  {\n    "title": "Annual Report 2025",\n    "summary": "Summary...",\n    "publishedAt": "2025-05-10",\n    "status": "PUBLISHED"\n  }\n]`
                    }
                    className="w-full font-mono text-[11px] px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Validation Preview Card */}
                {importPreview && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">Validation Audit Report:</span>
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-700 font-bold">
                          ✓ {importPreview.validCount} Valid Records
                        </span>
                        {importPreview.invalidCount > 0 && (
                          <span className="text-rose-700 font-bold">
                            ✕ {importPreview.invalidCount} Rejected
                          </span>
                        )}
                      </div>
                    </div>

                    {importPreview.validSample && importPreview.validSample.length > 0 && (
                      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-100 text-slate-600 font-bold uppercase">
                            <tr>
                              <th className="p-2">Title</th>
                              <th className="p-2">Category</th>
                              <th className="p-2">Year</th>
                              <th className="p-2">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {importPreview.validSample.map((vs: any, idx: number) => (
                              <tr key={idx}>
                                <td className="p-2 font-medium text-slate-900 truncate max-w-xs">{vs.title}</td>
                                <td className="p-2 text-slate-600">{vs.category}</td>
                                <td className="p-2 font-mono font-bold text-purple-700">
                                  {new Date(vs.publishedAt).getFullYear()}
                                </td>
                                <td className="p-2 text-emerald-700 font-bold">{vs.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleValidateImport}
                    disabled={importValidating || !importRawData.trim()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                  >
                    {importValidating ? "Validating..." : "Validate & Preview"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCommitImport}
                    disabled={importCommitting || !importPreview || importPreview.validCount === 0}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {importCommitting ? "Committing..." : "Commit Valid Records to Database"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
