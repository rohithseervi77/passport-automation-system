"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<"APPLICANT" | "OFFICER" | "POLICE">("APPLICANT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Applicant fields
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");

  // Officer fields
  const [branchLocation, setBranchLocation] = useState("RPO Central Processing Center");
  const [officerId, setOfficerId] = useState("");

  // Police fields
  const [stationCode, setStationCode] = useState("PS-CENTRAL");
  const [badgeNumber, setBadgeNumber] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(event.currentTarget);

    const username = formData.get("username")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();

    const payload: any = {
      username,
      email,
      password,
      role,
    };

    if (role === "APPLICANT") {
      payload.name = name.trim();
      payload.dob = dob;
      payload.address = address.trim();
    } else if (role === "OFFICER") {
      payload.branchLocation = branchLocation.trim();
      payload.officerId = officerId.trim() || undefined;
    } else if (role === "POLICE") {
      payload.stationCode = stationCode.trim();
      payload.badgeNumber = badgeNumber.trim() || undefined;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed.");
        setLoading(false);
        return;
      }

      let successMsg = `Account created successfully for ${username}!`;
      if (data.applicantId) successMsg += ` Your Applicant ID is ${data.applicantId}.`;
      if (data.officerId) successMsg += ` Your Officer ID is ${data.officerId}.`;
      if (data.badgeNumber) successMsg += ` Your Badge Number is ${data.badgeNumber}.`;

      setSuccess(successMsg);

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold">
              PAS
            </div>

            <div>
              <h1 className="font-bold">Passport Automation System</h1>
              <p className="text-xs text-slate-400">
                Government of India • Ministry of External Affairs
              </p>
            </div>
          </Link>

          <Link
            href="/login"
            className="text-xs text-blue-400 hover:text-blue-300 font-medium"
          >
            Already have an account? Login →
          </Link>
        </div>
      </header>

      {/* Registration Form */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30">
              New User Onboarding
            </span>

            <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">
              Create Your Digital Identity
            </h2>

            <p className="mt-2 text-xs md:text-sm text-slate-400">
              Register as a Citizen Applicant, Passport Verification Officer, or Police Authority.
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="mb-6 grid grid-cols-3 gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-1.5 shadow-lg">
            <button
              type="button"
              onClick={() => setRole("APPLICANT")}
              className={`rounded-xl py-3 px-2 text-xs font-bold transition flex flex-col items-center gap-1 ${
                role === "APPLICANT"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <span className="text-base">🧑‍💼</span>
              <span>Citizen Applicant</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("OFFICER")}
              className={`rounded-xl py-3 px-2 text-xs font-bold transition flex flex-col items-center gap-1 ${
                role === "OFFICER"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <span className="text-base">🛂</span>
              <span>Passport Officer</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("POLICE")}
              className={`rounded-xl py-3 px-2 text-xs font-bold transition flex flex-col items-center gap-1 ${
                role === "POLICE"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <span className="text-base">👮</span>
              <span>Police Authority</span>
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl"
          >
            {/* Account Credentials */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="username"
                  className="mb-1.5 block text-xs font-medium text-slate-300"
                >
                  Username / Portal Login ID *
                </label>

                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="e.g. rahul_sharma99"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-medium text-slate-300"
                >
                  Email Address *
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.gov.in"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-medium text-slate-300"
              >
                Account Password *
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Choose a strong password (min 6 characters)"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-blue-500"
                required
                minLength={6}
              />
            </div>

            {/* Role-Specific Fields */}
            {role === "APPLICANT" && (
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Applicant Personal Particulars
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="As per Aadhaar / Birth Record"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Present Residential Address *
                  </label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House / Flat No, Street, Landmark, City, State, PIN"
                    className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            )}

            {role === "OFFICER" && (
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Passport Officer Credentials
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                      Designated Officer ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={officerId}
                      onChange={(e) => setOfficerId(e.target.value)}
                      placeholder="e.g. OFF-8821 (auto-generated if blank)"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                      Regional Passport Office Branch *
                    </label>
                    <select
                      value={branchLocation}
                      onChange={(e) => setBranchLocation(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-amber-500"
                    >
                      <option>RPO Central Processing Center</option>
                      <option>RPO Delhi Regional Headquarters</option>
                      <option>RPO Mumbai Western Division</option>
                      <option>RPO Bengaluru South Division</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {role === "POLICE" && (
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Police Station Authority Details
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                      Jurisdiction Police Station Code *
                    </label>
                    <select
                      value={stationCode}
                      onChange={(e) => setStationCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-purple-500 font-mono"
                    >
                      <option value="PS-CENTRAL">PS-CENTRAL (Central Division)</option>
                      <option value="PS-NORTH">PS-NORTH (North District)</option>
                      <option value="PS-SOUTH">PS-SOUTH (South Division)</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                      Enquiry Officer Badge Number *
                    </label>
                    <input
                      type="text"
                      value={badgeNumber}
                      onChange={(e) => setBadgeNumber(e.target.value)}
                      placeholder="e.g. POL-9924"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-purple-500 font-mono"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
                {error}
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-xs text-green-400">
                {success}
                <p className="mt-1 text-[11px] text-green-500">
                  Redirecting to official login page...
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-xl px-6 py-3 text-xs font-bold transition shadow-lg disabled:cursor-not-allowed disabled:opacity-50 ${
                role === "OFFICER"
                  ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/30"
                  : role === "POLICE"
                  ? "bg-purple-600 hover:bg-purple-700 shadow-purple-600/30"
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30"
              }`}
            >
              {loading ? "Registering & Persisting Data..." : `Complete ${role} Registration →`}
            </button>

            <p className="text-center text-[11px] text-slate-500">
              By submitting this form, you confirm that all entered details are accurate under the Passports Act, 1967.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
