import Link from "next/link";
import Script from "next/script";
import AcademicDisclaimer from "@/components/AcademicDisclaimer";
import { prisma } from "@/lib/prisma";
import { 
  FileText, 
  Search, 
  Calendar, 
  Calculator, 
  Clock, 
  ShieldCheck, 
  Shield,
  CreditCard, 
  UserCheck, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle,
  Building2,
  PhoneCall,
  AlertTriangle,
  Bell
} from "lucide-react";

export default async function Home() {
  const latestNotices = await prisma.notice.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [
      { isPinned: "desc" },
      { publishedAt: "desc" },
    ],
    take: 3,
  }).catch(() => []);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Passport Automation System",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: "Academic end-to-end digital passport issuance simulation and workflow portal.",
  };

  const processSteps = [
    { step: 1, title: "Register", desc: "Create your citizen account with valid credentials." },
    { step: 2, title: "Apply", desc: "Fill applicant, family, address, and document details." },
    { step: 3, title: "Pay", desc: "Pay the prescribed application fee through simulated gateway." },
    { step: 4, title: "Schedule", desc: "Book an appointment slot at your nearest PSK / POPSK." },
    { step: 5, title: "Verify", desc: "Complete PSK document scrutiny and Police verification." },
    { step: 6, title: "Track", desc: "Track dispatch and delivery of your passport in real time." },
  ];

  const serviceCards = [
    {
      title: "Fresh Passport",
      desc: "For citizens applying for a new Indian passport for the first time with standard 10-year validity.",
      icon: FileText,
      tag: "Most Popular",
    },
    {
      title: "Passport Re-issue",
      desc: "Renew expired passports, replace damaged booklets, or apply for change of personal particulars.",
      icon: Clock,
      tag: "Renewal",
    },
    {
      title: "Tatkaal Application",
      desc: "Expedited fast-track processing for urgent travel requirements with priority PSK appointment slots.",
      icon: ShieldCheck,
      tag: "Fast Track",
    },
    {
      title: "Police Verification",
      desc: "Simulated station-level residential address enquiry, criminal record checks, and clearance reporting.",
      icon: UserCheck,
      tag: "Verification",
    },
    {
      title: "Application Tracking",
      desc: "Instant public tracking with Application Reference Number (ARN) showing complete chronological milestones.",
      icon: Search,
      tag: "Real-time",
    },
    {
      title: "Appointment Management",
      desc: "Schedule, view, or reschedule biometric and physical document appointments across demo regional centres.",
      icon: Calendar,
      tag: "Self-Service",
    },
  ];

  const faqs = [
    {
      q: "What is the standard processing fee for a Fresh Passport?",
      a: "Under the revised official schedule (Gazette G.S.R. 516(E) effective 1 July 2026), the standard statutory fee for a 36-page Fresh adult passport (Normal quota) is ₹2,500. A 60-page jumbo booklet is ₹3,500, while Tatkaal processing is ₹5,000 (inclusive of normal fee). Eligible fresh minor applications (up to 8 years) and senior citizens (60+) receive a 10% statutory concession.",
    },
    {
      q: "What documents are required for physical verification at the PSK?",
      a: "Mandatory documents include Identity Proof (Aadhaar Card, Voter ID, or PAN), Proof of Address (Utility Bill or Bank Passbook), and Proof of Date of Birth (Municipal Birth Certificate or Matriculation Marksheet).",
    },
    {
      q: "How does the Police Verification simulation work in this project?",
      a: "When an applicant completes physical document verification, the application transitions to the jurisdictional Police Authority console. Police officers can review the address, verify local records, and submit a clearance or adverse report.",
    },
    {
      q: "Can I track an application without logging into the portal?",
      a: "Yes. Public Application Tracking (/track) allows anyone to track status using an Application Reference Number (ARN) and Date of Birth without exposing sensitive personal information.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Script
        id="schema-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Academic Disclaimer & Language Selector */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600 border-b border-slate-200" />
      <AcademicDisclaimer />

      {/* Institutional Header / Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-900 font-bold text-white text-base shadow-sm">
              PAS
            </div>
            <div>
              <span className="block font-bold text-base text-slate-900 leading-tight">
                Passport Automation System
              </span>
              <p className="text-xs text-slate-500 font-medium">
                Digitized Citizen Services Portal
              </p>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-700">
            <Link href="/" className="text-blue-900 hover:text-blue-700">Home</Link>
            <Link href="/news" className="hover:text-blue-900 transition font-bold text-blue-950">News & Notices</Link>
            <Link href="/services" className="hover:text-blue-900 transition">Services</Link>
            <Link href="/document-advisor" className="hover:text-blue-900 transition">Doc Advisor</Link>
            <Link href="/fee-calculator" className="hover:text-blue-900 transition">Fee Calculator</Link>
            <Link href="/locate-centre" className="hover:text-blue-900 transition">Locate Centre</Link>
            <Link href="/track" className="hover:text-blue-900 transition font-medium text-amber-700">Track Application</Link>
            <Link href="/grievance" className="hover:text-blue-900 transition">Grievance</Link>
          </nav>

          {/* Auth Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/admin/login"
              className="rounded border border-purple-300 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-900 hover:bg-purple-100 hover:border-purple-400 transition shadow-xs flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-purple-700" />
              <span className="hidden sm:inline">Admin Portal</span>
              <span className="sm:hidden">Admin</span>
            </Link>
            <Link
              href="/login"
              className="rounded border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition shadow-xs"
            >
              Portal Login
            </Link>
            <Link
              href="/register"
              className="rounded bg-blue-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 transition shadow-xs"
            >
              New Citizen Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-950 via-slate-900 to-blue-900 text-white py-14 sm:py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-800/60 border border-blue-700 px-3 py-1 text-xs text-blue-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Simulated End-to-End Passport Seva Workflow</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Passport Services, Simplified
              </h1>
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Apply, manage appointments, complete verification and track your passport application through one secure platform.
              </p>

              {/* Primary Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded bg-amber-500 hover:bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-950 shadow transition"
                >
                  <span>Apply for Passport</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/track"
                  className="inline-flex items-center gap-2 rounded bg-white hover:bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-900 shadow transition"
                >
                  <Search className="w-4 h-4 text-blue-900" />
                  <span>Track Application</span>
                </Link>
              </div>

              {/* Secondary Navigation Links */}
              <div className="pt-4 flex flex-wrap items-center gap-5 text-xs text-slate-300 font-medium border-t border-blue-800/80">
                <a href="#appointment-info" className="hover:text-amber-300 transition flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Check Appointment</span>
                </a>
                <span className="text-blue-700">•</span>
                <a href="#fee-calculator" className="hover:text-amber-300 transition flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-amber-400" />
                  <span>Calculate Fee</span>
                </a>
                <span className="text-blue-700">•</span>
                <a href="#services" className="hover:text-amber-300 transition flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>View Services</span>
                </a>
              </div>
            </div>

            {/* Quick Demo Access Card */}
            <div className="lg:col-span-4 bg-white/95 text-slate-900 rounded-lg p-6 shadow-xl border border-slate-200">
              <h3 className="font-bold text-sm uppercase tracking-wide text-blue-950 border-b border-slate-200 pb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-900" />
                <span>Academic Evaluation Logins</span>
              </h3>
              <p className="text-xs text-slate-600 mt-2 mb-4">
                Instant pre-seeded accounts for evaluators to test all stakeholder roles:
              </p>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded bg-blue-50 border border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-blue-950">Applicant</span>
                    <span className="text-[10px] text-blue-700 font-mono">applicant_demo</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">Pass: <code className="bg-white px-1 py-0.5 rounded border border-blue-200">Applicant@123</code></p>
                </div>
                <div className="p-2.5 rounded bg-amber-50 border border-amber-200">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-950">Passport Officer</span>
                    <span className="text-[10px] text-amber-700 font-mono">officer_demo</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">Pass: <code className="bg-white px-1 py-0.5 rounded border border-amber-200">Officer@123</code></p>
                </div>
                <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-emerald-950">Police Authority</span>
                    <span className="text-[10px] text-emerald-700 font-mono">police_demo</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">Pass: <code className="bg-white px-1 py-0.5 rounded border border-emerald-200">Police@123</code></p>
                </div>
                <div className="p-2.5 rounded bg-purple-50 border border-purple-200">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-purple-950 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-purple-700" />
                      Administrator
                    </span>
                    <span className="text-[10px] text-purple-700 font-mono">admin_demo</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">Pass: <code className="bg-white px-1 py-0.5 rounded border border-purple-200">Admin@123</code></p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Link
                  href="/login"
                  className="py-2 bg-blue-900 hover:bg-blue-800 text-white rounded text-xs font-semibold text-center transition"
                >
                  Citizen Login →
                </Link>
                <Link
                  href="/admin/login"
                  className="py-2 bg-purple-900 hover:bg-purple-800 text-white rounded text-xs font-semibold text-center transition flex items-center justify-center gap-1"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin Login →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News & Public Notices Section */}
      <section className="py-8 bg-blue-50/50 border-b border-blue-100 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[11px] font-bold uppercase tracking-wider mb-1">
                <Bell className="w-3 h-3 text-amber-600" />
                Public Announcements & Circulars
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Latest Portal Updates & Notices
              </h2>
            </div>
            <Link
              href="/news"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-900 hover:text-blue-700 hover:underline"
            >
              <span>View All Announcements</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {latestNotices.length === 0 ? (
              <div className="col-span-3 bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                No active announcements in the database.
              </div>
            ) : (
              latestNotices.map((n) => {
                const isCritical = n.priority === "CRITICAL";
                const isImportant = n.priority === "IMPORTANT";
                return (
                  <div
                    key={n.id}
                    className={`bg-white rounded-xl border p-4.5 shadow-2xs hover:shadow-sm transition relative overflow-hidden flex flex-col justify-between ${
                      isCritical
                        ? "border-rose-200"
                        : isImportant
                        ? "border-amber-200"
                        : "border-slate-200"
                    }`}
                  >
                    <div
                      className={`absolute top-0 left-0 bottom-0 w-1 ${
                        isCritical ? "bg-rose-600" : isImportant ? "bg-amber-500" : "bg-blue-950"
                      }`}
                    />
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2 pl-1.5">
                        <span
                          className={`font-bold px-1.5 py-0.5 rounded uppercase ${
                            isCritical
                              ? "text-rose-700 bg-rose-50"
                              : isImportant
                              ? "text-amber-800 bg-amber-50"
                              : "text-blue-900 bg-blue-50"
                          }`}
                        >
                          {n.priority}
                        </span>
                        <span>
                          {n.publishedAt
                            ? new Date(n.publishedAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "Notice"}
                        </span>
                      </div>
                      <h3 className="font-bold text-xs text-slate-900 pl-1.5 line-clamp-2 hover:text-blue-900">
                        <Link href={`/news/${n.slug}`}>{n.title}</Link>
                      </h3>
                      <p className="text-[11px] text-slate-600 mt-1 pl-1.5 line-clamp-2">
                        {n.summary}
                      </p>
                    </div>
                    <Link
                      href={`/news/${n.slug}`}
                      className="mt-3 text-[11px] font-bold text-blue-950 hover:underline inline-flex items-center gap-1 pl-1.5"
                    >
                      <span>Read Notice Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* 6-Step Process Flow Section */}
      <section className="py-12 bg-white border-b border-slate-200 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-1 rounded">
              Standard Procedure
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              6-Step Passport Issuance Process
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
              Structured lifecycle from online registration through dispatch of the physical booklet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {processSteps.map((p) => (
              <div
                key={p.step}
                className="p-4 rounded border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md transition text-center relative"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900 text-white font-bold text-xs mx-auto mb-3">
                  {p.step}
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-1">{p.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Cards Section */}
      <section id="services" className="py-14 bg-slate-50 border-b border-slate-200 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                Services Offered
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Citizen Passport Services
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Explore the complete range of simulated passport application and processing facilities.
              </p>
            </div>
            <Link
              href="/register"
              className="mt-4 md:mt-0 text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Start an application</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceCards.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.title}
                  className="bg-white rounded border border-slate-200 p-6 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded bg-blue-50 text-blue-900">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {service.tag}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 mb-1.5">{service.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{service.desc}</p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <Link
                      href="/login"
                      className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1"
                    >
                      <span>Access service</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Appointment Information Section */}
      <section id="appointment-info" className="py-14 bg-white border-b border-slate-200 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-1 rounded">
                Passport Seva Kendras
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Demo Regional PSK & POPSK Centres
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Appointment booking is simulated across regional Passport Seva Kendras (PSK) and Post Office Passport Seva Kendras (POPSK). Citizens book specific time slots for physical biometrics and document verification.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                {[
                  { name: "Chennai PSK - Saligramam", type: "Main PSK", quota: "Normal & Tatkaal" },
                  { name: "Chennai POPSK - Anna Nagar", type: "Post Office PSK", quota: "Normal Quota" },
                  { name: "Coimbatore PSK", type: "Main PSK", quota: "Normal & Tatkaal" },
                  { name: "Vellore PSK", type: "District PSK", quota: "Normal Quota" },
                  { name: "Madurai PSK", type: "Regional PSK", quota: "Normal & Tatkaal" },
                  { name: "Bengaluru PSK - Lalbagh", type: "Main PSK", quota: "Normal & Tatkaal" },
                ].map((c) => (
                  <div key={c.name} className="p-2.5 rounded border border-slate-200 bg-slate-50">
                    <p className="font-bold text-slate-900 text-xs">{c.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{c.type} • {c.quota}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Fee Calculator Section */}
            <div id="fee-calculator" className="lg:col-span-6 bg-slate-50 rounded border border-slate-200 p-6 shadow-xs">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 mb-1">
                <Calculator className="w-4 h-4 text-blue-900" />
                <span>Passport Fee Calculator (Academic Standard)</span>
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                Transparent fee structure based on applicant category, booklet size, and urgency scheme:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-700 font-semibold">
                      <th className="py-2">Service Scheme</th>
                      <th className="py-2">Booklet</th>
                      <th className="py-2">Validity</th>
                      <th className="py-2 text-right">Fee (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    <tr>
                      <td className="py-2 font-medium">Fresh / Re-issue (Normal)</td>
                      <td className="py-2">36 Pages</td>
                      <td className="py-2">10 Years</td>
                      <td className="py-2 text-right font-bold text-slate-900">₹1,500</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium">Fresh / Re-issue (Normal)</td>
                      <td className="py-2">60 Pages</td>
                      <td className="py-2">10 Years</td>
                      <td className="py-2 text-right font-bold text-slate-900">₹2,000</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium text-amber-900">Tatkaal Fast-Track</td>
                      <td className="py-2">36 Pages</td>
                      <td className="py-2">10 Years</td>
                      <td className="py-2 text-right font-bold text-amber-900">₹3,500</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium text-amber-900">Tatkaal Fast-Track</td>
                      <td className="py-2">60 Pages</td>
                      <td className="py-2">10 Years</td>
                      <td className="py-2 text-right font-bold text-amber-900">₹4,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-500">Fees simulated via demo payment gateway.</span>
                <Link href="/register" className="font-semibold text-blue-900 hover:underline">
                  Apply Online Now →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-14 bg-slate-50 border-b border-slate-200 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Help & Citizen Guidance
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group rounded border border-slate-200 bg-white p-4 shadow-2xs open:border-blue-300"
              >
                <summary className="cursor-pointer font-semibold text-xs sm:text-sm text-slate-900 list-none flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-900 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Mandatory Academic Disclaimer Banner */}
      <section className="bg-amber-50 border-y border-amber-200 py-6 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-950 leading-relaxed">
            <p className="font-bold text-amber-900 uppercase tracking-wide">
              Academic Project Disclaimer
            </p>
            <p className="mt-1">
              This is an academic Passport Automation System developed for demonstration and educational purposes. It is not an official Government of India service. No real personal data, monetary payments, or legal passport issuances occur through this portal.
            </p>
          </div>
        </div>
      </section>

      {/* Institutional Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-10 px-4 sm:px-6 mt-auto">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 border-b border-slate-800 pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-600 font-bold text-white text-xs">
                  PAS
                </div>
                <span className="font-bold text-white text-sm">Passport Automation System</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Academic software engineering prototype simulating the comprehensive citizen-to-officer passport workflow.
              </p>
            </div>
            <div>
              <p className="font-bold text-white mb-2">Citizen Services</p>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link href="/register" className="hover:text-white">Apply for Fresh Passport</Link></li>
                <li><Link href="/register" className="hover:text-white">Passport Re-issue</Link></li>
                <li><Link href="/track" className="hover:text-white">Public Status Tracker</Link></li>
                <li><a href="#fee-calculator" className="hover:text-white">Fee Structure</a></li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-white mb-2">Portal Consoles</p>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link href="/login" className="hover:text-white">Applicant Dashboard</Link></li>
                <li><Link href="/login" className="hover:text-white">Passport Officer Console</Link></li>
                <li><Link href="/login" className="hover:text-white">Police Enquiry Terminal</Link></li>
                <li><Link href="/admin/login" className="hover:text-purple-300 font-semibold text-purple-400">🛡️ Admin Management Console</Link></li>
                <li><Link href="/track" className="hover:text-white">Public Verification</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-white mb-2">Academic Information</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Developed as a Software Engineering laboratory capstone demonstrating UML realizations, role-based security, statechart FSM models, and multi-tier architecture.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <p>© 2026 Passport Automation System (Academic Simulation). All rights reserved.</p>
            <p>Built with Next.js 16 • React 19 • TypeScript • Prisma • SQLite</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
