
"use client";
import { useEffect, useState } from "react";
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
  ArrowRight,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

const navigation = [
  { name: "Overview", icon: LayoutDashboard, href: "/" },
  { name: "Cases", icon: FolderOpen, href: "/cases" },
  { name: "Evidence", icon: Database, href: "/evidence" },
  { name: "Chain of Custody", icon: Activity, href: "/chain-of-custody" },
  { name: "Devices", icon: Monitor, href: "/devices" },
  { name: "Findings & Notes", icon: FileText, href: "/folders" },
  { name: "Reports", icon: FileText, href: "/reports" },
];

const investigations = [
  {
    title: "Suspicious Data Exfiltration",
    number: "DF-2026-001",
    status: "IN PROGRESS",
    priority: "HIGH",
    evidence: 2,
  },
  {
    title: "Account Compromise Review",
    number: "DF-2026-002",
    status: "OPEN",
    priority: "MEDIUM",
    evidence: 1,
  },
  {
    title: "Lost Device Investigation",
    number: "DF-2026-003",
    status: "CLOSED",
    priority: "HIGH",
    evidence: 1,
  },
  {
    title: "Browser Artifact Review",
    number: "DF-2026-004",
    status: "ON HOLD",
    priority: "LOW",
    evidence: 1,
  },
];
interface DashboardData {
  cases: {
    totalCases: number;
  };
  evidence: {
    totalEvidence: number;
    verified: number;
    mismatch: number;
    unverified: number;
  };
  investigators: {
    totalInvestigators: number;
  };
  recentCases: {
    case_id: number;
    case_number: string;
    title: string;
    status: string;
    priority: string;
    evidence_count: number;
  }[];
}
export default function Home() {
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await fetch("/api/dashboard");

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Dashboard request failed");
        }

        setDashboard(result.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);
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
            {navigation.map((item, index) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-4 rounded-lg px-4 py-4 text-sm transition ${
                    index === 0
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
          <p className="text-xs text-slate-500">
            Digital Forensics
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Case Management System
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1">

        {/* Top navigation */}
        <header className="flex h-[88px] items-center justify-between border-b border-slate-800 bg-[#0e192b] px-6 md:px-9">
          <div>
            <p className="text-xs text-slate-500">
              Workspace / Overview
            </p>
            <h2 className="mt-1 text-xl font-bold">
              Investigation Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">Administrator</p>
              <p className="text-xs text-slate-500">System Admin</p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10 font-semibold text-cyan-300">
              A
            </div>
          </div>
        </header>

        <div className="p-5 md:p-9">

          {/* Welcome */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">
                Good morning, Administrator
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Here is an overview of your forensic investigations.
              </p>
            </div>

            <span className="rounded-lg border border-amber-500/30 px-3 py-3 text-[11px] font-medium text-amber-400">
              LIVE MYSQL DATA · DASHBOARD SUMMARY
            </span>
          </div>

          {/* Statistics */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {
[
  {
    label: "Total Cases",
    value: dashboard ? String(dashboard.cases.totalCases).padStart(2, "0") : loading ? "..." : "0",
    description: "Registered investigations",
    icon: FolderOpen,
  },
  {
    label: "Evidence Items",
    value: dashboard ? String(dashboard.evidence.totalEvidence).padStart(2, "0") : loading ? "..." : "0",
    description: "Across all cases",
    icon: Database,
  },
  {
    label: "Investigators",
    value: dashboard ? String(dashboard.investigators.totalInvestigators).padStart(2, "0") : loading ? "..." : "0",
    description: "Registered investigators",
    icon: Users,
  },
  {
    label: "Integrity Alerts",
    value: dashboard
      ? String(
          Number(dashboard.evidence.mismatch || 0) +
          Number(dashboard.evidence.unverified || 0)
        ).padStart(2, "0")
      : loading ? "..." : "0",
    description: "Requires attention",
    icon: ShieldAlert,
  },
]
.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="rounded-xl border border-slate-800 bg-[#111e32] p-6"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">
                      {stat.label}
                    </p>
                    <Icon size={19} className="text-cyan-400" />
                  </div>

                  <p className="mt-6 text-3xl font-bold">
                    {stat.value}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    {stat.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Recent investigations and integrity */}
          <div className="grid gap-5 xl:grid-cols-[1.7fr_0.9fr]">

            {/* Investigations */}
            <section className="rounded-xl border border-slate-800 bg-[#111e32] p-5">

              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold">
                    Recent Investigations
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Latest registered forensic cases
                  </p>
                </div>

                <Link
                  href="/reports"
                  className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-cyan-300 transition hover:bg-slate-800"
                >
                  View reports <ArrowRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-[minmax(130px,2fr)_1fr_0.8fr_0.5fr] gap-2 border-b border-slate-800 pb-3 text-[10px] font-medium text-slate-500 sm:text-xs">
                <span>CASE</span>
                <span>STATUS</span>
                <span>PRIORITY</span>
                <span>EVIDENCE</span>
              </div>

              
{(dashboard?.recentCases ?? []).map((item) => (
  <div
    key={item.case_id}
    className="grid grid-cols-[minmax(130px,2fr)_1fr_0.8fr_0.5fr] items-center gap-2 border-b border-slate-800/80 py-5 last:border-0"
  >
    <div className="min-w-0">
      <p className="truncate text-sm font-medium">
        {item.title}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {item.case_number}
      </p>
    </div>

    <span className="w-fit rounded-full bg-cyan-500/10 px-2 py-1 text-[9px] font-semibold text-cyan-300 sm:text-[10px]">
      {item.status.replace("_", " ")}
    </span>

    <span className="text-xs text-slate-400">
      {item.priority}
    </span>

    <span className="text-sm text-slate-300">
      {item.evidence_count}
    </span>
  </div>
))}


              <Link
                href="/reports"
                className="mt-5 flex items-center justify-center gap-2 rounded-lg border border-slate-700 py-3 text-sm text-cyan-300 hover:bg-slate-800"
              >
                Explore database reports <ArrowRight size={16} />
              </Link>
            </section>


            
{/* Evidence integrity */}
<section className="rounded-xl border border-slate-800 bg-[#111e32] p-5">

  <h3 className="font-bold">
    Evidence Integrity
  </h3>

  <p className="mt-1 text-xs text-slate-500">
    Current integrity overview
  </p>

  {(() => {
    const verified = Number(dashboard?.evidence.verified ?? 0);
    const mismatch = Number(dashboard?.evidence.mismatch ?? 0);
    const unverified = Number(dashboard?.evidence.unverified ?? 0);
    const total = Number(dashboard?.evidence.totalEvidence ?? 0);

    const alerts = mismatch + unverified;
    const denominator = Math.max(total, 1);

    return (
      <>
        <div className="my-8 flex justify-center">
          <div className="flex h-36 w-36 items-center justify-center rounded-full border-[10px] border-amber-500">
            <div className="text-center">
              <p className="text-3xl font-bold">
                {loading ? "..." : alerts}
              </p>
              <p className="text-[10px] text-slate-500">
                ALERTS
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">

          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-slate-400">Verified</span>
              <span className="font-semibold text-emerald-400">
                {loading ? "..." : verified}
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{
                  width: `${(verified / denominator) * 100}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-slate-400">Mismatch</span>
              <span className="font-semibold text-red-400">
                {loading ? "..." : mismatch}
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-red-500"
                style={{
                  width: `${(mismatch / denominator) * 100}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-slate-400">Unverified</span>
              <span className="font-semibold text-amber-400">
                {loading ? "..." : unverified}
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-amber-500"
                style={{
                  width: `${(unverified / denominator) * 100}%`,
                }}
              />
            </div>
          </div>

        </div>
      </>
    );
  })()}

  <Link
    href="/reports"
    className="mt-8 flex items-center justify-center gap-2 rounded-lg border border-slate-700 py-3 text-sm text-cyan-300 hover:bg-slate-800"
  >
    <ShieldAlert size={16} />
    View integrity alerts
  </Link>
</section>

          </div>

          {/* Footer */}
          <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-5 text-xs text-slate-600">
            <span>FORENSICTRACK · Digital Forensics Case Management</span>
            <span className="flex items-center gap-2">
              <Clock size={13} />
              Investigation Workspace
            </span>
          </footer>

        </div>
      </main>
    </div>
  );
}
