"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  CheckCircle2, 
  Printer, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  Receipt,
  QrCode,
  Lock
} from "lucide-react";

export default function ApplicantPaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [data, setData] = useState<any>(null);
  
  // Payment methods
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "DEBIT_CARD" | "CREDIT_CARD" | "NET_BANKING">("UPI");
  
  // Form fields
  const [upiId, setUpiId] = useState("applicant@upi");
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8910");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("888");
  const [cardName, setCardName] = useState("");
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
        const json = await res.json();
        setData(json);
        if (json.applicant?.name) {
          setCardName(json.applicant.name.toUpperCase());
        }
        if (json.latestPayment && json.latestPayment.status === "SUCCESS") {
          setReceipt(json.latestPayment);
          setPaymentSuccess(true);
        }
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
      const breakdown = data?.feeBreakdown;
      const res = await fetch("/api/applicant/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod,
          amount: breakdown?.totalAmount || 1500,
          baseFee: breakdown?.baseFee || 1500,
          additionalFee: breakdown?.additionalFee || 0,
          paymentReference: paymentMethod === "UPI" ? upiId : `${selectedBank}-NET`,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        setError(resData.error || "Payment transaction failed. Please retry.");
        setPaying(false);
        return;
      }

      setReceipt(resData.transaction);
      setPaymentSuccess(true);
      setMessage(resData.message || "Fee payment processed successfully! Transaction confirmed.");
    } catch (err) {
      console.error("Payment error:", err);
      setError("Payment gateway connection error. Please try again.");
    } finally {
      setPaying(false);
    }
  }

  function handlePrintReceipt() {
    window.print();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium text-slate-600">Connecting to Government Payment Gateway...</p>
        </div>
      </main>
    );
  }

  const app = data?.application;
  const breakdown = data?.feeBreakdown;
  const isTatkaal = app?.applicationCategory === "TATKAAL";
  const is60 = app?.bookletType === "60_PAGES";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 pb-16 font-sans">
      <Navbar
        role="APPLICANT"
        userName={data?.applicant?.name || "Applicant"}
        badgeLabel={app?.applicationId ? `ARN: ${app.applicationId}` : "PAS"}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 print:hidden">
          <Link href="/applicant/dashboard" className="hover:text-blue-900 hover:underline">
            Applicant Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Fee Payment</span>
        </nav>

        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 mb-8 print:hidden">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 text-xs font-semibold mb-2">
              <Lock className="w-3.5 h-3.5" />
              Statutory Fee Payment Gateway
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Government Passport Fee Payment
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Secure digital collection of statutory passport application, booklet, and processing charges.
            </p>
          </div>

          {app?.applicationId && (
            <div className="mt-4 sm:mt-0 p-3 bg-white border border-slate-200 rounded-lg text-right shadow-sm">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Application Reference Number</div>
              <div className="text-base font-bold font-mono text-blue-950">{app.applicationId}</div>
            </div>
          )}
        </div>

        {/* Alert Messages */}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm flex items-start gap-3 print:hidden">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Transaction Successful</p>
              <p className="text-xs text-emerald-700 mt-0.5">{message}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-sm flex items-start gap-3 print:hidden">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Payment Notice</p>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {!app ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
            <Receipt className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-800">No active application ready for payment</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
              You must complete and submit your passport application before proceeding with statutory fee payment.
            </p>
            <Link
              href="/applicant/application"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-950 text-white text-sm font-semibold rounded-md hover:bg-blue-900 transition"
            >
              Fill Passport Application Form →
            </Link>
          </div>
        ) : paymentSuccess && receipt ? (
          /* ========================================================
             PAYMENT SUCCESS / OFFICIAL RECEIPT SLIP
             ======================================================== */
          <div className="space-y-6">
            <div className="bg-white border-2 border-slate-300 rounded-xl shadow-md p-6 sm:p-8 relative">
              {/* Receipt Header */}
              <div className="border-b-2 border-slate-800 pb-5 mb-6 text-center">
                <div className="inline-block px-3 py-1 bg-blue-900 text-white text-xs font-bold uppercase tracking-wider rounded mb-2">
                  Passport Automation System • Official Fee Receipt
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 uppercase">
                  Statutory Passport Fee Payment Challan
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Electronic Receipt for Central Passport Organisation Application Processing
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  PAYMENT STATUS: CONFIRMED & RECONCILED
                </div>
              </div>

              {/* Receipt Key Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 text-xs">
                <div>
                  <span className="text-slate-500 block">Transaction Reference:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{receipt.transactionId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Application Reference (ARN):</span>
                  <span className="font-mono font-bold text-blue-950 text-sm">{app.applicationId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Date & Timestamp:</span>
                  <span className="font-medium text-slate-800">
                    {receipt.createdAt
                      ? new Date(receipt.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Recently Reconciled"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Payment Mode:</span>
                  <span className="font-semibold text-slate-900">{receipt.paymentMethod || "Online Gateway"}</span>
                </div>
              </div>

              {/* Applicant Particulars */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Applicant Particulars
                </h3>
                <div className="border border-slate-200 rounded-lg overflow-hidden text-sm">
                  <div className="grid grid-cols-2 divide-x divide-slate-200 border-b border-slate-200">
                    <div className="p-3 bg-slate-50 font-medium text-slate-600">Applicant Full Name</div>
                    <div className="p-3 font-semibold text-slate-900">
                      {app.givenName ? `${app.givenName} ${app.surname || ""}` : data.applicant?.name}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-slate-200 border-b border-slate-200">
                    <div className="p-3 bg-slate-50 font-medium text-slate-600">Service Category</div>
                    <div className="p-3 text-slate-800">
                      {app.serviceType || "FRESH"} Passport • {app.applicationCategory || "NORMAL"} Quota
                    </div>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-slate-200 border-b border-slate-200">
                    <div className="p-3 bg-slate-50 font-medium text-slate-600">Booklet Type</div>
                    <div className="p-3 text-slate-800">
                      {app.bookletType === "60_PAGES" ? "60 Pages (Jumbo Booklet)" : "36 Pages (Standard Booklet)"}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-slate-200">
                    <div className="p-3 bg-slate-50 font-medium text-slate-600">Regional Passport Office (RPO)</div>
                    <div className="p-3 text-slate-800 font-medium">{app.rpoLocation || "RPO Chennai"}</div>
                  </div>
                </div>
              </div>

              {/* Statutory Fee Itemised Table */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Fee Calculation Breakdown
                </h3>
                <table className="w-full text-left text-sm border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-semibold">
                    <tr>
                      <th className="p-3">Component Description</th>
                      <th className="p-3 text-right">Statutory Charge (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-3">
                        <span className="font-semibold text-slate-800">Base Passport Application Fee</span>
                        <span className="block text-xs text-slate-500">Includes biometric capture, scrutiny and booklet charges (36 pages)</span>
                      </td>
                      <td className="p-3 text-right font-mono text-slate-900">₹{receipt.baseFee || 1500}.00</td>
                    </tr>
                    {is60 && (
                      <tr>
                        <td className="p-3">
                          <span className="font-semibold text-slate-800">Additional Booklet Pages Surcharge</span>
                          <span className="block text-xs text-slate-500">60-page Jumbo booklet option</span>
                        </td>
                        <td className="p-3 text-right font-mono text-slate-900">₹500.00</td>
                      </tr>
                    )}
                    {isTatkaal && (
                      <tr>
                        <td className="p-3">
                          <span className="font-semibold text-slate-800">Tatkaal Expedited Processing Surcharge</span>
                          <span className="block text-xs text-slate-500">Fast-track verification and out-of-turn printing</span>
                        </td>
                        <td className="p-3 text-right font-mono text-slate-900">₹2000.00</td>
                      </tr>
                    )}
                    <tr className="bg-slate-50 font-bold">
                      <td className="p-3 text-slate-900 text-base">Total Amount Paid</td>
                      <td className="p-3 text-right font-mono text-blue-950 text-base">₹{receipt.amount}.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Instructions and Security Stamp */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 mb-6">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  Important Instructions for Applicant:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-amber-800">
                  <li>Please carry a printed copy of this receipt along with your Appointment Confirmation Letter to the PSK.</li>
                  <li>No cash transaction is permitted at the Passport Seva Kendra counter.</li>
                  <li>Appointment slot booking is now unlocked. You must book a physical biometric appointment slot to proceed.</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 print:hidden">
                <button
                  onClick={handlePrintReceipt}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-md hover:bg-slate-50 transition shadow-sm"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  Print Fee Challan / Receipt
                </button>

                <Link
                  href="/applicant/appointment"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-950 text-white text-sm font-semibold rounded-md hover:bg-blue-900 transition shadow-sm"
                >
                  Proceed to Book PSK Appointment
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================
             FEE PAYMENT BREAKDOWN & SIMULATION FORM
             ======================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Fee Breakdown & Particulars (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Application Summary Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Application Summary
                </h2>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Applicant Name</span>
                    <span className="font-semibold text-slate-800">
                      {app.givenName ? `${app.givenName} ${app.surname || ""}` : data.applicant?.name}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Passport Service</span>
                    <span className="font-semibold text-slate-800">{app.serviceType || "FRESH"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Processing Quota</span>
                    <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                      isTatkaal ? "bg-amber-100 text-amber-800" : "bg-blue-50 text-blue-800"
                    }`}>
                      {app.applicationCategory || "NORMAL"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Booklet Pages</span>
                    <span className="font-semibold text-slate-800">
                      {is60 ? "60 Pages (Jumbo)" : "36 Pages (Standard)"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Jurisdiction RPO</span>
                    <span className="font-semibold text-slate-800">{app.rpoLocation || "RPO Chennai"}</span>
                  </div>
                </div>
              </div>

              {/* Fee Breakdown Table */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Statutory Fee Calculation
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-700">
                    <span>Base Application Fee (36 Pgs)</span>
                    <span className="font-mono font-medium">₹{breakdown?.baseFee || 1500}.00</span>
                  </div>
                  {is60 && (
                    <div className="flex justify-between text-slate-700">
                      <div>
                        <span>60 Pages Booklet Surcharge</span>
                        <span className="block text-[11px] text-slate-400">Jumbo booklet extra pages</span>
                      </div>
                      <span className="font-mono font-medium">₹500.00</span>
                    </div>
                  )}
                  {isTatkaal && (
                    <div className="flex justify-between text-slate-700">
                      <div>
                        <span>Tatkaal Priority Surcharge</span>
                        <span className="block text-[11px] text-slate-400">Expedited processing</span>
                      </div>
                      <span className="font-mono font-medium">₹2000.00</span>
                    </div>
                  )}
                  <div className="pt-3 border-t-2 border-slate-100 flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">Total Payable</span>
                    <span className="font-mono font-extrabold text-2xl text-blue-950">
                      ₹{breakdown?.totalAmount || 1500}.00
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Statutory fee is fixed under Passport Act, 1967. Non-refundable.</span>
                </div>
              </div>
            </div>

            {/* Right Column: Payment Methods & Gateway Form (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {/* Payment Method Selector Tabs */}
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
                    Choose Electronic Payment Mode
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("UPI")}
                      className={`p-3 rounded-lg border text-left flex flex-col items-center justify-center gap-1.5 transition text-xs font-semibold ${
                        paymentMethod === "UPI"
                          ? "bg-blue-900 text-white border-blue-900 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>UPI / QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("DEBIT_CARD")}
                      className={`p-3 rounded-lg border text-left flex flex-col items-center justify-center gap-1.5 transition text-xs font-semibold ${
                        paymentMethod === "DEBIT_CARD"
                          ? "bg-blue-900 text-white border-blue-900 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Debit Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("CREDIT_CARD")}
                      className={`p-3 rounded-lg border text-left flex flex-col items-center justify-center gap-1.5 transition text-xs font-semibold ${
                        paymentMethod === "CREDIT_CARD"
                          ? "bg-blue-900 text-white border-blue-900 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Credit Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("NET_BANKING")}
                      className={`p-3 rounded-lg border text-left flex flex-col items-center justify-center gap-1.5 transition text-xs font-semibold ${
                        paymentMethod === "NET_BANKING"
                          ? "bg-blue-900 text-white border-blue-900 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Net Banking</span>
                    </button>
                  </div>
                </div>

                {/* Method-specific Form Fields */}
                <form onSubmit={handleProcessPayment} className="p-6 space-y-5">
                  {paymentMethod === "UPI" && (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
                        <div className="w-32 h-32 mx-auto bg-white border border-slate-300 rounded flex items-center justify-center shadow-inner mb-2">
                          <QrCode className="w-24 h-24 text-slate-800" />
                        </div>
                        <p className="text-xs font-medium text-slate-700">Scan QR Code using any UPI App</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">BHIM, GPay, PhonePe, Paytm, Any Banking App</p>
                      </div>

                      <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink mx-4 text-xs uppercase text-slate-400 font-semibold">Or Enter UPI ID</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Virtual Payment Address (VPA) / UPI ID
                        </label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="username@bank"
                          required
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                        />
                        <span className="text-[11px] text-slate-500 mt-1 block">
                          Example: citizen@okhdfcbank, 9876543210@paytm
                        </span>
                      </div>
                    </div>
                  )}

                  {(paymentMethod === "DEBIT_CARD" || paymentMethod === "CREDIT_CARD") && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Cardholder Name (as printed on card)
                        </label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="CARDHOLDER NAME"
                          required
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Card Number (16 Digits)
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4532 •••• •••• 8910"
                          required
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-900"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Expiry (MM/YY)
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            maxLength={5}
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-blue-900"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            CVV / CVC
                          </label>
                          <input
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="•••"
                            maxLength={4}
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-blue-900"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "NET_BANKING" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-2">
                          Select Banking Institution
                        </label>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {[
                            "State Bank of India",
                            "HDFC Bank",
                            "ICICI Bank",
                            "Punjab National Bank",
                            "Axis Bank",
                            "Bank of Baroda",
                          ].map((bank) => (
                            <button
                              key={bank}
                              type="button"
                              onClick={() => setSelectedBank(bank)}
                              className={`p-2.5 rounded border text-left text-xs font-medium transition ${
                                selectedBank === bank
                                  ? "border-blue-900 bg-blue-50 text-blue-950 font-bold"
                                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {bank}
                            </button>
                          ))}
                        </div>

                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                        >
                          <option value="State Bank of India">State Bank of India (SBI)</option>
                          <option value="HDFC Bank">HDFC Bank</option>
                          <option value="ICICI Bank">ICICI Bank</option>
                          <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
                          <option value="Axis Bank">Axis Bank</option>
                          <option value="Bank of Baroda">Bank of Baroda</option>
                          <option value="Canara Bank">Canara Bank</option>
                          <option value="Union Bank of India">Union Bank of India</option>
                          <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Submit / Authorise Button */}
                  <div className="pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={paying}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-950 text-white font-semibold text-sm rounded-lg hover:bg-blue-900 disabled:opacity-50 transition shadow-md"
                    >
                      {paying ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing Payment with Gateway...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Pay ₹{breakdown?.totalAmount || 1500}.00 & Confirm Application
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-center text-slate-400 mt-2">
                      Academic simulation environment. No real funds will be deducted.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
