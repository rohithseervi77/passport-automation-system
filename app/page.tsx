import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navigation Bar */}
      <nav className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-50 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold shadow-lg shadow-blue-600/30">
              PAS
            </div>

            <div>
              <h1 className="font-bold text-base leading-tight">Passport Automation System</h1>
              <p className="text-xs text-slate-400">
                Government Digitized Processing Portal
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden gap-8 md:flex">
            <Link href="#home" className="text-sm text-slate-300 hover:text-white">
              Home
            </Link>

            <Link href="/track" className="text-sm text-blue-400 font-medium hover:text-blue-300">
              🔍 Track Status
            </Link>

            <Link
              href="#features"
              className="text-sm text-slate-300 hover:text-white"
            >
              Features
            </Link>

            <Link
              href="#roles"
              className="text-sm text-slate-300 hover:text-white"
            >
              Roles
            </Link>

            <Link
              href="#about"
              className="text-sm text-slate-300 hover:text-white"
            >
              About
            </Link>
          </div>

          {/* Authentication Buttons */}
          <div className="flex gap-3">
            <Link
              href="/track"
              className="hidden sm:inline-block rounded-lg border border-blue-500/30 bg-blue-500/10 px-3.5 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-500/20"
            >
              Track Application
            </Link>

            <Link
              href="/login"
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium hover:bg-slate-800"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold hover:bg-blue-700 shadow-md shadow-blue-600/20"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs text-blue-300 font-medium">
            <span>🇮🇳</span> Centralized Passport Seva Automation Platform
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold leading-tight tracking-tight">
            Passport processing,
            <span className="text-blue-500"> digitized & simplified.</span>
          </h2>

          <p className="mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-slate-400">
            Passport Automation System (PAS) digitizes the complete passport issuance lifecycle: online applicant registration, document verification, biometric appointment booking, statutory fee processing, police background enquiry, booklet printing, and Speed Post tracking.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-xl shadow-blue-600/30"
            >
              Start New Application →
            </Link>

            <Link
              href="/track"
              className="rounded-xl border border-blue-500/40 bg-blue-950/40 px-6 py-3.5 text-sm font-semibold text-blue-300 hover:bg-blue-900/50 transition"
            >
              🔍 Track Application Status
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-slate-800 px-6 py-3.5 text-sm font-semibold text-slate-300 hover:bg-slate-900 transition"
            >
              Portal Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="border-y border-slate-800 bg-slate-900/40"
      >
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              End-to-End Digital Workflow
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Complete OOAD Architectural Modules
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              All 8 core modules from the OOAD blueprint integrated into a unified full-stack system.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
              <div className="mb-4 text-3xl">📝</div>
              <h3 className="text-lg font-semibold">1. Online Application Form</h3>
              <p className="mt-2 text-xs leading-6 text-slate-400">
                Fresh & renewal passport applications with booklet choices (36/60 pages, Tatkaal) and draft auto-saving.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
              <div className="mb-4 text-3xl">📄</div>
              <h3 className="text-lg font-semibold">2. Document Repository</h3>
              <p className="mt-2 text-xs leading-6 text-slate-400">
                Upload Identity, Address, and DOB proof documents with authenticity review by Passport Officers.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
              <div className="mb-4 text-3xl">📅</div>
              <h3 className="text-lg font-semibold">3. Appointment Scheduler</h3>
              <p className="mt-2 text-xs leading-6 text-slate-400">
                Book physical biometric slots at Regional Passport Seva Kendra (PSK) with printable appointment acknowledgment slips.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
              <div className="mb-4 text-3xl">💳</div>
              <h3 className="text-lg font-semibold">4. Payment Gateway</h3>
              <p className="mt-2 text-xs leading-6 text-slate-400">
                Online fee processing (Card, UPI, NetBanking) with instant transaction ID and printable GST receipts.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
              <div className="mb-4 text-3xl">👮</div>
              <h3 className="text-lg font-semibold">5. Police Verification Enquiry</h3>
              <p className="mt-2 text-xs leading-6 text-slate-400">
                Police personnel console for conducting residential checks, criminal records check, and issuing clearance certificates.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
              <div className="mb-4 text-3xl">📦</div>
              <h3 className="text-lg font-semibold">6. Passport Issuance & Dispatch</h3>
              <p className="mt-2 text-xs leading-6 text-slate-400">
                Quality control, booklet printing, unique passport number assignment, and Speed Post consignment tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            System Actors
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Role-Based Access Control
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Applicant */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-7">
            <div className="text-4xl">👤</div>
            <h3 className="mt-4 text-lg font-bold">Applicant Persona</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Submit application, upload verification docs, schedule PSK appointments, pay fees, and track live status.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block rounded-lg bg-blue-600/20 border border-blue-500/30 px-4 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-600/30"
            >
              Applicant Login →
            </Link>
          </div>

          {/* Passport Officer */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-7">
            <div className="text-4xl">🧑‍💼</div>
            <h3 className="mt-4 text-lg font-bold">Passport Officer Persona</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Document verification, biometric validation, forward to police, approve/reject, generate passport, and dispatch.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block rounded-lg bg-amber-600/20 border border-amber-500/30 px-4 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-600/30"
            >
              Officer Login →
            </Link>
          </div>

          {/* Police */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-7">
            <div className="text-4xl">👮</div>
            <h3 className="mt-4 text-lg font-bold">Police Authority Persona</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Inspect residential address, perform criminal background and court record checks, and submit clearance reports.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block rounded-lg bg-emerald-600/20 border border-emerald-500/30 px-4 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-600/30"
            >
              Police Login →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-sm">Passport Automation System (PAS)</p>
            <p className="text-xs text-slate-500">
              Secure • Standardized • Deployed OOAD Architecture
            </p>
          </div>

          <div className="flex gap-6 text-xs text-slate-400">
            <Link href="/track" className="hover:text-white">Public Tracker</Link>
            <Link href="/login" className="hover:text-white">Sign In</Link>
            <Link href="/register" className="hover:text-white">Register</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
