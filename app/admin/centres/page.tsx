"use client";

import React, { useState, useEffect, useCallback } from "react";
import AdminShell from "@/components/AdminShell";
import {
  MapPin,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  AlertCircle,
  Building2,
  Edit,
  Power,
  X,
  ExternalLink,
  Layers,
  Users,
} from "lucide-react";
import Link from "next/link";

interface PassportCenter {
  id: number;
  centerCode: string;
  name: string;
  type: string;
  address: string;
  locality?: string | null;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  associatedRpo: string;
  operatingHours: string;
  status: "ACTIVE" | "RELOCATED" | "TEMPORARILY_CLOSED";
  dailyCapacity: number;
  slotCapacity: number;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalCentres: number;
  activeCentres: number;
  pskCount: number;
  popskCount: number;
  totalCapacity: number;
}

export default function AdminCentresPage() {
  const [centres, setCentres] = useState<PassportCenter[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [states, setStates] = useState<string[]>([]);
  const [rpos, setRpos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedState, setSelectedState] = useState("ALL");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<PassportCenter | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    centerCode: "",
    name: "",
    type: "PSK",
    associatedRpo: "RPO Chennai",
    state: "Tamil Nadu",
    district: "Chennai",
    city: "Chennai",
    pinCode: "600001",
    address: "",
    locality: "",
    operatingHours: "09:00 AM - 05:00 PM (Monday to Friday)",
    status: "ACTIVE" as "ACTIVE" | "RELOCATED" | "TEMPORARILY_CLOSED",
    dailyCapacity: 300,
    slotCapacity: 20,
  });

  const fetchCentres = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedType !== "ALL") params.set("type", selectedType);
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);
      if (selectedState !== "ALL") params.set("state", selectedState);

      const res = await fetch(`/api/admin/centres?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch centres");

      const data = await res.json();
      setCentres(data.centres || []);
      setStats(data.stats || null);
      if (data.states) setStates(data.states);
      if (data.rpos) setRpos(data.rpos);
    } catch (err: any) {
      setError(err?.message || "Failed to load centres");
    } finally {
      setLoading(false);
    }
  }, [search, selectedType, selectedStatus, selectedState]);

  useEffect(() => {
    fetchCentres();
  }, [fetchCentres]);

  function handleOpenCreate() {
    setEditingCenter(null);
    setFormData({
      centerCode: "",
      name: "",
      type: "PSK",
      associatedRpo: rpos[0] || "RPO Chennai",
      state: "Tamil Nadu",
      district: "Chennai",
      city: "Chennai",
      pinCode: "",
      address: "",
      locality: "",
      operatingHours: "09:00 AM - 05:00 PM (Monday to Friday)",
      status: "ACTIVE",
      dailyCapacity: 300,
      slotCapacity: 20,
    });
    setFormError("");
    setModalOpen(true);
  }

  function handleOpenEdit(center: PassportCenter) {
    setEditingCenter(center);
    setFormData({
      centerCode: center.centerCode,
      name: center.name,
      type: center.type,
      associatedRpo: center.associatedRpo,
      state: center.state,
      district: center.district,
      city: center.city,
      pinCode: center.pinCode,
      address: center.address,
      locality: center.locality || "",
      operatingHours: center.operatingHours,
      status: center.status,
      dailyCapacity: center.dailyCapacity,
      slotCapacity: center.slotCapacity,
    });
    setFormError("");
    setModalOpen(true);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormSubmitting(true);

    try {
      if (editingCenter) {
        // Update
        const res = await fetch(`/api/admin/centres/${editingCenter.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update centre");

        setActionSuccess(`Passport centre ${formData.centerCode} updated successfully.`);
      } else {
        // Create
        const res = await fetch("/api/admin/centres", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create centre");

        setActionSuccess(`Passport centre ${formData.centerCode} created successfully.`);
      }

      setModalOpen(false);
      fetchCentres();
      setTimeout(() => setActionSuccess(""), 5000);
    } catch (err: any) {
      setFormError(err?.message || "Operation failed");
    } finally {
      setFormSubmitting(false);
    }
  }

  async function handleToggleStatus(center: PassportCenter) {
    const newStatus = center.status === "ACTIVE" ? "TEMPORARILY_CLOSED" : "ACTIVE";
    try {
      const res = await fetch(`/api/admin/centres/${center.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      setActionSuccess(`Status of ${center.centerCode} changed to ${newStatus}.`);
      fetchCentres();
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err: any) {
      setError(err?.message || "Failed to toggle status");
    }
  }

  return (
    <AdminShell
      pageTitle="Passport Centres & PSK Management"
      pageSubtitle="Configure regional Passport Seva Kendras (PSKs), Post Office PSKs (POPSKs), capacities, and operational statuses across India."
    >
      <div className="space-y-6">
        {/* Academic Simulation Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start space-x-3 text-amber-900 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Academic Simulation Environment:</span> This administration console manages
            simulated regional passport centres and appointment slot allocations. No real government facilities are
            modified.
          </div>
        </div>

        {/* Feedback Messages */}
        {actionSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess("")} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError("")} className="text-red-700 hover:text-red-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top KPI Metrics Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Centres</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-900">{stats.totalCentres}</span>
                <Building2 className="w-5 h-5 text-slate-400" />
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Across all states</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">Active PSKs</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-emerald-700">{stats.pskCount}</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Full-service biometric</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block">Active POPSKs</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-blue-700">{stats.popskCount}</span>
                <Layers className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Post office outreach</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider block">Daily Quota</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-purple-800">{stats.totalCapacity.toLocaleString("en-IN")}</span>
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Slots across network</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Public Directory</span>
              <div className="mt-3">
                <Link
                  href="/locate-centre"
                  target="_blank"
                  className="inline-flex items-center text-xs font-semibold text-blue-700 hover:text-blue-900 underline"
                >
                  <span>Open Citizen Locator</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Toolbar: Filters & Add Button */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search code, city, PIN, name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            {/* Type */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus:outline-hidden"
            >
              <option value="ALL">All Types</option>
              <option value="PSK">PSK (Passport Seva Kendra)</option>
              <option value="POPSK">POPSK (Post Office PSK)</option>
              <option value="RPO">RPO (Regional Office)</option>
            </select>

            {/* Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="RELOCATED">RELOCATED</option>
              <option value="TEMPORARILY_CLOSED">TEMPORARILY CLOSED</option>
            </select>

            {/* State */}
            {states.length > 0 && (
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus:outline-hidden"
              >
                <option value="ALL">All States</option>
                {states.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            onClick={handleOpenCreate}
            className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Passport Centre</span>
          </button>
        </div>

        {/* Centres Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Code / Type</th>
                  <th className="px-4 py-3">Centre Name & Address</th>
                  <th className="px-4 py-3">RPO & State</th>
                  <th className="px-4 py-3">Daily Capacity</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      Loading passport centres...
                    </td>
                  </tr>
                ) : centres.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      No passport centres found matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  centres.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition">
                      {/* Code / Type */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 block">{c.centerCode}</span>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                            c.type === "PSK"
                              ? "bg-blue-100 text-blue-800"
                              : c.type === "POPSK"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {c.type}
                        </span>
                      </td>

                      {/* Name & Address */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <span className="font-semibold text-slate-900 block">{c.name}</span>
                        <span className="text-slate-500 text-[11px] block truncate">{c.address}</span>
                        <span className="text-slate-400 text-[10px]">PIN: {c.pinCode} | City: {c.city}</span>
                      </td>

                      {/* RPO & State */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-medium text-slate-800 block">{c.associatedRpo}</span>
                        <span className="text-slate-500 text-[11px]">{c.state}</span>
                      </td>

                      {/* Capacity */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block">{c.dailyCapacity} slots/day</span>
                        <span className="text-slate-500 text-[10px]">{c.slotCapacity} slots / 30-min window</span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800"
                              : c.status === "RELOCATED"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              c.status === "ACTIVE"
                                ? "bg-emerald-600"
                                : c.status === "RELOCATED"
                                ? "bg-amber-600"
                                : "bg-red-600"
                            }`}
                          />
                          {c.status.replace("_", " ")}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded font-medium transition inline-flex items-center"
                          title="Edit Centre"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(c)}
                          className={`px-2.5 py-1 rounded font-medium transition inline-flex items-center ${
                            c.status === "ACTIVE"
                              ? "text-red-700 bg-red-50 hover:bg-red-100"
                              : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                          }`}
                          title={c.status === "ACTIVE" ? "Temporarily Close" : "Mark Active"}
                        >
                          <Power className="w-3.5 h-3.5 mr-1" />
                          <span>{c.status === "ACTIVE" ? "Close" : "Activate"}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create / Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-blue-700" />
                  <h3 className="text-base font-bold text-slate-900">
                    {editingCenter ? `Edit Centre: ${editingCenter.centerCode}` : "Register New Passport Centre"}
                  </h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-3 rounded-lg flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Centre Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PSK-CHN-04"
                      value={formData.centerCode}
                      onChange={(e) => setFormData({ ...formData, centerCode: e.target.value.toUpperCase() })}
                      disabled={!!editingCenter}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Centre Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    >
                      <option value="PSK">PSK — Passport Seva Kendra (Full Service)</option>
                      <option value="POPSK">POPSK — Post Office Passport Seva Kendra</option>
                      <option value="RPO">RPO — Regional Passport Office</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Official Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Passport Seva Kendra - Velachery"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Associated RPO *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. RPO Chennai"
                      value={formData.associatedRpo}
                      onChange={(e) => setFormData({ ...formData, associatedRpo: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tamil Nadu"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chennai"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                    <input
                      type="text"
                      placeholder="e.g. Chennai"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 600042"
                      value={formData.pinCode}
                      onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Physical Address *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Building name, street, landmarks..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Daily Slot Capacity</label>
                    <input
                      type="number"
                      min={10}
                      max={2000}
                      value={formData.dailyCapacity}
                      onChange={(e) => setFormData({ ...formData, dailyCapacity: parseInt(e.target.value, 10) || 100 })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Slot Capacity (30-min)</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={formData.slotCapacity}
                      onChange={(e) => setFormData({ ...formData, slotCapacity: parseInt(e.target.value, 10) || 20 })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Operational Status</label>
                    <select
                      value={formData.status}
                      onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="RELOCATED">RELOCATED</option>
                      <option value="TEMPORARILY_CLOSED">TEMPORARILY CLOSED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Operating Hours</label>
                  <input
                    type="text"
                    value={formData.operatingHours}
                    onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition disabled:opacity-50"
                  >
                    {formSubmitting ? "Saving..." : editingCenter ? "Update Centre" : "Create Centre"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
