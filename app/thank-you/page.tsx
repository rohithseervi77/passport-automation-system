import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Application Acknowledgment & Thank You",
  description: "Official acknowledgment receipt and next stages roadmap for your submitted passport seva request.",
};

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col justify-between pb-16">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-600/30">
              PAS
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base leading-tight block">Passport Automation System</span>
              <p className="text-[11px] text-slate-400">Government of India • Ministry of External Affairs</p>
            </div>
          </Link>

          <Link
            href="/applicant/dashboard"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            Go to Dashboard →
          </Link>
        </div>
      </header>

      {/* Hero Body */}
      <section className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 space-y-8 text-center">
        {/* Animated Checkmark Circle */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-500/10 border border-emerald-500/30 shadow-2xl shadow-emerald-500/20">
          <span className="text-5xl">✅</span>
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400">
            <span>🎉</span> Official Submission Recorded
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Thank You, Citizen!
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
            Your request has been securely processed into the central Passport Seva Automation database.
          </p>
        </div>

        {/* Milestone Next Steps */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 text-left shadow-2xl space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>🗺️ Next Lifecycle Milestones</span>
            <span className="text-xs font-mono text-blue-400 font-normal">Workflow Progression</span>
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
              <span className="text-2xl">📁</span>
              <h3 className="text-xs font-bold text-white">1. Document Scrutiny</h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                Passport Officers verify your submitted identity and address records for statutory compliance.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
              <span className="text-2xl">👮</span>
              <h3 className="text-xs font-bold text-white">2. Police Enquiry</h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                Your local district police station conducts address inspection and court record verification.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
              <span className="text-2xl">📦</span>
              <h3 className="text-xs font-bold text-white">3. Printing & Dispatch</h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                Security booklet is printed and dispatched to your residence via India Post Speed Post.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/track"
            className="w-full sm:w-auto rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
          >
            <span>🔍</span>
            <span>Live Status Tracker</span>
          </Link>

          <Link
            href="/applicant/dashboard"
            className="w-full sm:w-auto rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            Go to Citizen Portal →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        Passport Automation System • Government of India
      </footer>
    </main>
  );
}
