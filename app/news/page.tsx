"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Bell, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  AlertTriangle, 
  FileText, 
  ArrowRight, 
  ExternalLink,
  ChevronRight,
  Pin,
  RefreshCw,
  Clock,
  ShieldCheck,
  Building2,
  FileCheck2
} from "lucide-react";
import AcademicDisclaimer from "@/components/AcademicDisclaimer";

interface Notice {
  id: number;
  noticeId: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  priority: "NORMAL" | "IMPORTANT" | "CRITICAL";
  status: string;
  isPinned: boolean;
  publishedAt: string;
  effectiveDate?: string | null;
  expiryDate?: string | null;
  region?: string | null;
  affectedCentre?: string | null;
  sourceLabel?: string | null;
  sourceUrl?: string | null;
}

interface NoticeCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export default function NewsPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [categories, setCategories] = useState<NoticeCategory[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedPriority, setSelectedPriority] = useState("ALL");
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (selectedCategory !== "ALL") params.set("category", selectedCategory);
      if (selectedPriority !== "ALL") params.set("priority", selectedPriority);
      if (selectedRegion !== "ALL") params.set("region", selectedRegion);
      params.set("page", page.toString());
      params.set("limit", "10");

      const res = await fetch(`/api/news?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load notices");
      const data = await res.json();

      setNotices(data.notices || []);
      setCategories(data.categories || []);
      setRegions(data.regions || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to public announcement feed. Please check your network.");
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedPriority, selectedRegion, page]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  function handleResetFilters() {
    setSearch("");
    setSelectedCategory("ALL");
    setSelectedPriority("ALL");
    setSelectedRegion("ALL");
    setPage(1);
  }

  // Pinned or Critical notices for top marquee / alert area
  const pinnedNotices = notices.filter((n) => n.isPinned || n.priority === "CRITICAL");

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between">
      {/* Top Banner Ribbon */}
      <div>
        <div className="h-1.5 w-full flex">
          <div className="flex-1 bg-[#FF9933]"></div>
          <div className="flex-1 bg-white"></div>
          <div className="flex-1 bg-[#138808]"></div>
        </div>
        <AcademicDisclaimer />

        {/* Institutional Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-950 font-bold text-white text-base shadow-xs">
                PAS
              </div>
              <div>
                <span className="block font-bold text-base text-slate-900 leading-tight">
                  Passport Automation System
                </span>
                <p className="text-xs text-slate-500 font-medium">
                  Public Announcements & Information Directorate
                </p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-700">
              <Link href="/" className="hover:text-blue-900 transition">Home</Link>
              <Link href="/news" className="text-blue-900 font-bold">News & Notices</Link>
              <Link href="/services" className="hover:text-blue-900 transition">Services</Link>
              <Link href="/fee-calculator" className="hover:text-blue-900 transition">Fee Schedule</Link>
              <Link href="/locate-centre" className="hover:text-blue-900 transition">Locate Centre</Link>
              <Link href="/track" className="hover:text-blue-900 transition text-amber-700">Track ARN</Link>
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 rounded-lg bg-blue-950 text-white text-xs font-semibold hover:bg-blue-900 transition shadow-2xs"
              >
                Register
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-linear-to-r from-[#002B49] to-blue-950 text-white py-10 px-4 sm:px-6 border-b border-blue-900">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-800/60 text-blue-200 text-xs font-semibold mb-2 border border-blue-700/50">
                  <Bell className="w-3.5 h-3.5 text-amber-300" />
                  Official Communication Channel
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  News & Public Notices Centre
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-blue-200/90 max-w-2xl leading-relaxed">
                  Real-time statutory notifications, daily appointment quota schedules, Regional Passport Office
                  circulars, fee revisions, and service advisories across India.
                </p>
              </div>

              {/* Gazette Citation Badge */}
              <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-4 rounded-xl text-xs max-w-sm">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold mb-1">
                  <FileCheck2 className="w-4 h-4" />
                  <span>Latest Gazette Notice</span>
                </div>
                <p className="text-[11px] text-blue-100 leading-normal">
                  Revised Passport Fees effective from <strong>1 July 2026</strong> (Gazette G.S.R. 516(E) dated 25 June 2026).
                </p>
                <Link
                  href="/news/revised-passport-fee-schedule-july-2026"
                  className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-white underline hover:text-amber-200"
                >
                  Read Gazette Circular →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Prominently Displayed Important Notice Banner (if any pinned/critical notice exists) */}
        {pinnedNotices.length > 0 && (
          <section className="bg-amber-50 border-b border-amber-200 px-4 py-3">
            <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start sm:items-center gap-2 text-amber-950">
                <span className="p-1 rounded bg-amber-500 text-white shrink-0 shadow-2xs font-bold text-[10px] uppercase">
                  Important
                </span>
                <span className="font-semibold">{pinnedNotices[0].title}</span>
              </div>
              <Link
                href={`/news/${pinnedNotices[0].slug}`}
                className="shrink-0 text-amber-900 font-bold hover:underline inline-flex items-center gap-1 text-xs"
              >
                View Notice Details →
              </Link>
            </div>
          </section>
        )}

        {/* Main Content Area */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          {/* Search & Filter Toolbar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs mb-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search title, summary, keyword..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-900"
                >
                  <option value="ALL">All Categories ({categories.length})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <select
                  value={selectedPriority}
                  onChange={(e) => {
                    setSelectedPriority(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-900"
                >
                  <option value="ALL">All Priority Levels</option>
                  <option value="CRITICAL">Critical Advisories</option>
                  <option value="IMPORTANT">Important Announcements</option>
                  <option value="NORMAL">Standard Circulars</option>
                </select>
              </div>

              {/* Region / RPO Filter */}
              <div>
                <select
                  value={selectedRegion}
                  onChange={(e) => {
                    setSelectedRegion(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-900"
                >
                  <option value="ALL">All Regions / RPOs</option>
                  {regions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters & Counter */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>Showing <strong>{notices.length}</strong> of <strong>{total}</strong> published notices</span>
                {(search || selectedCategory !== "ALL" || selectedPriority !== "ALL" || selectedRegion !== "ALL") && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs text-blue-900 font-semibold hover:underline flex items-center gap-1"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              <div className="text-[11px] text-slate-400">
                Sorted by: Pinned First • Newest Publication Date
              </div>
            </div>
          </div>

          {/* Notices Grid / Feed */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-3 border-blue-950 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs font-semibold text-slate-600">Retrieving announcements from public database...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-300 rounded-xl p-6 text-center text-xs text-rose-800">
              <AlertTriangle className="w-6 h-6 text-rose-600 mx-auto mb-2" />
              <p className="font-bold">{error}</p>
              <button
                onClick={fetchNotices}
                className="mt-3 px-4 py-1.5 rounded-lg bg-rose-900 text-white text-xs font-semibold hover:bg-rose-800"
              >
                Retry Query
              </button>
            </div>
          ) : notices.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
              <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No Announcements Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No published notices matched your selected filters or search terms. Try adjusting your search query.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 rounded-lg bg-blue-950 text-white text-xs font-semibold hover:bg-blue-900 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {notices.map((notice) => {
                const isCritical = notice.priority === "CRITICAL";
                const isImportant = notice.priority === "IMPORTANT";

                return (
                  <article
                    key={notice.id}
                    className={`rounded-xl border bg-white p-5 sm:p-6 shadow-xs transition hover:shadow-md relative overflow-hidden ${
                      isCritical
                        ? "border-rose-300 ring-1 ring-rose-200"
                        : isImportant
                        ? "border-amber-300"
                        : "border-slate-200"
                    }`}
                  >
                    {/* Left Priority Indicator Ribbon */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        isCritical ? "bg-rose-600" : isImportant ? "bg-amber-500" : "bg-blue-950"
                      }`}
                    />

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1 pl-2">
                        {/* Meta Tags */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          {notice.isPinned && (
                            <span className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[10px] uppercase">
                              <Pin className="w-3 h-3 text-amber-700" />
                              Pinned Notice
                            </span>
                          )}

                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                              isCritical
                                ? "bg-rose-100 text-rose-800"
                                : isImportant
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {notice.priority}
                          </span>

                          <span className="bg-blue-50 text-blue-900 font-semibold px-2 py-0.5 rounded border border-blue-100">
                            {notice.category}
                          </span>

                          {notice.region && (
                            <span className="text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {notice.region}
                            </span>
                          )}

                          <span className="text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(notice.publishedAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        {/* Title */}
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 hover:text-blue-950">
                          <Link href={`/news/${notice.slug}`} className="hover:underline">
                            {notice.title}
                          </Link>
                        </h2>

                        {/* Summary */}
                        <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
                          {notice.summary}
                        </p>

                        {/* Affected Centre or Source citation */}
                        {(notice.affectedCentre || notice.sourceLabel) && (
                          <div className="pt-1 text-[11px] text-slate-500 flex flex-wrap gap-4">
                            {notice.affectedCentre && (
                              <span>
                                Affected Centres: <strong className="text-slate-700">{notice.affectedCentre}</strong>
                              </span>
                            )}
                            {notice.sourceLabel && (
                              <span>
                                Source: <span className="italic">{notice.sourceLabel}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right Action Button */}
                      <div className="shrink-0 flex items-center md:self-center pl-2 md:pl-0">
                        <Link
                          href={`/news/${notice.slug}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-950 text-white text-xs font-semibold hover:bg-blue-900 transition shadow-xs group"
                        >
                          Read Notice
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pt-6 flex items-center justify-between border-t border-slate-200 text-xs">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded border border-slate-300 bg-white font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>

                  <span className="text-slate-500">
                    Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                  </span>

                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded border border-slate-300 bg-white font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-12">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Passport Automation System (PAS) • Academic Software Architecture & Workflow Simulation
          </p>
          <div className="flex items-center gap-4 text-slate-600">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/news" className="hover:underline font-semibold text-blue-900">News Portal</Link>
            <Link href="/fee-calculator" className="hover:underline">Fees</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
