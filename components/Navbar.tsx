"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import { useState, useEffect, useRef } from "react";
import { Bell, Menu, X, CheckCircle, AlertCircle, Info, Shield, User, FileText, Calendar, CreditCard, Search } from "lucide-react";

interface NavbarProps {
  role: "APPLICANT" | "OFFICER" | "POLICE" | "ADMIN";
  userName: string;
  badgeLabel?: string;
}

export default function Navbar({ role, userName, badgeLabel }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  const applicantLinks = [
    { href: "/applicant/dashboard", label: "Dashboard", icon: User },
    { href: "/applicant/application", label: "Apply / Edit", icon: FileText },
    { href: "/applicant/documents", label: "Documents", icon: FileText },
    { href: "/applicant/payment", label: "Payment", icon: CreditCard },
    { href: "/applicant/appointment", label: "Appointment", icon: Calendar },
    { href: "/applicant/status", label: "Status Track", icon: Search },
  ];

  const officerLinks = [
    { href: "/officer/dashboard", label: "Officer Console", icon: Shield },
    { href: "/track", label: "Public Tracker", icon: Search },
  ];

  const policeLinks = [
    { href: "/police/dashboard", label: "Police Verification Queue", icon: Shield },
    { href: "/track", label: "Public Tracker", icon: Search },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: "System Console", icon: Shield },
    { href: "/officer/dashboard", label: "Officer Console", icon: Shield },
    { href: "/police/dashboard", label: "Police Console", icon: Shield },
  ];

  const navLinks = 
    role === "APPLICANT" ? applicantLinks :
    role === "OFFICER" ? officerLinks :
    role === "POLICE" ? policeLinks : adminLinks;

  const roleStyles = {
    APPLICANT: {
      badge: "bg-blue-100 text-blue-800 border-blue-200",
      roleTitle: "Applicant Portal",
    },
    OFFICER: {
      badge: "bg-amber-100 text-amber-800 border-amber-200",
      roleTitle: "Passport Officer Console",
    },
    POLICE: {
      badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
      roleTitle: "Police Enquiry Authority",
    },
    ADMIN: {
      badge: "bg-purple-100 text-purple-800 border-purple-200",
      roleTitle: "System Administration",
    },
  }[role];

  // Fetch notifications
  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    }
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle click outside notifications dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function markAllAsRead() {
    try {
      await fetch("/api/notifications", { method: "POST", body: JSON.stringify({}) });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Mark read error:", err);
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm print:hidden">
      {/* Top Tricolor Ribbon */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600 border-b border-slate-200" />

      {/* Institutional Top Bar */}
      <div className="bg-slate-900 text-white px-4 sm:px-6 py-1.5 text-xs flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">Passport Automation System</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300 hidden md:inline">Academic Demonstration Portal (Not Official Gov Service)</span>
        </div>
        <div className="flex items-center gap-4 text-slate-300">
          <Link href="/track" className="hover:text-white transition flex items-center gap-1">
            <Search className="w-3 h-3" />
            <span>Public Tracking</span>
          </Link>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400 font-mono font-medium">{badgeLabel || roleStyles.roleTitle}</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-900 font-bold text-white text-base shadow">
                PAS
              </div>
              <div>
                <span className="block font-bold text-slate-900 text-sm sm:text-base leading-tight">
                  Passport Automation System
                </span>
                <span className="block text-[11px] text-slate-500 font-medium">
                  {roleStyles.roleTitle}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition ${
                    isActive
                      ? "bg-blue-50 text-blue-900 border border-blue-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Notification, User Info, Logout */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="Notifications"
                className="relative p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-white border border-slate-200 shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                      Notifications ({unreadCount} new)
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] text-blue-700 hover:underline font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 text-xs transition ${
                            !n.isRead ? "bg-blue-50/60" : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {n.type === "SUCCESS" ? (
                              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            ) : n.type === "ALERT" ? (
                              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            ) : (
                              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900 leading-snug">{n.title}</p>
                              <p className="text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Tag */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="text-right">
                <span className="block font-semibold text-xs text-slate-900">{userName}</span>
                <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-medium border ${roleStyles.badge}`}>
                  {role}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <LogoutButton />

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 py-3 space-y-1">
            <div className="px-3 py-1.5 mb-2 bg-slate-50 rounded text-xs">
              <span className="text-slate-500">Signed in as: </span>
              <span className="font-semibold text-slate-900">{userName}</span>
              <span className={`ml-2 px-1.5 py-0.5 text-[10px] rounded border ${roleStyles.badge}`}>
                {role}
              </span>
            </div>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-semibold transition ${
                    isActive
                      ? "bg-blue-50 text-blue-900 border border-blue-200"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
