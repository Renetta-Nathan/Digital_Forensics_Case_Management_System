"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FolderOpen,
  Database,
  Activity,
  Monitor,
  FileText,
  Search,
  RefreshCw,
  ShieldCheck,
  ArrowRightLeft,
  Clock,
  X,
} from "lucide-react";

type CustodyRecord = {
  custody_id: number;
  evidence_id: number;
  evidence_code: string;
  case_number: string;
  evidence_description: string;
  from_handler: string | null;
  to_handler: string | null;
  action: string;
  event_time: string;
  seal_number: string | null;
  remarks: string | null;
  recorded_by: number;
  recorded_by_name: string | null;
};

const navigation = [
  { name: "Overview", icon: LayoutDashboard, href: "/" },
  { name: "Cases", icon: FolderOpen, href: "/cases" },
  { name: "Evidence", icon: Database, href: "/evidence" },
  { name: "Chain of Custody", icon: Activity, href: "/chain-of-custody" },
  { name: "Devices", icon: Monitor, href: "/reports" },
  { name: "Findings & Notes", icon: FileText, href: "/reports" },
  { name: "Reports", icon: FileText, href: "/reports" },
];

const actionColors: Record<string, string> = {
  COLLECTED: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  TRANSFERRED: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  ACCESSED: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  SEALED: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  UNSEALED: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  RETURNED: "text-green-400 bg-green-400/10 border-green-400/20",
  DISPOSED: "text-red-400 bg-red-400/10 border-red-400/20",
};

function formatDate(value: string) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChainOfCustodyPage() {
  const [records, setRecords] = useState<CustodyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [selectedRecord, setSelectedRecord] =
    useState<CustodyRecord | null>(null);

  async function fetchRecords() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/chain-of-custody", {
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load records");
      }

      setRecords(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRecords();
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        record.evidence_code?.toLowerCase().includes(searchText) ||
        record.case_number?.toLowerCase().includes(searchText) ||
        record.action?.toLowerCase().includes(searchText) ||
        record.from_handler?.toLowerCase().includes(searchText) ||
        record.to_handler?.toLowerCase().includes(searchText);

      const matchesAction =
        actionFilter === "ALL" || record.action === actionFilter;

      return matchesSearch && matchesAction;
    });
  }, [records, search, actionFilter]);

  const uniqueEvidence = new Set(
    records.map((record) => record.evidence_id)
  ).size;

  const uniqueActions = new Set(
    records.map((record) => record.action)
  ).size;

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-200 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-slate-800 bg-[#0e192b]">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white">
            Forensic<span className="text-cyan-400">Track</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Digital Forensics Management
          </p>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/chain-of-custody";

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition ${
                  active
                    ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-5 border-t border-slate-800">
          <p className="text-xs text-slate-500">
            Digital Forensics Case Management System
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-5 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-sm text-cyan-400 mb-2">
                FORENSIC OPERATIONS / CHAIN OF CUSTODY
              </p>
              <h2 className="text-3xl font-bold text-white">
                Chain of Custody
              </h2>
              <p className="text-slate-400 mt-2">
                Track the handling and transfer history of digital evidence.
              </p>
            </div>

            <button
              onClick={fetchRecords}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold transition"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#111e32] border border-slate-800 rounded-xl p-5">
              <p className="text-sm text-slate-400">Total Custody Events</p>
              <p className="text-3xl font-bold text-white mt-2">
                {records.length}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Recorded handling events
              </p>
            </div>

            <div className="bg-[#111e32] border border-slate-800 rounded-xl p-5">
              <p className="text-sm text-slate-400">Evidence Tracked</p>
              <p className="text-3xl font-bold text-cyan-400 mt-2">
                {uniqueEvidence}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Unique evidence items
              </p>
            </div>

            <div className="bg-[#111e32] border border-slate-800 rounded-xl p-5">
              <p className="text-sm text-slate-400">Event Types</p>
              <p className="text-3xl font-bold text-purple-400 mt-2">
                {uniqueActions}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Different custody actions
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-[#111e32] border border-slate-800 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search evidence code, case, handler..."
                className="w-full bg-[#0b1120] border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              />
            </div>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-[#0b1120] border border-slate-700 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Actions</option>
              {[
                "COLLECTED",
                "TRANSFERRED",
                "ACCESSED",
                "SEALED",
                "UNSEALED",
                "RETURNED",
                "DISPOSED",
              ].map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>

          {/* Records */}
          <div className="bg-[#111e32] border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-white">
                  Custody History
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {filteredRecords.length} of {records.length} records
                </p>
              </div>
              <ShieldCheck className="text-cyan-400" size={22} />
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400">
                Loading custody records...
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={fetchRecords}
                  className="text-cyan-400 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                No custody records match your search.
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {filteredRecords.map((record) => (
                  <button
                    key={record.custody_id}
                    onClick={() => setSelectedRecord(record)}
                    className="w-full text-left p-5 hover:bg-slate-800/40 transition"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-cyan-400/10 text-cyan-400">
                          <ArrowRightLeft size={20} />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="font-semibold text-white">
                              {record.evidence_code}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full border ${
                                actionColors[record.action] ||
                                "text-slate-300 bg-slate-700/30 border-slate-600"
                              }`}
                            >
                              {record.action}
                            </span>
                          </div>

                          <p className="text-sm text-slate-400">
                            Case: {record.case_number || "—"}
                          </p>

                          <p className="text-sm text-slate-400 mt-1">
                            {record.from_handler || "—"} →{" "}
                            {record.to_handler || "—"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Clock size={15} />
                        {formatDate(record.event_time)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#111e32] border border-slate-700 rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs text-cyan-400 mb-2">
                  CUSTODY EVENT #{selectedRecord.custody_id}
                </p>
                <h3 className="text-2xl font-bold text-white">
                  {selectedRecord.action}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {selectedRecord.evidence_code}
                </p>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-white p-2"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ["Case Number", selectedRecord.case_number],
                ["Evidence Code", selectedRecord.evidence_code],
                ["Evidence Description", selectedRecord.evidence_description],
                ["From Handler", selectedRecord.from_handler],
                ["To Handler", selectedRecord.to_handler],
                ["Recorded By", selectedRecord.recorded_by_name],
                ["Event Time", formatDate(selectedRecord.event_time)],
                ["Seal Number", selectedRecord.seal_number],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="bg-[#0b1120] rounded-lg p-4 border border-slate-800"
                >
                  <p className="text-xs text-slate-500 mb-2">{label}</p>
                  <p className="text-sm text-white break-words">
                    {value || "—"}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-[#0b1120] rounded-lg p-4 border border-slate-800">
              <p className="text-xs text-slate-500 mb-2">Remarks</p>
              <p className="text-sm text-white">
                {selectedRecord.remarks || "No remarks recorded."}
              </p>
            </div>

            <button
              onClick={() => setSelectedRecord(null)}
              className="mt-6 w-full py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}