import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold shadow-lg shadow-blue-600/30">
              PAS
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base leading-tight block">Passport Automation System</span>
              <p className="text-[11px] text-slate-400">Government of India • Ministry of External Affairs</p>
            </div>
          </Link>

          <Link
            href="/track"
            className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 transition"
          >
            🔍 Track Application
          </Link>
        </div>
      </header>

      {/* 404 Hero Body */}
      <section className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-xl">
            <span className="text-4xl">🏛️</span>
          </div>

          <div className="space-y-2">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-blue-400">
              HTTP Error 404
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Page or Record Not Found
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
              The government resource, application record, or portal page you are attempting to access does not exist or may have been relocated.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 text-center"
            >
              ← Return to Home
            </Link>
            <Link
              href="/track"
              className="w-full sm:w-auto rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition text-center"
            >
              Track Application Status
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto rounded-xl border border-slate-800 px-6 py-3 text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition text-center"
            >
              Sign In
            </Link>
          </div>

          {/* Quick Help Box */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 text-xs text-slate-400 text-left">
            <p className="font-semibold text-slate-300 mb-1">Need official assistance?</p>
            <p>Call the 24x7 Citizen Helpline at <span className="text-blue-400 font-mono font-bold">1800-258-1800</span> or email <span className="text-slate-300 font-mono">support@passportindia.gov.in</span>.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Passport Automation System. All rights reserved.
      </footer>
    </main>
  );
}
