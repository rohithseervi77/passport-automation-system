"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StickyMobileCTA() {
  const pathname = usePathname();

  // Hide on authentication and internal dashboards to avoid blocking dashboard actions
  const isExcluded =
    pathname.startsWith("/applicant/") ||
    pathname.startsWith("/officer/") ||
    pathname.startsWith("/police/") ||
    pathname.startsWith("/admin/") ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  if (isExcluded) return null;

  return (
    <aside 
      aria-label="Quick Actions"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-slate-800/90 bg-slate-950/90 backdrop-blur-xl px-4 py-2.5 shadow-2xl transition-all"
    >
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <Link
          href="/register"
          className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-center text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-98 transition flex items-center justify-center gap-1.5"
        >
          <span>📝</span>
          <span>Apply Online</span>
        </Link>

        <Link
          href="/track"
          className="flex-1 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-center text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 active:scale-98 transition flex items-center justify-center gap-1.5"
        >
          <span>🔍</span>
          <span>Track Status</span>
        </Link>
      </div>
    </aside>
  );
}
