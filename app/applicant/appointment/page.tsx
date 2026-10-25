"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Printer, 
  AlertCircle, 
  ShieldAlert, 
  ArrowRight, 
  FileText,
  Building,
  RefreshCw,
  XCircle
} from "lucide-react";

export default function ApplicantAppointmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [applicant, setApplicant] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [appointment, setAppointment] = useState<any>(null);
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Form selections
  const [selectedLocation, setSelectedLocation] = useState(
    "PSK Chennai - Saligramam (Ground Floor, Bharani Colony)"
  );
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    // Skip Sunday
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [selectedSlot, setSelectedSlot] = useState("10:00 AM - 11:00 AM");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const locations = [
    { name: "PSK Chennai - Saligramam (Ground Floor, Bharani Colony)", type: "PSK", rpo: "Chennai" },
    { name: "PSK Chennai - Aminjikarai (Navin's Presidium)", type: "PSK", rpo: "Chennai" },
    { name: "POPSK Vellore - Head Post Office Complex, Officers Line", type: "POPSK", rpo: "Chennai" },
    { name: "PSK Coimbatore - Mayflower Valencia, Nava India", type: "PSK", rpo: "Coimbatore" },
    { name: "PSK Madurai - Kochadai, Melakkal Main Road", type: "PSK", rpo: "Madurai" },
    { name: "PSK Bengaluru - Lalbagh Road, Passport Seva Complex", type: "PSK", rpo: "Bengaluru" },
  ];

  const timeSlots = [
    { slot: "09:00 AM - 10:00 AM", available: 12, quota: "Normal & Tatkaal" },
    { slot: "10:00 AM - 11:00 AM", available: 5, quota: "Normal & Tatkaal" },
    { slot: "11:30 AM - 12:30 PM", available: 8, quota: "Normal & Tatkaal" },
    { slot: "02:00 PM - 03:00 PM", available: 14, quota: "Normal" },
    { slot: "03:30 PM - 04:30 PM", available: 9, quota: "Normal" },
    { slot: "04:30 PM - 05:30 PM", available: 3, quota: "Normal (Walk-in Backup)" },
  ];

  async function fetchAppointmentData() {
    try {
      const res = await fetch("/api/applicant/appointment");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setApplicant(data.applicant);
      setApplication(data.application);
      setAppointment(data.appointment);
      setIsPaymentCompleted(data.isPaymentCompleted);
    } catch (err) {
      console.error("Failed to load appointment:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAppointmentData();
  }, [router]);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBooking(true);

    try {
      const endpoint = isRescheduling
        ? "/api/applicant/appointment/reschedule"
        : "/api/applicant/appointment";

      const payload = isRescheduling
        ? {
            newDate: selectedDate,
            newSlot: selectedSlot,
            reason: "Rescheduled by applicant through citizen portal",
          }
        : {
            date: selectedDate,
            timeSlot: selectedSlot,
            location: selectedLocation,
            quota: application?.applicationCategory || "NORMAL",
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to schedule appointment");
        setBooking(false);
        return;
      }

      setAppointment(data.appointment);
      setIsRescheduling(false);
      setMessage(data.message || "Appointment confirmed! Please report to PSK 15 minutes prior to slot.");
    } catch (err) {
      console.error("Booking error:", err);
      setError("Failed to connect to server");
    } finally {
      setBooking(false);
    }
  }

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this confirmed appointment slot?")) return;
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/applicant/appointment", {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to cancel appointment");
        return;
      }
      setAppointment(null);
      setMessage("Appointment cancelled. You can book a new slot whenever ready.");
    } catch (err) {
      console.error("Cancel error:", err);
      setError("Failed to cancel appointment");
    }
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium text-slate-600">Loading PSK Appointment Scheduling System...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 pb-16 font-sans">
      <Navbar
        role="APPLICANT"
        userName={applicant?.name || "Applicant"}
        badgeLabel={application?.applicationId ? `ARN: ${application.applicationId}` : "PAS"}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 print:hidden">
          <Link href="/applicant/dashboard" className="hover:text-blue-900 hover:underline">
            Applicant Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Appointment Scheduling</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 mb-8 print:hidden">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 text-xs font-semibold mb-2">
              <Calendar className="w-3.5 h-3.5" />
              Passport Seva Kendra Appointment
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Schedule / Manage PSK Appointment
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Select your preferred Passport Seva Kendra (PSK) or Post Office PSK (POPSK) for physical document verification & biometrics.
            </p>
          </div>

          {application?.applicationId && (
            <div className="mt-4 sm:mt-0 p-3 bg-white border border-slate-200 rounded-lg text-right shadow-sm">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Application Reference Number</div>
              <div className="text-base font-bold font-mono text-blue-950">{application.applicationId}</div>
            </div>
          )}
        </div>

        {/* Feedback Alerts */}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm flex items-start gap-3 print:hidden">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Operation Completed</p>
              <p className="text-xs text-emerald-700 mt-0.5">{message}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-sm flex items-start gap-3 print:hidden">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Scheduling Notice</p>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Pre-condition checks */}
        {!application ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-800">No active application found</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
              You must submit an application and complete fee payment before scheduling an appointment slot.
            </p>
            <Link
              href="/applicant/application"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-950 text-white text-sm font-semibold rounded-md hover:bg-blue-900 transition"
            >
              Fill Application Form →
            </Link>
          </div>
        ) : !isPaymentCompleted ? (
          <div className="bg-white border border-amber-300 rounded-xl p-8 shadow-sm text-center">
            <ShieldAlert className="w-12 h-12 text-amber-600 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-900">Fee Payment Required Before Appointment</h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto mt-1 mb-6">
              In accordance with Passport Rules, physical appointment booking at PSK centres is unlocked only after successful electronic payment of statutory application fees.
            </p>
            <Link
              href="/applicant/payment"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-950 text-white text-sm font-semibold rounded-md hover:bg-blue-900 transition shadow-sm"
            >
              Proceed to Fee Payment Gateway →
            </Link>
          </div>
        ) : appointment && appointment.status !== "CANCELLED" && !isRescheduling ? (
          /* ========================================================
             CONFIRMED APPOINTMENT LETTER / SLIP (PRINTABLE)
             ======================================================== */
          <div className="space-y-6">
            <div className="bg-white border-2 border-slate-300 rounded-xl shadow-md p-6 sm:p-8 relative">
              {/* Slip Header */}
              <div className="border-b-2 border-slate-800 pb-5 mb-6 text-center">
                <div className="inline-block px-3 py-1 bg-blue-900 text-white text-xs font-bold uppercase tracking-wider rounded mb-2">
                  Passport Automation System • Central Passport Organisation
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 uppercase">
                  Appointment Confirmation Receipt & Letter
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Mandatory Entry Pass for Biometrics & Document Verification at Passport Seva Kendra
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  SLOT STATUS: CONFIRMED
                </div>
              </div>

              {/* High Priority Appointment Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                <div>
                  <span className="text-xs text-blue-800 uppercase font-bold block">Appointment Date</span>
                  <span className="text-lg font-bold text-blue-950">
                    {new Date(appointment.date).toLocaleDateString("en-IN", {
                      weekday: "short",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-blue-800 uppercase font-bold block">Time Slot</span>
                  <span className="text-lg font-bold text-blue-950">{appointment.timeSlot}</span>
                  <span className="text-[11px] text-blue-700 block mt-0.5">Report 15 minutes before slot</span>
                </div>
                <div>
                  <span className="text-xs text-blue-800 uppercase font-bold block">Appointment ID</span>
                  <span className="font-mono text-base font-bold text-blue-950">{appointment.appointmentId}</span>
                </div>
              </div>

              {/* Centre & Applicant Particulars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 text-sm">
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-900" />
                    Designated Verification Centre
                  </h3>
                  <p className="font-bold text-slate-900 text-base">{appointment.location}</p>
                  <p className="text-xs text-slate-600 mt-1">Quota Category: <strong>{appointment.quota || "NORMAL"}</strong></p>
                  <p className="text-xs text-slate-500 mt-2">
                    Entry is restricted strictly to the applicant. Accompanying persons are not allowed inside the processing hall (except for minors/differently-abled).
                  </p>
                </div>

                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-900" />
                    Applicant & File Details
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Applicant:</span>
                      <span className="font-semibold text-slate-900">
                        {application.givenName ? `${application.givenName} ${application.surname || ""}` : applicant.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Application (ARN):</span>
                      <span className="font-mono font-bold text-blue-950">{application.applicationId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Service Category:</span>
                      <span className="font-medium text-slate-800">{application.serviceType || "FRESH"} ({application.bookletType === "60_PAGES" ? "60 Pgs" : "36 Pgs"})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Reschedule Count:</span>
                      <span className="font-medium text-slate-800">{appointment.rescheduleCount || 0} of 2 allowed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PSK Three-Stage Counter Workflow Explanation */}
              <div className="border border-slate-200 rounded-lg p-4 mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Sequence of Procedures at Passport Seva Kendra
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="font-bold text-blue-950 mb-1">Counter A (TCS Staff)</div>
                    <p className="text-slate-600">Digital biometric capture: 10-fingerprint scanning, on-site live photograph, and electronic signature.</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="font-bold text-blue-950 mb-1">Counter B (Verifying Officer)</div>
                    <p className="text-slate-600">Physical verification of original supporting documents (Address, DOB, Identity) with uploaded files.</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="font-bold text-blue-950 mb-1">Counter C (Granting Officer)</div>
                    <p className="text-slate-600">Final administrative review, recommendation for police enquiry initiation or direct granting approval.</p>
                  </div>
                </div>
              </div>

              {/* Mandatory Checklist of Documents to Bring */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 mb-6">
                <p className="font-bold flex items-center gap-1.5 mb-2">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  Mandatory Documents to Carry (Originals + 1 Self-Attested Photocopy):
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-amber-800">
                  <li>Printout of this Appointment Confirmation Receipt / Letter.</li>
                  <li>Original Proof of Identity (Aadhaar Card, Voter ID, or PAN Card).</li>
                  <li>Original Proof of Present Residential Address (Aadhaar, Electricity Bill, or Bank Passbook).</li>
                  <li>Original Proof of Date of Birth (Birth Certificate or 10th Standard Marksheet).</li>
                  {application.serviceType === "REISSUE" && (
                    <li>Original Old Passport booklet and self-attested copies of first 2 and last 2 pages.</li>
                  )}
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 print:hidden">
                <button
                  onClick={handlePrint}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-md hover:bg-slate-50 transition shadow-sm"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  Print Appointment Slip
                </button>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <Link
                    href="/applicant/psk-simulation"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-700 text-white text-sm font-bold rounded-md hover:bg-emerald-800 transition shadow-sm"
                  >
                    <Building className="w-4 h-4" />
                    <span>Start Simulated PSK Visit</span>
                  </Link>

                  <button
                    onClick={() => setIsRescheduling(true)}
                    disabled={appointment.rescheduleCount >= 3}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-900 text-sm font-semibold rounded-md hover:bg-blue-100 disabled:opacity-50 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reschedule Slot {appointment.rescheduleCount >= 3 && "(Limit reached)"}
                  </button>

                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-md hover:bg-rose-100 transition"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Cancel Slot
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================
             SCHEDULE / RESCHEDULE FORM
             ======================================================== */
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8">
            <div className="mb-6 pb-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">
                {isRescheduling ? "Reschedule Appointment Slot" : "Select Centre & Schedule Slot"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Choose an available PSK centre, date, and preferred time slot for document verification.
              </p>
            </div>

            <form onSubmit={handleBook} className="space-y-6">
              {/* Step A: Centre Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  1. Select Passport Seva Kendra (PSK / POPSK)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {locations.map((loc) => (
                    <label
                      key={loc.name}
                      className={`p-3.5 rounded-lg border text-left cursor-pointer transition flex items-start gap-3 ${
                        selectedLocation === loc.name
                          ? "border-blue-900 bg-blue-50 ring-1 ring-blue-900"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="pskLocation"
                        value={loc.name}
                        checked={selectedLocation === loc.name}
                        onChange={() => setSelectedLocation(loc.name)}
                        className="mt-1 text-blue-900 focus:ring-blue-900"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-900">{loc.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span className="px-1.5 py-0.5 rounded bg-slate-200 font-medium">{loc.type}</span>
                          <span>Jurisdiction: RPO {loc.rpo}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Step B: Date Picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  2. Select Appointment Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                  className="w-full sm:w-64 px-3 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  PSK centres operate Monday to Friday (excluding public gazetted holidays).
                </span>
              </div>

              {/* Step C: Slot Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  3. Select Preferred Time Slot
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {timeSlots.map((ts) => (
                    <label
                      key={ts.slot}
                      className={`p-3 rounded-lg border cursor-pointer transition ${
                        selectedSlot === ts.slot
                          ? "border-blue-900 bg-blue-50 ring-1 ring-blue-900"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <input
                          type="radio"
                          name="timeSlot"
                          value={ts.slot}
                          checked={selectedSlot === ts.slot}
                          onChange={() => setSelectedSlot(ts.slot)}
                          className="text-blue-900 focus:ring-blue-900"
                        />
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {ts.available} slots left
                        </span>
                      </div>
                      <div className="font-semibold text-xs text-slate-800 mt-1">{ts.slot}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{ts.quota}</div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                {isRescheduling && (
                  <button
                    type="button"
                    onClick={() => setIsRescheduling(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-50"
                  >
                    Cancel Rescheduling
                  </button>
                )}

                <button
                  type="submit"
                  disabled={booking}
                  className="ml-auto inline-flex items-center gap-2 px-6 py-2.5 bg-blue-950 text-white text-sm font-semibold rounded-md hover:bg-blue-900 disabled:opacity-50 transition shadow-sm"
                >
                  {booking ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Confirming Slot...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      {isRescheduling ? "Update Appointment" : "Confirm Appointment Slot"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
