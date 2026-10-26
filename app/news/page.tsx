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
  FileCheck2,
  ArrowUpDown
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
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedPriority, setSelectedPriority] = useState("ALL");
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const [selectedSort, setSelectedSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (selectedYear !== "ALL") params.set("year", selectedYear);
      if (selectedCategory !== "ALL") params.set("category", selectedCategory);
      if (selectedPriority !== "ALL") params.set("priority", selectedPriority);
      if (selectedRegion !== "ALL") params.set("region", selectedRegion);
      params.set("sort", selectedSort);
      params.set("page", page.toString());
      params.set("limit", "10");

      const res = await fetch(`/api/news?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load notices from database");
      const data = await res.json();

      setNotices(data.notices || []);
      setCategories(data.categories || []);
      setRegions(data.regions || []);
      if (data.years && Array.isArray(data.years)) {
        setAvailableYears(data.years);
      }
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err: any) {
      console.error(err);
      setError("Unable to connect to public announcement database. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [search, selectedYear, selectedCategory, selectedPriority, selectedRegion, selectedSort, page]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  function handleResetFilters() {
    setSearch("");
    setSelectedYear("ALL");
    setSelectedCategory("ALL");
    setSelectedPriority("ALL");
    setSelectedRegion("ALL");
    setSelectedSort("newest");
    setPage(1);
  }

  // Pinned or Critical notices for top alert area
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
                  circulars, fee revisions, and service advisories queried directly from the departmental database.
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

        {/* Prominently Displayed Important Notice Banner */}
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
          {/* Dynamic Year Filter Pills (Derived 100% from database) */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 mb-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-500 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 mr-1">
                <Calendar className="w-3.5 h-3.5 text-blue-900" />
                <span>Publication Year:</span>
              </span>
              <button
                onClick={() => {
                  setSelectedYear("ALL");
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                  selectedYear === "ALL"
                    ? "bg-blue-950 text-white shadow-xs font-bold"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All Years
              </button>
              {availableYears.map((yr) => (
                <button
                  key={yr}
                  onClick={() => {
                    setSelectedYear(yr.toString());
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                    selectedYear === yr.toString()
                      ? "bg-blue-950 text-white shadow-xs font-bold"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>

            {/* Sort Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px] font-medium">Sort Order:</span>
              <select
                value={selectedSort}
                onChange={(e) => {
                  setSelectedSort(e.target.value as "newest" | "oldest");
                  setPage(1);
                }}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-semibold focus:outline-hidden"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Search & Multi-criteria Filter Toolbar */}
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
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-900"
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-900"
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-900"
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
                <span>
                  Showing <strong>{notices.length}</strong> of <strong>{total}</strong> published notices
                  {selectedYear !== "ALL" && ` for year ${selectedYear}`}
                </span>
                {(search || selectedYear !== "ALL" || selectedCategory !== "ALL" || selectedPriority !== "ALL" || selectedRegion !== "ALL") && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs text-blue-900 font-semibold hover:underline flex items-center gap-1"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              <div className="text-[11px] text-slate-400">
                Sorted by: Pinned First • {selectedSort === "newest" ? "Newest Published" : "Oldest Published"}
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
                No published notices in the database matched the selected year ({selectedYear}), filters, or search terms.
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

                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 font-semibold border border-blue-200/60">
                            {notice.category}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                              isCritical
                                ? "bg-rose-100 text-rose-800"
                                : isImportant
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {notice.priority}
                          </span>

                          {notice.region && (
                            <span className="inline-flex items-center gap-1 text-slate-500">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{notice.region}</span>
                            </span>
                          )}

                          <span className="text-slate-400">•</span>

                          <span className="text-slate-500 font-mono text-[11px]">
                            {notice.noticeId}
                          </span>
                        </div>

                        {/* Title */}
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 hover:text-blue-950 transition">
                          <Link href={`/news/${notice.slug}`} className="hover:underline">
                            {notice.title}
                          </Link>
                        </h2>

                        {/* Summary */}
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {notice.summary}
                        </p>

                        {/* Footer Info */}
                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              Published:{" "}
                              <strong>
                                {notice.publishedAt
                                  ? new Date(notice.publishedAt).toLocaleDateString("en-IN", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "N/A"}
                              </strong>
                            </span>
                          </span>

                          {notice.affectedCentre && (
                            <span className="inline-flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>Centres: {notice.affectedCentre}</span>
                            </span>
                          )}

                          {notice.sourceLabel && (
                            <span className="text-slate-400 italic">
                              Source: {notice.sourceLabel}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Action */}
                      <div className="pl-2 md:pl-0 shrink-0 self-end md:self-center">
                        <Link
                          href={`/news/${notice.slug}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-blue-950 hover:text-white text-xs font-semibold text-slate-800 transition shadow-2xs"
                        >
                          <span>Full Notice</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4 text-xs">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold disabled:opacity-40 hover:bg-slate-100 transition"
              >
                ← Previous Page
              </button>

              <span className="text-slate-600 font-medium">
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold disabled:opacity-40 hover:bg-slate-100 transition"
              >
                Next Page →
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
