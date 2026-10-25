"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  FileCheck2,
  Lock,
  History,
  Activity,
  BarChart3,
  HelpCircle,
  Bell,
  Cpu,
  Settings,
  UserPlus,
  KeyRound,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

interface AdminShellProps {
  children: React.ReactNode;
  adminCode?: string;
  adminUsername?: string;
  pageTitle?: string;
  pageSubtitle?: string;
}

export default function AdminShell({
  children,
  adminCode = "ADM-HQ-001",
  adminUsername = "Administrator",
  pageTitle,
  pageSubtitle,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
    } catch {
      router.push("/admin/login");
    }
  }

  const navSections = [
    {
      title: "OVERVIEW",
      items: [
        { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      ],
    },
    {
      title: "USER ACCESS",
      items: [
        { label: "All Users", href: "/admin/users", icon: Users },
        { label: "Role Assignments", href: "/admin/roles", icon: KeyRound },
      ],
    },
    {
      title: "WORKFLOW",
      items: [
        { label: "Applications", href: "/admin/applications", icon: FileText },
        { label: "Document Registry", href: "/admin/documents", icon: FileCheck2 },
      ],
    },
    {
      title: "SECURITY & LOGS",
      items: [
        { label: "Security Center", href: "/admin/security", icon: Lock },
        { label: "Login History", href: "/admin/security/login-history", icon: History },
        { label: "Active Sessions", href: "/admin/security/sessions", icon: Activity },
        { label: "Audit Logs", href: "/admin/audit-logs", icon: Shield },
      ],
    },
    {
      title: "OPERATIONS",
      items: [
        { label: "Grievances", href: "/admin/grievances", icon: HelpCircle },
        { label: "Notifications", href: "/admin/notifications", icon: Bell },
        { label: "System Health", href: "/admin/system", icon: Cpu },
      ],
    },
    {
      title: "ADMINISTRATION",
      items: [
        { label: "Administrators", href: "/admin/administrators", icon: ShieldCheck },
        { label: "Invitations", href: "/admin/invitations", icon: UserPlus },
        { label: "Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Banner: Academic Notice */}
      <div className="bg-slate-950 border-b border-slate-800 text-[11px] px-4 py-1 text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
            <AlertTriangle className="w-3 h-3" />
            Administrative Control Center
          </span>
          <span className="hidden sm:inline text-slate-400">
            Passport Automation System — Academic Enterprise Simulation
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/track"
            target="_blank"
            className="text-slate-400 hover:text-white flex items-center gap-1 transition"
          >
            <span>Public Tracker</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <span className="text-slate-700">|</span>
          <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SECURE RESTRICTED
          </span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="w-64 bg-slate-950 border-r border-slate-800 hidden lg:flex flex-col justify-between shrink-0">
          <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
            {/* Logo */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="h-10 w-10 rounded-lg bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                PAS
              </div>
              <div>
                <h2 className="font-bold text-sm tracking-tight text-white leading-tight">
                  PAS Control Center
                </h2>
                <p className="text-[11px] text-slate-400 font-mono">Central HQ Console</p>
              </div>
            </div>

            {/* Navigation Sections */}
            <div className="space-y-4">
              {navSections.map((section) => (
                <div key={section.title}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300 px-2 mb-1.5">
                    {section.title}
                  </p>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                            isActive
                              ? "bg-blue-600 text-white font-semibold shadow-xs"
                              : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Profile Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <div className="h-8 w-8 rounded-full bg-blue-950 border border-blue-600 flex items-center justify-center text-xs font-bold text-blue-300 shrink-0">
                AD
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{adminUsername}</p>
                <p className="text-[10px] text-blue-400 font-mono truncate">{adminCode}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title="Sign out of Admin Console"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar Modal */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 bg-slate-950 border-r border-slate-800 flex flex-col justify-between z-10 p-4 overflow-y-auto">
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      PAS
                    </div>
                    <span className="font-bold text-sm text-white">Admin Console</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {navSections.map((section) => (
                    <div key={section.title}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300 px-2 mb-1.5">
                        {section.title}
                      </p>
                      <div className="space-y-0.5">
                        {section.items.map((item) => {
                          const isActive =
                            pathname === item.href ||
                            (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                                isActive
                                  ? "bg-blue-600 text-white font-semibold"
                                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <span>{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">{adminUsername}</p>
                  <p className="text-[10px] text-blue-400 font-mono">{adminCode}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-900">
          {/* Top Navbar */}
          <header className="h-14 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-sm font-bold text-white tracking-tight">
                  {pageTitle || "Administrative Control Center"}
                </h1>
                {pageSubtitle && (
                  <p className="text-[11px] text-slate-400 hidden sm:block">{pageSubtitle}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400 hidden md:inline">
                Node: {adminCode}
              </span>
              <div className="h-4 w-px bg-slate-800 hidden md:block" />
              <Link
                href="/admin/invitations"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite Admin</span>
              </Link>
            </div>
          </header>

          {/* Page Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
