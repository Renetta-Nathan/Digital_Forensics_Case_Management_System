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
  X,
  ClipboardList,
  MessageSquareText,
} from "lucide-react";

type Finding = {
  finding_id: number;
  case_id: number;
  case_number: string;
  case_title: string;
  evidence_id: number | null;
  evidence_code: string | null;
  investigator_id: number;
  investigator_name: string;
  finding_title: string;
  finding_text: string;
  confidence: string;
  found_at: string;
};

type Note = {
  note_id: number;
  case_id: number;
  case_number: string;
  case_title: string;
  investigator_id: number;
  investigator_name: string;
  note_text: string;
  created_at: string;
};

const navigation = [
  { name: "Overview", icon: LayoutDashboard, href: "/" },
  { name: "Cases", icon: FolderOpen, href: "/cases" },
  { name: "Evidence", icon: Database, href: "/evidence" },
  { name: "Chain of Custody", icon: Activity, href: "/chain-of-custody" },
  { name: "Devices", icon: Monitor, href: "/devices" },
  { name: "Findings & Notes", icon: FileText, href: "/findings" },
  { name: "Reports", icon: FileText, href: "/reports" },
];

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

const confidenceColors: Record<string, string> = {
  HIGH: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  MEDIUM: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  LOW: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function FindingsPage() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"findings" | "notes">("findings");
  const [search, setSearch] = useState("");
  const [confidenceFilter, setConfidenceFilter] = useState("ALL");
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  async function fetchData() {
    try {
      setLoading(true);
      setError("");

      const [findingsResponse, notesResponse] = await Promise.all([
        fetch("/api/findings", { cache: "no-store" }),
        fetch("/api/notes", { cache: "no-store" }),
      ]);

      const findingsResult = await findingsResponse.json();
      const notesResult = await notesResponse.json();

      if (!findingsResponse.ok || !findingsResult.success) {
        throw new Error("Failed to load findings");
      }

      if (!notesResponse.ok || !notesResult.success) {
        throw new Error("Failed to load notes");
      }

      setFindings(findingsResult.data);
      setNotes(notesResult.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const filteredFindings = useMemo(() => {
    return findings.filter((finding) => {
      const text = search.toLowerCase();

      const matchesSearch =
        finding.finding_title?.toLowerCase().includes(text) ||
        finding.finding_text?.toLowerCase().includes(text) ||
        finding.case_number?.toLowerCase().includes(text) ||
        finding.evidence_code?.toLowerCase().includes(text) ||
        finding.investigator_name?.toLowerCase().includes(text);

      const matchesConfidence =
        confidenceFilter === "ALL" ||
        finding.confidence === confidenceFilter;

      return matchesSearch && matchesConfidence;
    });
  }, [findings, search, confidenceFilter]);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const text = search.toLowerCase();

      return (
        note.note_text?.toLowerCase().includes(text) ||
        note.case_number?.toLowerCase().includes(text) ||
        note.case_title?.toLowerCase().includes(text) ||
        note.investigator_name?.toLowerCase().includes(text)
      );
    });
  }, [notes, search]);

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
            const active = item.href === "/findings";

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
                FORENSIC OPERATIONS / INVESTIGATION RECORDS
              </p>
              <h2 className="text-3xl font-bold text-white">
                Findings & Notes
              </h2>
              <p className="text-slate-400 mt-2">
                Review investigation findings and investigator observations.
              </p>
            </div>

            <button
              onClick={fetchData}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold transition"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#111e32] border border-slate-800 rounded-xl p-5">
              <p className="text-sm text-slate-400">Total Findings</p>
              <p className="text-3xl font-bold text-white mt-2">
                {findings.length}
              </p>
            </div>

            <div className="bg-[#111e32] border border-slate-800 rounded-xl p-5">
              <p className="text-sm text-slate-400">High Confidence</p>
              <p className="text-3xl font-bold text-emerald-400 mt-2">
                {findings.filter((f) => f.confidence === "HIGH").length}
              </p>
            </div>

            <div className="bg-[#111e32] border border-slate-800 rounded-xl p-5">
              <p className="text-sm text-slate-400">Investigator Notes</p>
              <p className="text-3xl font-bold text-cyan-400 mt-2">
                {notes.length}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 border-b border-slate-800 mb-6">
            <button
              onClick={() => {
                setActiveTab("findings");
                setSearch("");
              }}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition ${
                activeTab === "findings"
                  ? "border-cyan-400 text-cyan-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <ClipboardList size={17} />
              Findings ({findings.length})
            </button>

            <button
              onClick={() => {
                setActiveTab("notes");
                setSearch("");
              }}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition ${
                activeTab === "notes"
                  ? "border-cyan-400 text-cyan-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <MessageSquareText size={17} />
              Investigator Notes ({notes.length})
            </button>
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
                placeholder={
                  activeTab === "findings"
                    ? "Search findings, cases, evidence or investigators..."
                    : "Search notes, cases or investigators..."
                }
                className="w-full bg-[#0b1120] border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              />
            </div>

            {activeTab === "findings" && (
              <select
                value={confidenceFilter}
                onChange={(e) => setConfidenceFilter(e.target.value)}
                className="bg-[#0b1120] border border-slate-700 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              >
                <option value="ALL">All Confidence Levels</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            )}
          </div>

          {/* Content */}
          <div className="bg-[#111e32] border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate-800">
              <h3 className="font-semibold text-white">
                {activeTab === "findings"
                  ? "Recorded Findings"
                  : "Investigator Notes"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {activeTab === "findings"
                  ? `${filteredFindings.length} of ${findings.length} findings`
                  : `${filteredNotes.length} of ${notes.length} notes`}
              </p>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400">
                Loading investigation records...
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={fetchData}
                  className="text-cyan-400 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : activeTab === "findings" ? (
              filteredFindings.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  No findings match your search.
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {filteredFindings.map((finding) => (
                    <button
                      key={finding.finding_id}
                      onClick={() => setSelectedFinding(finding)}
                      className="w-full text-left p-5 hover:bg-slate-800/40 transition"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-white">
                            {finding.finding_title}
                          </h4>
                          <p className="text-sm text-slate-400 mt-2 line-clamp-2">
                            {finding.finding_text}
                          </p>
                          <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
                            <span>Case: {finding.case_number}</span>
                            <span>
                              Evidence: {finding.evidence_code || "—"}
                            </span>
                            <span>
                              Investigator: {finding.investigator_name}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                          <span
                            className={`text-xs px-3 py-1 rounded-full border ${
                              confidenceColors[finding.confidence] ||
                              "text-slate-300 bg-slate-700/30 border-slate-600"
                            }`}
                          >
                            {finding.confidence} CONFIDENCE
                          </span>
                          <span className="text-xs text-slate-500">
                            {formatDate(finding.found_at)}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )
            ) : filteredNotes.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                No notes match your search.
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {filteredNotes.map((note) => (
                  <button
                    key={note.note_id}
                    onClick={() => setSelectedNote(note)}
                    className="w-full text-left p-5 hover:bg-slate-800/40 transition"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-white line-clamp-3">
                          {note.note_text}
                        </p>
                        <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
                          <span>Case: {note.case_number}</span>
                          <span>Investigator: {note.investigator_name}</span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 shrink-0">
                        {formatDate(note.created_at)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Finding Details Modal */}
      {selectedFinding && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#111e32] border border-slate-700 rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs text-cyan-400 mb-2">
                  FINDING #{selectedFinding.finding_id}
                </p>
                <h3 className="text-xl font-bold text-white">
                  {selectedFinding.finding_title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedFinding(null)}
                className="text-slate-400 hover:text-white p-2"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {[
                ["Case", selectedFinding.case_number],
                ["Case Title", selectedFinding.case_title],
                ["Evidence", selectedFinding.evidence_code],
                ["Investigator", selectedFinding.investigator_name],
                ["Confidence", selectedFinding.confidence],
                ["Found At", formatDate(selectedFinding.found_at)],
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

            <div className="bg-[#0b1120] rounded-lg p-4 border border-slate-800">
              <p className="text-xs text-slate-500 mb-2">Finding Details</p>
              <p className="text-sm text-white whitespace-pre-wrap">
                {selectedFinding.finding_text}
              </p>
            </div>

            <button
              onClick={() => setSelectedFinding(null)}
              className="mt-6 w-full py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Note Details Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#111e32] border border-slate-700 rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs text-cyan-400 mb-2">
                  INVESTIGATOR NOTE #{selectedNote.note_id}
                </p>
                <h3 className="text-xl font-bold text-white">
                  {selectedNote.case_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNote(null)}
                className="text-slate-400 hover:text-white p-2"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {[
                ["Case Title", selectedNote.case_title],
                ["Investigator", selectedNote.investigator_name],
                ["Created At", formatDate(selectedNote.created_at)],
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

            <div className="bg-[#0b1120] rounded-lg p-4 border border-slate-800">
              <p className="text-xs text-slate-500 mb-2">Note Content</p>
              <p className="text-sm text-white whitespace-pre-wrap">
                {selectedNote.note_text}
              </p>
            </div>

            <button
              onClick={() => setSelectedNote(null)}
              className="mt-6 w-full py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}