"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Bell, 
  ExternalLink, 
  FileText, 
  Download, 
  Share2, 
  Printer, 
  AlertTriangle,
  Building2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Info
} from "lucide-react";
import AcademicDisclaimer from "@/components/AcademicDisclaimer";

interface NoticeDetail {
  id: number;
  noticeId: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  priority: "NORMAL" | "IMPORTANT" | "CRITICAL";
  status: string;
  isPinned: boolean;
  publishedAt: string;
  updatedAt: string;
  effectiveDate?: string | null;
  expiryDate?: string | null;
  region?: string | null;
  affectedCentre?: string | null;
  sourceLabel?: string | null;
  sourceUrl?: string | null;
  attachmentName?: string | null;
  author?: string | null;
}

interface RelatedNotice {
  id: number;
  slug: string;
  title: string;
  category: string;
  priority: string;
  publishedAt: string;
  region?: string | null;
}

export default function NoticeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [notice, setNotice] = useState<NoticeDetail | null>(null);
  const [related, setRelated] = useState<RelatedNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadNotice() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/news/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Announcement not found or has been archived.");
          } else {
            setError("Failed to load notice content.");
          }
          return;
        }
        const data = await res.json();
        setNotice(data.notice);
        setRelated(data.relatedNotices || []);
      } catch (err) {
        console.error(err);
        setError("Network connection error. Please retry.");
      } finally {
        setLoading(false);
      }
    }
    loadNotice();
  }, [slug]);

  function handleShare() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  function handlePrint() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  const isExpired = notice?.expiryDate ? new Date(notice.expiryDate) < new Date() : false;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between">
      <div>
        {/* Tricolor Ribbon */}
        <div className="h-1.5 w-full flex">
          <div className="flex-1 bg-[#FF9933]"></div>
          <div className="flex-1 bg-white"></div>
          <div className="flex-1 bg-[#138808]"></div>
        </div>
        <AcademicDisclaimer />

        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs print:hidden">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-3.5">
            <Link href="/news" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-950 hover:underline">
              <ArrowLeft className="w-4 h-4" />
              Back to All Public Notices
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                {copied ? "Link Copied!" : "Share"}
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                Print Notice
              </button>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-8 h-8 border-3 border-blue-950 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs font-semibold text-slate-600">Loading statutory circular details...</p>
            </div>
          ) : error || !notice ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center shadow-xs">
              <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
              <h2 className="text-base font-bold text-slate-900 mb-1">{error || "Notice Not Found"}</h2>
              <p className="text-xs text-slate-500 mb-4">
                The requested notice may have been archived, expired, or the URL slug may be incorrect.
              </p>
              <Link
                href="/news"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-950 text-white text-xs font-semibold hover:bg-blue-900 transition"
              >
                ← Return to Public Notices
              </Link>
            </div>
          ) : (
            <article className="space-y-6">
              {/* Expired / Pinned Notice Banner */}
              {isExpired ? (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold uppercase tracking-wider block">Archived Notice</span>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      The instruction period for this announcement expired on{" "}
                      <strong>{new Date(notice.expiryDate!).toLocaleDateString("en-IN")}</strong>. This record is preserved for statutory archival purposes.
                    </p>
                  </div>
                </div>
              ) : notice.priority === "CRITICAL" ? (
                <div className="rounded-xl border border-rose-300 bg-rose-50 p-3.5 text-xs text-rose-900 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px] uppercase">
                    Critical Advisory
                  </span>
                  <span className="font-medium">Please review all compliance prerequisites outlined in this directive.</span>
                </div>
              ) : null}

              {/* Notice Metadata Header Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Ref: {notice.noticeId}
                  </span>
                  <span className="font-bold text-blue-950 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                    {notice.category}
                  </span>
                  <span className="text-slate-400 font-bold">•</span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Published: {new Date(notice.publishedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  {notice.title}
                </h1>

                {/* Sub-meta details: Regional Jurisdiction, Effective dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  {notice.region && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-950 shrink-0" />
                      <span>Region: <strong>{notice.region}</strong></span>
                    </div>
                  )}

                  {notice.affectedCentre && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-950 shrink-0" />
                      <span>Centre: <strong>{notice.affectedCentre}</strong></span>
                    </div>
                  )}

                  {notice.effectiveDate && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>Effective: <strong>{new Date(notice.effectiveDate).toLocaleDateString("en-IN")}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Announcement Content */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
                {/* Executive Summary Box */}
                <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-medium">
                  <div className="font-bold text-slate-900 mb-1 uppercase text-[10px] tracking-wider text-blue-950">
                    Executive Summary:
                  </div>
                  {notice.summary}
                </div>

                {/* Body Content with Paragraph Formatting */}
                <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-800 leading-relaxed space-y-4">
                  {notice.content.split("\n\n").map((para, idx) => {
                    if (para.startsWith("###")) {
                      return (
                        <h3 key={idx} className="text-sm sm:text-base font-bold text-slate-900 mt-5 mb-2">
                          {para.replace(/^###\s*/, "")}
                        </h3>
                      );
                    }
                    if (para.startsWith("-") || para.startsWith("1.") || para.startsWith("2.") || para.startsWith("3.") || para.startsWith("4.") || para.startsWith("5.") || para.startsWith("6.")) {
                      return (
                        <div key={idx} className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 my-2 whitespace-pre-line text-xs font-mono leading-relaxed">
                          {para}
                        </div>
                      );
                    }
                    return (
                      <p key={idx} className="leading-relaxed whitespace-pre-line">
                        {para}
                      </p>
                    );
                  })}
                </div>

                {/* Supporting Document / Attachment Download */}
                {notice.attachmentName && (
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-950" />
                      Official Attachment / Supporting Circular:
                    </h4>
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-blue-950 text-white">
                          <FileCheck2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{notice.attachmentName}</span>
                          <span className="text-[10px] text-slate-500">Official Gazetted Reference PDF (Educational Copy)</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => alert(`Simulated Download: ${notice.attachmentName} is archived in the academic database.`)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs text-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        Download PDF
                      </button>
                    </div>
                  </div>
                )}

                {/* External Verified Source Citation */}
                {notice.sourceUrl && (
                  <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      Issuing Directorate: <strong className="text-slate-700">{notice.sourceLabel || "Ministry of External Affairs"}</strong>
                    </div>
                    <a
                      href={notice.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-950 font-bold hover:underline"
                    >
                      Verify on Official Government Portal
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Related Announcements */}
              {related.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-blue-950" />
                    Related Circulars in &ldquo;{notice.category}&rdquo;:
                  </h3>
                  <div className="divide-y divide-slate-100">
                    {related.map((rel) => (
                      <Link
                        key={rel.id}
                        href={`/news/${rel.slug}`}
                        className="py-2.5 block hover:bg-slate-50 px-2 rounded-lg transition group"
                      >
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="font-semibold text-slate-900 group-hover:text-blue-950">
                            {rel.title}
                          </span>
                          <span className="text-[11px] text-slate-400 shrink-0">
                            {new Date(rel.publishedAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-12 print:hidden">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Passport Automation System (PAS) • Academic Software Architecture & Workflow Simulation
          </p>
          <div className="flex items-center gap-4 text-slate-600">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/news" className="hover:underline font-semibold text-blue-950">News Centre</Link>
            <Link href="/fee-calculator" className="hover:underline">Fees</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
