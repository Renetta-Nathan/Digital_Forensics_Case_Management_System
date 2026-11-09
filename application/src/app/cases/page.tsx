
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
} from "lucide-react";

interface Case {
  case_id: number;
  case_number: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  opened_date: string;
  closed_date: string | null;
  created_by_name: string;
  evidence_count: number;
  investigator_count: number;
}

const navigation = [
  { name: "Overview", icon: LayoutDashboard, href: "/" },
  { name: "Cases", icon: FolderOpen, href: "/cases" },
  { name: "Evidence", icon: Database, href: "/reports" },
  { name: "Chain of Custody", icon: Activity, href: "/reports" },
  { name: "Devices", icon: Monitor, href: "/reports" },
  { name: "Findings & Notes", icon: FileText, href: "/reports" },
  { name: "Reports", icon: FileText, href: "/reports" },
];

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  const fetchCases = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/cases", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to retrieve cases.");
      }

      setCases(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to retrieve cases."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const filteredCases = useMemo(() => {
    return cases.filter((item) => {
      const matchesSearch =
        item.case_number.toLowerCase().includes(search.toLowerCase()) ||
        item.title.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" || item.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [cases, search, statusFilter, priorityFilter]);

  const statusColor = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";
      case "OPEN":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
      case "CLOSED":
        return "border-slate-600 bg-slate-700/30 text-slate-300";
      case "ON_HOLD":
        return "border-amber-500/30 bg-amber-500/10 text-amber-300";
      default:
        return "border-slate-700 text-slate-400";
    }
  };

  const priorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "text-red-400";
      case "HIGH":
        return "text-orange-400";
      case "MEDIUM":
        return "text-amber-400";
      case "LOW":
        return "text-emerald-400";
      default:
        return "text-slate-400";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const activeCases = cases.filter(
    (item) => item.status === "OPEN" || item.status === "IN_PROGRESS"
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
              const isActive = item.name === "Cases";

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
            <p className="text-xs text-slate-500">Workspace / Cases</p>
            <h2 className="mt-1 text-xl font-bold">Case Management</h2>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyan-300"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>
        </header>

        <div className="p-5 md:p-9">
          {/* Heading */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Investigation Cases</h2>
              <p className="mt-2 text-sm text-slate-400">
                View and track all registered forensic investigations.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-3 text-[11px] font-medium text-emerald-300">
              <Activity size={15} />
              LIVE MYSQL DATA
            </div>
          </div>

          {/* Statistics */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Total Cases",
                value: cases.length,
                icon: FolderOpen,
              },
              {
                label: "Active Cases",
                value: activeCases,
                icon: Activity,
              },
              {
                label: "Closed Cases",
                value: cases.filter((item) => item.status === "CLOSED").length,
                icon: ShieldAlert,
              },
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

          {/* Search and filters */}
          <section className="mb-6 rounded-xl border border-slate-800 bg-[#111e32] p-5">
            <div className="grid gap-4 md:grid-cols-[1fr_200px_200px_auto]">
              <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-[#0b1120] px-4">
                <Search size={18} className="text-slate-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by case number or title..."
                  className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-700 bg-[#0b1120] px-3 py-3 text-sm text-slate-300 outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="CLOSED">Closed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="rounded-lg border border-slate-700 bg-[#0b1120] px-3 py-3 text-sm text-slate-300 outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              <button
                onClick={fetchCases}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-3 text-sm text-cyan-300 transition hover:bg-slate-800 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </section>

          {/* Cases list */}
          <section className="rounded-xl border border-slate-800 bg-[#111e32] p-5">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold">All Investigations</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {filteredCases.length} matching records
                </p>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400">
                <RefreshCw className="mx-auto mb-3 animate-spin" size={25} />
                Loading cases from MySQL...
              </div>
            ) : error ? (
              <div className="p-10 text-center">
                <AlertCircle className="mx-auto mb-3 text-red-400" size={28} />
                <p className="text-sm text-red-400">{error}</p>
                <button
                  onClick={fetchCases}
                  className="mt-4 text-sm text-cyan-300 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No matching cases found.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCases.map((item) => (
                  <div
                    key={item.case_id}
                    className="rounded-xl border border-slate-800 bg-[#0e192b] p-5 transition hover:border-cyan-500/30"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-cyan-400">
                          {item.case_number}
                        </p>
                        <h4 className="mt-2 text-lg font-semibold">
                          {item.title}
                        </h4>
                        <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                          {item.description}
                        </p>
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold ${statusColor(item.status)}`}
                      >
                        {item.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-slate-800 pt-4 text-xs">
                      <span className="flex items-center gap-2 text-slate-400">
                        <AlertCircle size={14} />
                        Priority:
                        <strong className={priorityColor(item.priority)}>
                          {item.priority}
                        </strong>
                      </span>

                      <span className="flex items-center gap-2 text-slate-400">
                        <Database size={14} />
                        {item.evidence_count} Evidence
                      </span>

                      <span className="flex items-center gap-2 text-slate-400">
                        <Users size={14} />
                        {item.investigator_count} Investigators
                      </span>

                      <span className="flex items-center gap-2 text-slate-400">
                        <Calendar size={14} />
                        {formatDate(item.opened_date)}
                      </span>

                      <button
                        onClick={() => setSelectedCase(item)}
                        className="ml-auto flex items-center gap-2 rounded-lg border border-cyan-500/30 px-4 py-2 text-xs font-medium text-cyan-300 transition hover:bg-cyan-500/10"
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

      {/* Case details modal */}
      {selectedCase && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelectedCase(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-[#111e32] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-cyan-400">
                  {selectedCase.case_number}
                </p>
                <h2 className="mt-2 text-xl font-bold">
                  {selectedCase.title}
                </h2>
              </div>

              <button
                onClick={() => setSelectedCase(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span
                className={`rounded-full border px-3 py-1.5 text-xs ${statusColor(selectedCase.status)}`}
              >
                {selectedCase.status.replace("_", " ")}
              </span>

              <span
                className={`rounded-full border border-slate-700 px-3 py-1.5 text-xs ${priorityColor(selectedCase.priority)}`}
              >
                {selectedCase.priority} PRIORITY
              </span>
            </div>

            <div className="mt-6">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Case Description
              </h3>
              <p className="text-sm leading-7 text-slate-300">
                {selectedCase.description}
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-800 bg-[#0b1120] p-4">
                <p className="text-xs text-slate-500">Opened Date</p>
                <p className="mt-2 text-sm font-medium">
                  {formatDate(selectedCase.opened_date)}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-[#0b1120] p-4">
                <p className="text-xs text-slate-500">Closed Date</p>
                <p className="mt-2 text-sm font-medium">
                  {selectedCase.closed_date
                    ? formatDate(selectedCase.closed_date)
                    : "Not closed"}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-[#0b1120] p-4">
                <p className="text-xs text-slate-500">Evidence Items</p>
                <p className="mt-2 text-sm font-medium">
                  {selectedCase.evidence_count}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-[#0b1120] p-4">
                <p className="text-xs text-slate-500">Assigned Investigators</p>
                <p className="mt-2 text-sm font-medium">
                  {selectedCase.investigator_count}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-slate-800 bg-[#0b1120] p-4">
              <p className="text-xs text-slate-500">Created By</p>
              <p className="mt-2 text-sm font-medium">
                {selectedCase.created_by_name}
              </p>
            </div>

            <button
              onClick={() => setSelectedCase(null)}
              className="mt-6 w-full rounded-lg bg-cyan-600 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
