"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ApplicantAppointmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [applicant, setApplicant] = useState<any>(null);
  const [appointment, setAppointment] = useState<any>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  // Form states
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split("T")[0];
  });
  const [timeSlot, setTimeSlot] = useState("10:00 AM - 11:00 AM");
  const [location, setLocation] = useState("Regional Passport Seva Kendra (PSK) - Central");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const slots = [
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:30 AM - 12:30 PM",
    "02:00 PM - 03:00 PM",
    "03:30 PM - 04:30 PM",
    "04:30 PM - 05:30 PM",
  ];

  async function fetchAppointment() {
    try {
      const res = await fetch("/api/applicant/appointment");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.applicant) {
        setApplicant(data.applicant);
      }
      setAppointment(data.appointment);
      setApplicationId(data.applicationId);
    } catch (err) {
      console.error("Failed to load appointment:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAppointment();
  }, []);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBooking(true);

    try {
      const res = await fetch("/api/applicant/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          timeSlot,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to schedule appointment");
        setBooking(false);
        return;
      }

      setAppointment(data.appointment);
      setMessage("Appointment confirmed! Please report to the PSK 15 minutes before your slot.");
    } catch (err) {
      console.error("Booking error:", err);
      setError("Failed to connect to server");
    } finally {
      setBooking(false);
    }
  }

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this appointment slot?")) return;
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/applicant/appointment", {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to cancel");
        return;
      }
      setAppointment(null);
      setMessage("Appointment has been cancelled successfully.");
    } catch (err) {
      console.error("Cancel error:", err);
      setError("Failed to cancel appointment");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400">Loading appointment schedule...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-16">
      <Navbar
        role="APPLICANT"
        userName={applicant?.name || "Applicant"}
        badgeLabel={applicationId ? `App: ${applicationId}` : `ID: ${applicant?.applicantId || "PAS"}`}
      />

      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/applicant/dashboard"
              className="text-xs text-blue-400 hover:text-blue-300 mb-2 inline-block"
            >
              ← Back to Dashboard
            </Link>
            <h2 className="text-3xl font-bold">Appointment Scheduling</h2>
            <p className="text-sm text-slate-400 mt-1">
              Book your in-person biometric enrollment & document verification slot.
            </p>
          </div>

          {applicationId && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Linked Application
              </span>
              <span className="font-mono text-sm font-semibold text-blue-400">
                {applicationId}
              </span>
            </div>
          )}
        </div>

        {/* Notifications */}
        {message && (
          <div className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-sm text-emerald-300">
            ✓ {message}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-300">
            ✗ {error}
          </div>
        )}

        {/* Current Active Appointment Card */}
        {!applicationId ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-12 text-center shadow-xl">
            <p className="text-4xl mb-3">📅</p>
            <h3 className="text-lg font-bold text-white">No active application found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Please submit your passport application form before booking an in-person PSK slot.
            </p>
            <Link
              href="/applicant/application"
              className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-lg shadow-blue-600/30"
            >
              Start Application Now →
            </Link>
          </div>
        ) : appointment ? (
          <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 to-cyan-950/30 p-8 mb-8 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
              <div>
                <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-semibold text-cyan-300">
                  CONFIRMED APPOINTMENT
                </span>
                <h3 className="mt-3 text-2xl font-bold text-white">
                  Passport Seva Kendra Slot Confirmed
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Present this confirmation along with your physical original documents.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Appointment ID
                </span>
                <span className="font-mono text-sm font-bold text-cyan-400">
                  {appointment.appointmentId}
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-xs text-slate-500 uppercase font-semibold">Date</p>
                <p className="text-base font-bold text-white mt-1">
                  {new Date(appointment.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-xs text-slate-500 uppercase font-semibold">Time Slot</p>
                <p className="text-base font-bold text-cyan-300 mt-1">
                  {appointment.timeSlot}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-xs text-slate-500 uppercase font-semibold">Venue</p>
                <p className="text-xs font-medium text-slate-300 mt-1">
                  Regional PSK, Central Complex, Counter C-04
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 print:hidden">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition flex items-center gap-1.5"
                >
                  <span>🖨️</span> Print Appointment Slip
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition"
                >
                  Cancel Slot
                </button>
              </div>

              <Link
                href="/applicant/payment"
                className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
              >
                Pay Application Fee →
              </Link>
            </div>
          </div>
        ) : (
          /* Slot Booking Form */
          <form
            onSubmit={handleBook}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8 space-y-6"
          >
            <h3 className="text-lg font-semibold border-b border-slate-800 pb-3 flex items-center gap-2">
              <span>📅</span> Select Your Appointment Slot
            </h3>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Passport Seva Kendra (Location)
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none"
                >
                  <option>Regional Passport Seva Kendra (PSK) - Central</option>
                  <option>Passport Seva Kendra (PSK) - North Division</option>
                  <option>Passport Seva Kendra (PSK) - South Division</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Preferred Appointment Date
                </label>
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-3">
                Available Time Slots
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                {slots.map((slot) => {
                  const isSelected = timeSlot === slot;
                  return (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setTimeSlot(slot)}
                      className={`rounded-xl border p-3.5 text-center text-xs font-semibold transition ${
                        isSelected
                          ? "border-cyan-500 bg-cyan-500/20 text-cyan-300 shadow-md shadow-cyan-500/20"
                          : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-400">
              <p className="font-semibold text-slate-300 mb-1">
                ℹ️ Important Verification Guidelines:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Carry self-attested photocopies and original identity documents.</li>
                <li>Biometric fingerprint scanning and webcam photograph will be captured.</li>
                <li>Arrive at least 15 minutes prior to the scheduled appointment window.</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={booking}
                className="rounded-lg bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 transition disabled:opacity-50 shadow-lg shadow-cyan-600/30"
              >
                {booking ? "Confirming Slot..." : "Confirm & Book Slot"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
