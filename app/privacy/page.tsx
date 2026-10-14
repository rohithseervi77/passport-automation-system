import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Official Privacy Policy and Citizen Data Protection Charter for the Passport Automation System under the DPDP Act, 2023.",
};

export default function PrivacyPolicyPage() {
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
            <span>🛡️</span> Data Protection & Privacy Charter
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="mt-2 text-sm text-slate-400">
            Last Updated: October 2026 • Compliant with The Digital Personal Data Protection (DPDP) Act, 2023 & IT Act, 2000
          </p>
        </div>
      </div>

      {/* Policy Content */}
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-10 text-slate-300 text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="text-blue-400">1.</span> Introduction & Scope
          </h2>
          <p>
            The Passport Automation System (PAS), administered under the aegis of the Ministry of External Affairs (MEA), Government of India, is committed to safeguarding the privacy and security of citizen personal data collected during the passport issuance and renewal lifecycle.
          </p>
          <p>
            This Privacy Policy describes how we collect, process, store, and protect your information when you register, apply, upload supporting proofs, schedule PSK appointments, pay statutory fees, and track your application.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="text-blue-400">2.</span> Information We Collect
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 pt-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <h3 className="font-semibold text-white text-xs uppercase tracking-wider mb-2 text-blue-400">A. Personal Particulars</h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-400">
                <li>Full Legal Name & Date of Birth (DOB)</li>
                <li>Residential Address & Contact Information</li>
                <li>Parents' & Legal Guardian Particulars</li>
                <li>Aadhaar / Voter ID / PAN Reference Numbers</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <h3 className="font-semibold text-white text-xs uppercase tracking-wider mb-2 text-emerald-400">B. Verification Proofs</h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-400">
                <li>Address Proof Documents (Utility Bill, Rental Agreement)</li>
                <li>Date of Birth Proof (Birth Certificate, Matriculation)</li>
                <li>Identity Proof & Photograph</li>
                <li>Police Background Enquiry & Clearance Reports</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="text-blue-400">3.</span> Purpose of Data Processing
          </h2>
          <p>
            Your information is processed strictly for sovereign and statutory purposes prescribed under The Passports Act, 1967, including:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-400">
            <li>Verifying applicant citizenship, identity, and residential jurisdiction.</li>
            <li>Enabling authorized District Police Authorities to conduct physical and criminal records verification.</li>
            <li>Scheduling biometric capture appointments at Regional Passport Seva Kendras (PSK).</li>
            <li>Processing government non-refundable application and Tatkaal fees via certified payment gateways.</li>
            <li>Printing serialized booklet chips and dispatching documents via India Post Speed Post.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="text-blue-400">4.</span> Access Control & Security Architecture
          </h2>
          <p>
            We implement strict Role-Based Access Control (RBAC). Only authenticated government actors (Passport Officers, Police Enquiry Officers, and System Administrators) have access to records strictly within their jurisdiction. All passwords are encrypted with bcrypt, all web sessions use HTTPS cryptographic transport with HTTP-only cookies, and audit logs track all sensitive administrative inquiries.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="text-blue-400">5.</span> Citizen Grievances & Contact
          </h2>
          <p>
            For privacy inquiries, grievance redressals, or data access queries under the DPDP Act, contact the Central Data Protection Officer:
          </p>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs space-y-1">
            <p className="text-white font-semibold">Grievance Redressal Cell - Passport Seva</p>
            <p className="text-slate-400">Ministry of External Affairs, Patiala House Annexe, Tilak Marg, New Delhi - 110001</p>
            <p className="text-blue-400 font-mono">grievance@passportindia.gov.in • Toll Free: 1800-258-1800</p>
          </div>
        </section>
      </div>
    </main>
  );
}
