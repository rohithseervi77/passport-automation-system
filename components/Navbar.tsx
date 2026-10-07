"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

interface NavbarProps {
  role: "APPLICANT" | "OFFICER" | "POLICE";
  userName: string;
  badgeLabel?: string;
}

export default function Navbar({ role, userName, badgeLabel }: NavbarProps) {
  const pathname = usePathname();

  const applicantLinks = [
    { href: "/applicant/dashboard", label: "Dashboard" },
    { href: "/applicant/application", label: "Application" },
    { href: "/applicant/documents", label: "Documents" },
    { href: "/applicant/appointment", label: "Appointment" },
    { href: "/applicant/payment", label: "Fee Payment" },
    { href: "/applicant/status", label: "Track Status" },
  ];

  const roleStyles = {
    APPLICANT: {
      badge: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      home: "/applicant/dashboard",
      roleTitle: "Applicant Portal",
    },
    OFFICER: {
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      home: "/officer/dashboard",
      roleTitle: "Passport Officer Portal",
    },
    POLICE: {
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      home: "/police/dashboard",
      roleTitle: "Police Enquiry Portal",
    },
  }[role];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href={roleStyles.home} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-lg shadow-blue-600/30">
              PAS
            </div>
            <div>
              <h1 className="font-bold text-white text-base leading-tight">
                Passport Automation System
              </h1>
              <p className="text-xs text-slate-400">{roleStyles.roleTitle}</p>
            </div>
          </Link>

          {/* Navigation links for applicant */}
          {role === "APPLICANT" && (
            <nav className="hidden lg:flex items-center gap-1 ml-4 border-l border-slate-800 pl-6">
              {applicantLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      isActive
                        ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                        : "text-slate-400 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-white">{userName}</p>
            <p className="text-[11px] text-slate-400">{badgeLabel || role}</p>
          </div>

          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${roleStyles.badge}`}
          >
            {role}
          </span>

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
