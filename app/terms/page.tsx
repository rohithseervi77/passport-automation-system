import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Statutory terms, conditions, and citizen obligations governing the Passport Automation System under The Passports Act, 1967.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white pb-20">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-600/30">
              PAS
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base leading-tight block">Passport Automation System</span>
              <p className="text-[11px] text-slate-400">Ministry of External Affairs • Government of India</p>
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            ← Back to Portal
          </Link>
        </div>
      </header>

      {/* Hero Title */}
      <div className="border-b border-slate-800/80 bg-slate-900/40">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-300 font-medium mb-3">
            <span>⚖️</span> Statutory Legal Framework
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Terms of Service & Usage</h1>
          <p className="mt-2 text-sm text-slate-400">
            Regulated under The Passports Act, 1967 (No. 15 of 1967) and The Passport Rules, 1980
          </p>
        </div>
      </div>

      {/* Terms Content */}
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-10 text-slate-300 text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="text-blue-400">1.</span> Acceptance of Statutory Terms
          </h2>
          <p>
            By accessing or using the Passport Automation System (PAS), you agree to comply with and be bound by the statutory terms set forth herein, along with all applicable rules, regulations, and notifications issued by the Ministry of External Affairs, Government of India.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="text-blue-400">2.</span> Truthfulness & Penal Liability
          </h2>
          <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 space-y-2">
            <p className="font-semibold text-red-300 text-xs uppercase tracking-wider">
              ⚠️ Section 12(1)(b) Warning - The Passports Act, 1967
            </p>
            <p className="text-xs text-red-200">
              Whoever knowingly furnishes false information or suppresses any material information with a view to obtaining a passport or travel document shall be punishable with imprisonment for a term which may extend to two years or with fine which may extend to five thousand rupees or with both.
            </p>
          </div>
          <p className="pt-1">
            Applicants must certify that all statements made in their application form, documents uploaded, and declarations provided to Passport Officers and Police Enquiry Officers are true, complete, and accurate.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="text-blue-400">3.</span> Fees & Cancellation Policy
          </h2>
          <p>
            All application fees (including Fresh, Re-issue, Tatkaal, and Booklet size surcharges) paid through the online government payment gateway are statutory processing charges.
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 pl-2">
            <li>Application fees are strictly non-refundable once an appointment has been scheduled or processing has commenced.</li>
            <li>In the event of an application rejection due to adverse police reports, fraudulent documentation, or citizen non-appearance, fees will not be returned.</li>
            <li>Appointment rescheduling is permitted up to two (2) times within one calendar year of fee payment without additional charges.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="text-blue-400">4.</span> Verification & Police Discretion
          </h2>
          <p>
            Submission of an application and payment of statutory fees does not confer an automatic right to the issuance of a passport. Issuance is subject to satisfactory physical verification of documents by Passport Officers and clearance certificates issued by the designated local Police Station jurisdiction.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="text-blue-400">5.</span> System Availability & Governance
          </h2>
          <p>
            While PAS endeavors to provide uninterrupted 24x7 automated portal availability, the portal may undergo scheduled maintenance or security enhancements. The Ministry reserves the right to suspend or revoke access to any account suspected of malicious activity or unauthorized scraping.
          </p>
        </section>
      </div>
    </main>
  );
}
