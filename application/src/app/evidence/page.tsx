
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FolderOpen,
  Database,
  ShieldAlert,
  Users,
  FileText,
  Monitor,
  Activity,
  Search,
  ArrowLeft,
  RefreshCw,
  Calendar,
  X,
  Eye,
  AlertCircle,
  Fingerprint,
} from "lucide-react";

interface Evidence {
  evidence_id: number;
  evidence_code: string;
  case_id: number;
  case_number: string;
  case_title: string;
  evidence_type: string;
  description: string;
  sha256: string;
  acquisition_method: string;
  storage_uri: string;
  collected_at: string;
  integrity_status: string;
  investigator_id: number;
  collected_by_name: string | null;
}

const navigation = [
  { name: "Overview", icon: LayoutDashboard, href: "/" },
  { name: "Cases", icon: FolderOpen, href: "/cases" },
  { name: "Evidence", icon: Database, href: "/evidence" },
  { name: "Chain of Custody", icon: Activity, href: "/reports" },
  { name: "Devices", icon: Monitor, href: "/reports" },
  { name: "Findings & Notes", icon: FileText, href: "/reports" },
  { name: "Reports", icon: FileText, href: "/reports" },
];

export default function EvidencePage() {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [integrityFilter, setIntegrityFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);

  const fetchEvidence = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/evidence", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to retrieve evidence.");
      }

      setEvidence(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to retrieve evidence."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, []);

  const filteredEvidence = useMemo(() => {
    return evidence.filter((item) => {
      const matchesSearch =
        item.evidence_code.toLowerCase().includes(search.toLowerCase()) ||
        item.case_number.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());

      const matchesIntegrity =
        integrityFilter === "ALL" ||
        item.integrity_status === integrityFilter;

      const matchesType =
        typeFilter === "ALL" || item.evidence_type === typeFilter;

      return matchesSearch && matchesIntegrity && matchesType;
    });
  }, [evidence, search, integrityFilter, typeFilter]);

  const integrityColor = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
      case "MISMATCH":
        return "border-red-500/30 bg-red-500/10 text-red-300";
      case "UNVERIFIED":
        return "border-amber-500/30 bg-amber-500/10 text-amber-300";
      default:
        return "border-slate-700 text-slate-400";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const verified = evidence.filter(
    (item) => item.integrity_status === "VERIFIED"
  ).length;

  const mismatched = evidence.filter(
    (item) => item.integrity_status === "MISMATCH"
  ).length;

  const unverified = evidence.filter(
    (item) => item.integrity_status === "UNVERIFIED"
  ).length;

  return (
    <div className="flex min-h-screen bg-[#0b1120] text-slate-100">
      {/* Sidebar */}
      <aside className="hidden w-[260px] shrink-0 border-r border-slate-800 bg-[#0e192b] md:flex md:flex-col">
        <div className="flex h-[88px] items-center gap-3 border-b border-slate-800 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
            <Activity size={25} />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight">
              FORENSIC<span className="text-cyan-400">TRACK</span>
            </h1>
            <p className="text-[10px] tracking-[2px] text-slate-500">
              CASE MANAGEMENT
            </p>
          </div>
        </div>

        <div className="px-5 pt-8">
          <p className="mb-4 text-[11px] font-semibold tracking-[2px] text-slate-500">
            WORKSPACE
          </p>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = item.name === "Evidence";

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-4 rounded-lg px-4 py-4 text-sm transition ${
                    isActive
                      ? "border border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-slate-800 p-5">
          <p className="text-xs text-slate-500">Digital Forensics</p>
          <p className="mt-1 text-xs text-slate-600">
            Case Management System
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1">
        <header className="flex h-[88px] items-center justify-between border-b border-slate-800 bg-[#0e192b] px-6 md:px-9">
          <div>
            <p className="text-xs text-slate-500">Workspace / Evidence</p>
            <h2 className="mt-1 text-xl font-bold">Evidence Management</h2>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-300"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>
        </header>

        <div className="p-5 md:p-9">
          {/* Heading */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Forensic Evidence</h2>
              <p className="mt-2 text-sm text-slate-400">
                Review collected digital evidence and monitor integrity.
              </p>
            </div>

            <span className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-3 text-[11px] font-medium text-emerald-300">
              <Activity size={15} />
              LIVE MYSQL DATA
            </span>
          </div>

          {/* Statistics */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total Evidence", value: evidence.length, icon: Database },
              { label: "Verified", value: verified, icon: Fingerprint },
              { label: "Mismatched", value: mismatched, icon: ShieldAlert },
              { label: "Unverified", value: unverified, icon: AlertCircle },
            ].map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="rounded-xl border border-slate-800 bg-[#111e32] p-6"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">{stat.label}</p>
                    <Icon size={19} className="text-cyan-400" />
                  </div>
                  <p className="mt-5 text-3xl font-bold">
                    {loading ? "..." : stat.value}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Filters */}
          <section className="mb-6 rounded-xl border border-slate-800 bg-[#111e32] p-5">
            <div className="grid gap-4 md:grid-cols-[1fr_200px_200px_auto]">
              <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-[#0b1120] px-4">
                <Search size={18} className="text-slate-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search evidence code, case or description..."
                  className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-500"
                />
              </div>

              <select
                value={integrityFilter}
                onChange={(e) => setIntegrityFilter(e.target.value)}
                className="rounded-lg border border-slate-700 bg-[#0b1120] px-3 py-3 text-sm text-slate-300 outline-none"
              >
                <option value="ALL">All Integrity Statuses</option>
                <option value="VERIFIED">Verified</option>
                <option value="MISMATCH">Mismatch</option>
                <option value="UNVERIFIED">Unverified</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-lg border border-slate-700 bg-[#0b1120] px-3 py-3 text-sm text-slate-300 outline-none"
              >
                <option value="ALL">All Evidence Types</option>
                <option value="DISK_IMAGE">Disk Image</option>
                <option value="MOBILE_EXTRACTION">Mobile Extraction</option>
                <option value="LOG_FILE">Log File</option>
                <option value="BROWSER_DATA">Browser Data</option>
                <option value="MEMORY_DUMP">Memory Dump</option>
                <option value="DOCUMENT">Document</option>
                <option value="OTHER">Other</option>
              </select>

              <button
                onClick={fetchEvidence}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-3 text-sm text-cyan-300 hover:bg-slate-800 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </section>

          {/* Evidence list */}
          <section className="rounded-xl border border-slate-800 bg-[#111e32] p-5">
            <div className="mb-6">
              <h3 className="font-bold">All Evidence Records</h3>
              <p className="mt-1 text-xs text-slate-500">
                {filteredEvidence.length} matching records
              </p>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400">
                <RefreshCw className="mx-auto mb-3 animate-spin" size={25} />
                Loading evidence from MySQL...
              </div>
            ) : error ? (
              <div className="p-10 text-center">
                <AlertCircle className="mx-auto mb-3 text-red-400" size={28} />
                <p className="text-sm text-red-400">{error}</p>
                <button
                  onClick={fetchEvidence}
                  className="mt-4 text-sm text-cyan-300 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : filteredEvidence.length === 0 ? (
              <p className="p-12 text-center text-slate-500">
                No matching evidence records found.
              </p>
            ) : (
              <div className="space-y-4">
                {filteredEvidence.map((item) => (
                  <div
                    key={item.evidence_id}
                    className="rounded-xl border border-slate-800 bg-[#0e192b] p-5 transition hover:border-cyan-500/30"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium text-cyan-400">
                          {item.evidence_code}
                        </p>
                        <h4 className="mt-2 text-lg font-semibold">
                          {item.description}
                        </h4>
                        <p className="mt-2 text-sm text-slate-400">
                          {item.case_number} · {item.case_title}
                        </p>
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold ${integrityColor(item.integrity_status)}`}
                      >
                        {item.integrity_status}
                      </span>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-slate-800 pt-4 text-xs text-slate-400">
                      <span className="flex items-center gap-2">
                        <Database size={14} />
                        {item.evidence_type.replaceAll("_", " ")}
                      </span>

                      <span className="flex items-center gap-2">
                        <Users size={14} />
                        {item.collected_by_name || "Not assigned"}
                      </span>

                      <span className="flex items-center gap-2">
                        <Calendar size={14} />
                        {formatDate(item.collected_at)}
                      </span>

                      <button
                        onClick={() => setSelectedEvidence(item)}
                        className="ml-auto flex items-center gap-2 rounded-lg border border-cyan-500/30 px-4 py-2 text-xs font-medium text-cyan-300 hover:bg-cyan-500/10"
                      >
                        <Eye size={14} />
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <footer className="mt-8 border-t border-slate-800 pt-5 text-center text-xs text-slate-600">
            FORENSICTRACK · Digital Forensics Case Management System
          </footer>
        </div>
      </main>

      {/* Evidence details modal */}
      {selectedEvidence && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelectedEvidence(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-[#111e32] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-cyan-400">
                  {selectedEvidence.evidence_code}
                </p>
                <h2 className="mt-2 text-xl font-bold">
                  Evidence Details
                </h2>
              </div>

              <button
                onClick={() => setSelectedEvidence(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5">
              <span
                className={`rounded-full border px-3 py-1.5 text-xs ${integrityColor(selectedEvidence.integrity_status)}`}
              >
                {selectedEvidence.integrity_status}
              </span>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-xs text-slate-500">Description</p>
                <p className="mt-2 text-sm text-slate-200">
                  {selectedEvidence.description}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-500">Associated Case</p>
                  <p className="mt-2 text-sm">{selectedEvidence.case_number}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {selectedEvidence.case_title}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Evidence Type</p>
                  <p className="mt-2 text-sm">
                    {selectedEvidence.evidence_type.replaceAll("_", " ")}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Collected By</p>
                  <p className="mt-2 text-sm">
                    {selectedEvidence.collected_by_name || "Not assigned"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Collection Date</p>
                  <p className="mt-2 text-sm">
                    {formatDate(selectedEvidence.collected_at)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Acquisition Method</p>
                  <p className="mt-2 text-sm">
                    {selectedEvidence.acquisition_method}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Storage Location</p>
                  <p className="mt-2 break-all text-sm">
                    {selectedEvidence.storage_uri}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-[#0b1120] p-4">
                <p className="flex items-center gap-2 text-xs text-slate-500">
                  <Fingerprint size={14} />
                  SHA-256 Hash
                </p>
                <p className="mt-3 break-all font-mono text-xs leading-6 text-cyan-200">
                  {selectedEvidence.sha256}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedEvidence(null)}
              className="mt-6 w-full rounded-lg bg-cyan-600 py-3 text-sm font-semibold text-white hover:bg-cyan-500"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
