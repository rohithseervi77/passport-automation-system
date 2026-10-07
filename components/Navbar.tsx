"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import { useState } from "react";

interface NavbarProps {
  role: "APPLICANT" | "OFFICER" | "POLICE";
  userName: string;
  badgeLabel?: string;
}

export default function Navbar({ role, userName, badgeLabel }: NavbarProps) {
  const pathname = usePathname();
  const [showSupportModal, setShowSupportModal] = useState(false);

  const applicantLinks = [
    { href: "/applicant/dashboard", label: "Overview", icon: "📊" },
    { href: "/applicant/application", label: "Application Form", icon: "📝" },
    { href: "/applicant/documents", label: "Documents Hub", icon: "📁" },
    { href: "/applicant/appointment", label: "PSK Appointment", icon: "📅" },
    { href: "/applicant/payment", label: "Fee Payment", icon: "💳" },
    { href: "/applicant/status", label: "Live Tracker", icon: "🚀" },
  ];

  const roleStyles = {
    APPLICANT: {
      badge: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      home: "/applicant/dashboard",
      roleTitle: "Applicant Portal",
      portalCode: "CITIZEN-SEVA",
    },
    OFFICER: {
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      home: "/officer/dashboard",
      roleTitle: "Passport Officer Console",
      portalCode: "RPO-CENTRAL",
    },
    POLICE: {
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      home: "/police/dashboard",
      roleTitle: "Police Enquiry Authority",
      portalCode: "CRIME-CHECK",
    },
  }[role];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl transition-all print:hidden">
        {/* Top Ministry Ribbon */}
        <div className="bg-gradient-to-r from-blue-900/40 via-slate-900 to-amber-950/30 px-6 py-1 text-[11px] text-slate-400 border-b border-slate-900 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">🇮🇳 Ministry of External Affairs</span>
            <span className="text-slate-600">•</span>
            <span>Passport Automation System 2.0</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              All Systems Operational
            </span>
            <button
              type="button"
              onClick={() => setShowSupportModal(true)}
              className="text-blue-400 hover:text-blue-300 font-medium transition"
            >
              24/7 Citizen Helpline
            </button>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link href={roleStyles.home} className="flex items-center gap-3 group">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 font-extrabold text-white shadow-lg shadow-blue-600/30 group-hover:scale-105 transition">
                <span className="text-sm tracking-wider">PAS</span>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
              <div>
                <h1 className="font-bold text-white text-sm sm:text-base leading-tight tracking-tight">
                  Passport Seva Automation
                </h1>
                <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                  <span>{roleStyles.roleTitle}</span>
                  <span className="text-[9px] bg-slate-800 text-slate-400 rounded px-1 font-mono">
                    {roleStyles.portalCode}
                  </span>
                </p>
              </div>
            </Link>

            {/* Navigation links for applicant */}
            {role === "APPLICANT" && (
              <nav className="hidden xl:flex items-center gap-1 ml-2 border-l border-slate-800/80 pl-4">
                {applicantLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        isActive
                          ? "bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm shadow-blue-500/10"
                          : "text-slate-400 hover:text-white hover:bg-slate-900/80"
                      }`}
                    >
                      <span className="text-xs">{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/track"
              className="hidden md:flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition"
            >
              <span>🔍</span>
              <span>Quick Tracker</span>
            </Link>

            <div className="text-right hidden sm:block border-l border-slate-800 pl-3">
              <p className="text-xs font-semibold text-white tracking-tight leading-snug">{userName}</p>
              <p className="text-[10px] font-mono text-slate-400">{badgeLabel || role}</p>
            </div>

            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${roleStyles.badge}`}
            >
              {role}
            </span>

            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Support / Help Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🏛️</span>
                <div>
                  <h3 className="text-base font-bold text-white">Passport Seva 24/7 Citizen Support</h3>
                  <p className="text-xs text-slate-400">Official Assistance & Escalation Desk</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-3 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 flex items-center gap-3">
                <span className="text-2xl text-blue-400">📞</span>
                <div>
                  <p className="font-semibold text-white">National Toll-Free Helpline</p>
                  <p className="text-blue-400 font-mono text-sm font-bold">1800-258-1800</p>
                  <p className="text-[10px] text-slate-500">Available 24x7 in 14 regional languages</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 flex items-center gap-3">
                <span className="text-2xl text-amber-400">✉️</span>
                <div>
                  <p className="font-semibold text-white">Official Support Email</p>
                  <p className="text-amber-300 font-mono text-xs">support@passportindia.gov.in</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 flex items-center gap-3">
                <span className="text-2xl text-emerald-400">🏢</span>
                <div>
                  <p className="font-semibold text-white">Central Regional Passport Office</p>
                  <p className="text-slate-300">Passport Bhawan, Central Complex, New Delhi - 110001</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Close Support
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
