
"use client";

import { useEffect, useState } from "react";
import {
  FileBarChart,
  Search,
  ShieldAlert,
  Users,
  FolderOpen,
  Database,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

type ReportRow = Record<string, string | number | null>;

const reports = [
  {
    id: 1,
    title: "Evidence Summary by Case",
    description: "Evidence count and integrity status for each investigation.",
    icon: Database,
    endpoint: "/api/reports/evidence-summary",
    sql: "SELECT * FROM v_case_evidence_summary ORDER BY evidence_count DESC;",
  },
  {
    id: 2,
    title: "Cases by Status",
    description: "Distribution of investigations according to their current statuses.",
    icon: FolderOpen,
    endpoint: "/api/reports/case-by-status",
    sql: "SELECT status, COUNT(*) AS case_count FROM cases GROUP BY status ORDER BY case_count DESC;",
  },
  {
    id: 3,
    title: "Cases with Multiple Evidence",
    description: "Identifies investigations containing at least two evidence items.",
    icon: FileBarChart,
    endpoint: "/api/reports/multiple-evidence",
    sql: "SELECT c.case_number, c.title, COUNT(e.evidence_id) AS evidence_count FROM cases c JOIN evidence e ON e.case_id = c.case_id GROUP BY c.case_id, c.case_number, c.title HAVING COUNT(e.evidence_id) >= 2;",
  },
  {
    id: 4,
    title: "Investigator Workload",
    description: "Displays assigned cases and collected evidence per investigator.",
    icon: Users,
    endpoint: "/api/reports/investigator-workload",
    sql: "SELECT i.investigator_id, u.full_name, COUNT(DISTINCT ci.case_id) AS assigned_cases, COUNT(DISTINCT e.evidence_id) AS collected_evidence FROM investigators i JOIN users u ON u.user_id = i.user_id LEFT JOIN case_investigators ci ON ci.investigator_id = i.investigator_id LEFT JOIN evidence e ON e.collected_by = i.investigator_id GROUP BY i.investigator_id, u.full_name ORDER BY assigned_cases DESC;",
  },
  {
    id: 5,
    title: "Evidence Integrity Alerts",
    description: "Evidence records requiring integrity verification or investigation.",
    icon: ShieldAlert,
    endpoint: "/api/reports/integrity-alerts",
    sql: "SELECT e.evidence_code, c.case_number, e.integrity_status, e.sha256 FROM evidence e JOIN cases c ON c.case_id = e.case_id WHERE e.integrity_status IN ('UNVERIFIED','MISMATCH') ORDER BY CASE e.integrity_status WHEN 'MISMATCH' THEN 1 ELSE 2 END;",
  },
  {
    id: 6,
    title: "Unassigned Cases",
    description: "Finds investigations that have no assigned investigators.",
    icon: FolderOpen,
    endpoint: "/api/reports/unassigned-cases",
    sql: "SELECT c.case_number, c.title FROM cases c WHERE NOT EXISTS (SELECT 1 FROM case_investigators ci WHERE ci.case_id = c.case_id);",
  },
  {
    id: 7,
    title: "Full-Text Findings Search",
    description: "Searches forensic findings using MySQL full-text search.",
    icon: Search,
    endpoint: "/api/reports/findings-search",
    sql: "SELECT finding_id, finding_title, MATCH(finding_title, finding_text) AGAINST (? IN NATURAL LANGUAGE MODE) AS relevance FROM findings WHERE MATCH(finding_title, finding_text) AGAINST (? IN NATURAL LANGUAGE MODE) ORDER BY relevance DESC;",
  },
];

const columnLabels: Record<string, string> = {
  case_id: "Case ID",
  case_number: "Case Number",
  title: "Case Title",
  status: "Status",
  evidence_count: "Evidence Count",
  mismatched_items: "Mismatched Items",
  case_count: "Number of Cases",
  investigator_id: "Investigator ID",
  full_name: "Investigator",
  assigned_cases: "Assigned Cases",
  collected_evidence: "Collected Evidence",
  evidence_code: "Evidence Code",
  integrity_status: "Integrity Status",
  sha256: "SHA256 Hash",
  finding_id: "Finding ID",
  finding_title: "Finding Title",
  relevance: "Relevance",
};

export default function ReportsPage() {
  const [selected, setSelected] = useState(1);
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("transfer");

  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const report = reports.find((item) => item.id === selected)!;

  const filteredReports = reports.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  const fetchReport = async () => {
    setLoading(true);
    setApiError("");

    try {
      let url = report.endpoint;

      if (selected === 7) {
        url += `?q=${encodeURIComponent(searchTerm.trim() || "transfer")}`;
      }

      const response = await fetch(url, {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to retrieve report.");
      }

      setRows(result.data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Report fetching error:", error);
      setRows([]);
      setApiError(
        error instanceof Error
          ? error.message
          : "Unable to retrieve report from MySQL."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // Fetch again whenever the selected report or submitted search term changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const handleFindingsSearch = () => {
    if (selected === 7) {
      fetchReport();
    }
  };

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <main className="min-h-screen bg-[#0b1120] p-5 text-slate-100 md:p-8">
      <div className="mx-auto max-w-7xl">

        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-300"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        {/* Page heading */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-cyan-400">
              Database Analytics
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Investigation Reports
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Access and analyze reports generated directly from your MySQL database.
            </p>
          </div>

          <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
            LIVE MYSQL DATA
          </span>
        </div>

        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">

          {/* Reports sidebar */}
          <aside className="h-fit rounded-xl border border-slate-800 bg-[#111c30] p-4">

            <h2 className="mb-4 font-semibold">
              Available Reports
            </h2>

            <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-700 px-3">
              <Search size={16} className="text-slate-500" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reports..."
                className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              {filteredReports.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item.id)}
                    className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition ${
                      selected === item.id
                        ? "border border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                        : "text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    <Icon size={18} />

                    <span className="text-sm">
                      {item.title}
                    </span>
                  </button>
                );
              })}

              {filteredReports.length === 0 && (
                <p className="py-4 text-center text-xs text-slate-500">
                  No reports found.
                </p>
              )}
            </div>
          </aside>

          {/* Report content */}
          <section className="min-w-0 rounded-xl border border-slate-800 bg-[#111c30] p-5 md:p-6">

            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs text-cyan-400">
                  REPORT {report.id} OF 7
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  {report.title}
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  {report.description}
                </p>
              </div>

              <button
                onClick={fetchReport}
                disabled={loading}
                title="Refresh report"
                className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-cyan-500/40 hover:text-cyan-300 disabled:opacity-50"
              >
                <RefreshCw
                  size={20}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>

            {/* SQL query */}
            <div className="mt-6">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                SQL Query
              </h3>

              <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-slate-800 bg-[#0b1120] p-4 text-xs leading-6 text-cyan-200">
                {report.sql}
              </pre>
            </div>

            {/* Full-text search */}
            {selected === 7 && (
              <div className="mt-6">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Search Forensic Findings
                </label>

                <div className="flex flex-wrap gap-2">
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleFindingsSearch();
                    }}
                    placeholder="Enter keyword, e.g. transfer"
                    className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-[#0b1120] px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                  />

                  <button
                    onClick={handleFindingsSearch}
                    disabled={loading || !searchTerm.trim()}
                    className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-50"
                  >
                    <Search size={16} />
                    Search
                  </button>
                </div>
              </div>
            )}

            {/* Report results */}
            <div className="mt-7 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">
                Report Results
              </h3>

              <span className="text-xs text-slate-500">
                {rows.length} live records
              </span>
            </div>

            <div className="mt-4 overflow-x-auto rounded-lg border border-slate-800">

              {loading ? (
                <p className="p-8 text-center text-slate-400">
                  Loading live MySQL report...
                </p>
              ) : apiError ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-red-400">
                    {apiError}
                  </p>
                  <button
                    onClick={fetchReport}
                    className="mt-3 text-xs text-cyan-300 hover:underline"
                  >
                    Try again
                  </button>
                </div>
              ) : rows.length === 0 ? (
                <p className="p-10 text-center text-slate-500">
                  No matching records found in the database.
                </p>
              ) : (
                <table className="w-full min-w-max text-left text-sm">
                  <thead className="bg-slate-900 text-xs text-slate-400">
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column}
                          className="px-4 py-3 font-medium"
                        >
                          {columnLabels[column] || column}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((row, index) => (
                      <tr
                        key={index}
                        className="border-t border-slate-800 transition hover:bg-slate-800/40"
                      >
                        {columns.map((column) => {
                          const value = row[column];

                          const isMismatch =
                            column === "integrity_status" &&
                            value === "MISMATCH";

                          const isUnverified =
                            column === "integrity_status" &&
                            value === "UNVERIFIED";

                          return (
                            <td
                              key={column}
                              className={`px-4 py-4 ${
                                isMismatch
                                  ? "font-semibold text-red-400"
                                  : isUnverified
                                  ? "font-semibold text-amber-400"
                                  : "text-slate-300"
                              }`}
                            >
                              {value === null ? "—" : String(value)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

            </div>

            {/* Live status */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-emerald-400">
                LIVE DATA · Retrieved directly from MySQL
              </p>

              {lastUpdated && (
                <p className="text-xs text-slate-500">
                  Last updated: {lastUpdated}
                </p>
              )}
            </div>

          </section>
        </div>

        <footer className="mt-8 border-t border-slate-800 pt-5 text-center text-xs text-slate-600">
          Digital Forensics Case Management System · DBMS Level 3 Project
        </footer>

      </div>
    </main>
  );
}
