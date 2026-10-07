"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ApplicantPaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [applicant, setApplicant] = useState<any>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [passportType, setPassportType] = useState("REGULAR (36 Pages)");
  const [feeAmount, setFeeAmount] = useState(1500);
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8910");
  const [upiId, setUpiId] = useState("applicant@okaxis");
  const [selectedBank, setSelectedBank] = useState("State Bank of India");
  const [receipt, setReceipt] = useState<any | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPaymentDetails() {
      try {
        const res = await fetch("/api/applicant/payment");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (data.applicant) setApplicant(data.applicant);
        if (data.applicationId) setApplicationId(data.applicationId);
        if (data.passportType) setPassportType(data.passportType);
        if (data.feeAmount !== undefined) setFeeAmount(data.feeAmount);
      } catch (err) {
        console.error("Payment load error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPaymentDetails();
  }, [router]);

  async function handleProcessPayment(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setPaying(true);

    try {
      const res = await fetch("/api/applicant/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod,
          amount: feeAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Payment transaction failed");
        setPaying(false);
        return;
      }

      setReceipt(data.transaction);
      setMessage("Fee payment processed successfully! Transaction confirmed.");
    } catch (err) {
      console.error("Payment error:", err);
      setError("Payment gateway connection error");
    } finally {
      setPaying(false);
    }
  }

  function handlePrintReceipt() {
    window.print();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400">Loading payment gateway...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-16">
      <Navbar
        role="APPLICANT"
        userName={applicant?.name || "Applicant"}
        badgeLabel={applicationId ? `App: ${applicationId}` : "PAS"}
      />

      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between mb-8 print:hidden">
          <div>
            <Link
              href="/applicant/dashboard"
              className="text-xs text-blue-400 hover:text-blue-300 mb-2 inline-block"
            >
              ← Back to Dashboard
            </Link>
            <h2 className="text-3xl font-bold">Government Fee Payment Gateway</h2>
            <p className="text-sm text-slate-400 mt-1">
              Secure online processing of statutory passport application & booklet charges.
            </p>
          </div>

          {applicationId && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Application ID
              </span>
              <span className="font-mono text-sm font-semibold text-blue-400">
                {applicationId}
              </span>
            </div>
          )}
        </div>

        {/* Notifications */}
        {message && (
          <div className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-sm text-emerald-300 print:hidden">
            ✓ {message}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-300 print:hidden">
            ✗ {error}
          </div>
        )}

        {/* Payment Confirmation Receipt */}
        {!applicationId ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-12 text-center shadow-xl">
            <p className="text-4xl mb-3">💳</p>
            <h3 className="text-lg font-bold text-white">No active application found for fee payment</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Please submit your passport application form before proceeding to fee payment and receipt generation.
            </p>
            <Link
              href="/applicant/application"
              className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-lg shadow-blue-600/30"
            >
              Start Application Now →
            </Link>
          </div>
        ) : receipt ? (
          <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900 p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 font-bold text-white">
                  ✓
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-300">
                    Payment Confirmation Receipt
                  </h3>
                  <p className="text-xs text-slate-400">
                    Passport Seva Official Payment Acknowledgment
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
                TRANSACTION SUCCESS
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Transaction Reference
                </span>
                <span className="font-mono text-sm font-bold text-white mt-1 block">
                  {receipt.txnId}
                </span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Amount Paid
                </span>
                <span className="text-base font-bold text-emerald-400 mt-1 block">
                  ₹{receipt.amount}.00
                </span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Payment Mode
                </span>
                <span className="text-sm font-semibold text-slate-200 mt-1 block">
                  {receipt.paymentMethod}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 print:hidden">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
              >
                🖨️ Print Payment Receipt
              </button>

              <Link
                href="/applicant/appointment"
                className="rounded-lg bg-blue-600 px-6 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
              >
                Continue to Appointment Scheduling →
              </Link>
            </div>
          </div>
        ) : (
          /* Payment Processing Form */
          <div className="grid gap-8 md:grid-cols-12">
            {/* Fee Summary (Left 5 Cols) */}
            <div className="md:col-span-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="text-base font-semibold border-b border-slate-800 pb-3 mb-4">
                Fee Breakdown
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Application Type</span>
                  <span className="text-white font-medium">{passportType}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Standard Application Fee</span>
                  <span className="text-white font-medium">₹1,500.00</span>
                </div>
                {feeAmount > 1500 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Tatkaal / Extra Pages Charge</span>
                    <span className="text-white font-medium">₹{feeAmount - 1500}.00</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>GST & Gateway Charges</span>
                  <span className="text-emerald-400 font-medium">₹0.00 (Exempt)</span>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-between text-sm font-bold">
                  <span>Total Payable Amount</span>
                  <span className="text-emerald-400 text-lg">₹{feeAmount}.00</span>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4 text-[11px] text-slate-400">
                🔒 256-Bit SSL Encrypted Government Payment Gateway Simulation.
              </div>
            </div>

            {/* Payment Method Selector & Form (Right 7 Cols) */}
            <form
              onSubmit={handleProcessPayment}
              className="md:col-span-7 rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-6"
            >
              <h3 className="text-base font-semibold border-b border-slate-800 pb-3">
                Select Payment Mode
              </h3>

              {/* Payment Tabs */}
              <div className="grid grid-cols-3 gap-2">
                {["Card", "UPI", "NetBanking"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`rounded-xl border py-2.5 text-xs font-semibold transition text-center ${
                      paymentMethod === m
                        ? "border-blue-500 bg-blue-500/20 text-blue-300"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                    }`}
                  >
                    {m === "Card" ? "💳 Card" : m === "UPI" ? "📱 UPI" : "🏛️ Net Banking"}
                  </button>
                ))}
              </div>

              {/* Card Inputs */}
              {paymentMethod === "Card" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500 outline-none font-mono"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        defaultValue="12/28"
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        defaultValue="842"
                        maxLength={3}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Inputs */}
              {paymentMethod === "UPI" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Virtual Payment Address (VPA / UPI ID)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okhdfcbank"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                      required
                    />
                  </div>
                </div>
              )}

              {/* NetBanking Inputs */}
              {paymentMethod === "NetBanking" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Select Financial Institution
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                    >
                      <option>State Bank of India (SBI)</option>
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>Punjab National Bank</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={paying}
                className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-50 shadow-lg shadow-emerald-600/30"
              >
                {paying ? "Processing Transaction..." : `Pay ₹${feeAmount}.00 & Confirm`}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
