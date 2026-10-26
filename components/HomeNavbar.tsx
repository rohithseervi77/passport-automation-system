"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Shield, 
  Menu, 
  X, 
  ArrowRight 
} from "lucide-react";

export default function HomeNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/news", label: "News & Notices", isBold: true },
    { href: "/services", label: "Services" },
    { href: "/document-advisor", label: "Doc Advisor" },
    { href: "/fee-calculator", label: "Fee Calculator" },
    { href: "/locate-centre", label: "Locate Centre" },
    { href: "/track", label: "Track Application", isAccent: true },
    { href: "/grievance", label: "Grievance" },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3">
        {/* Left: Logo & Portal Identity */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-900 font-bold text-white text-base shadow-sm group-hover:bg-blue-800 transition">
            PAS
          </div>
          <div className="leading-tight">
            <span className="block font-bold text-sm sm:text-base text-slate-900 tracking-tight whitespace-nowrap">
              Passport Automation System
            </span>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium whitespace-nowrap">
              Digitized Citizen Services Portal
            </p>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links (Full on xl: 1280px+) */}
        <nav className="hidden xl:flex items-center gap-1 2xl:gap-2 text-xs font-semibold text-slate-700">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap shrink-0 px-2.5 py-1.5 rounded-md transition ${
                  isActive
                    ? "text-blue-900 bg-blue-50 font-bold"
                    : link.isBold
                    ? "text-blue-950 font-bold hover:text-blue-700 hover:bg-slate-100"
                    : link.isAccent
                    ? "text-amber-800 hover:text-amber-900 font-semibold hover:bg-amber-50"
                    : "text-slate-700 hover:text-blue-900 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Medium Desktop / Laptops (lg: 1024px - 1279px) with compact labels to prevent multi-line wrapping */}
        <nav className="hidden lg:flex xl:hidden items-center gap-1 text-xs font-semibold text-slate-700">
          <Link href="/" className="whitespace-nowrap shrink-0 px-2 py-1.5 rounded hover:bg-slate-100 text-blue-900">
            Home
          </Link>
          <Link href="/news" className="whitespace-nowrap shrink-0 px-2 py-1.5 rounded hover:bg-slate-100 font-bold text-blue-950">
            News
          </Link>
          <Link href="/services" className="whitespace-nowrap shrink-0 px-2 py-1.5 rounded hover:bg-slate-100">
            Services
          </Link>
          <Link href="/document-advisor" className="whitespace-nowrap shrink-0 px-2 py-1.5 rounded hover:bg-slate-100">
            Doc Advisor
          </Link>
          <Link href="/fee-calculator" className="whitespace-nowrap shrink-0 px-2 py-1.5 rounded hover:bg-slate-100">
            Fees
          </Link>
          <Link href="/locate-centre" className="whitespace-nowrap shrink-0 px-2 py-1.5 rounded hover:bg-slate-100">
            Centres
          </Link>
          <Link href="/track" className="whitespace-nowrap shrink-0 px-2 py-1.5 rounded hover:bg-amber-50 text-amber-800 font-medium">
            Track
          </Link>
          <Link href="/grievance" className="whitespace-nowrap shrink-0 px-2 py-1.5 rounded hover:bg-slate-100">
            Grievance
          </Link>
        </nav>

        {/* Right: Auth Action Buttons & Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <Link
            href="/admin/login"
            className="whitespace-nowrap shrink-0 rounded-lg border border-purple-300 bg-purple-50/90 hover:bg-purple-100 hover:border-purple-400 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-purple-900 transition shadow-2xs flex items-center gap-1.5"
            title="Administrator Management Portal"
          >
            <Shield className="w-3.5 h-3.5 text-purple-700 shrink-0" />
            <span className="hidden sm:inline">Admin Portal</span>
            <span className="sm:hidden">Admin</span>
          </Link>
          <Link
            href="/login"
            className="whitespace-nowrap shrink-0 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 hover:border-slate-400 px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition shadow-2xs"
          >
            Portal Login
          </Link>
          <Link
            href="/register"
            className="whitespace-nowrap shrink-0 rounded-lg bg-blue-900 hover:bg-blue-800 px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white transition shadow-2xs"
          >
            <span className="hidden xl:inline">New Citizen Register</span>
            <span className="xl:hidden">Register</span>
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 focus:outline-none ml-1"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 shadow-lg space-y-1 animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-blue-900 transition"
            >
              <span className={link.isBold ? "font-bold text-blue-950" : link.isAccent ? "font-semibold text-amber-800" : ""}>
                {link.label}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg border border-purple-300 bg-purple-50 text-purple-900 text-xs font-semibold"
            >
              <Shield className="w-3.5 h-3.5 text-purple-700" />
              <span>Admin Management Portal</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
