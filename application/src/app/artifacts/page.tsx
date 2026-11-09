
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Database,
  Globe,
  HardDrive,
  Cpu,
  Search,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

interface Artifact {
  _id: string;
  caseNumber: string;
  evidenceCode: string;
  artifactType: string;
  collectedAt: string;
  analyzedBy: string;
  metadata: Record<string, unknown>;
  tags: string[];
}

export default function ArtifactsPage() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  async function fetchArtifacts() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/artifacts");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load artifacts");
      }

      setArtifacts(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchArtifacts();
  }, []);

  const filteredArtifacts = artifacts.filter((artifact) => {
    const matchesType =
      filter === "all" || artifact.artifactType === filter;

    const searchText = search.toLowerCase();

    const matchesSearch =
      artifact.evidenceCode.toLowerCase().includes(searchText) ||
      artifact.caseNumber.toLowerCase().includes(searchText) ||
      artifact.artifactType.toLowerCase().includes(searchText) ||
      JSON.stringify(artifact.metadata).toLowerCase().includes(searchText);

    return matchesType && matchesSearch;
  });

  function getIcon(type: string) {
    switch (type) {
      case "browser":
        return <Globe size={22} />;
      case "filesystem":
        return <HardDrive size={22} />;
      case "memory":
        return <Cpu size={22} />;
      default:
        return <Database size={22} />;
    }
  }

  return (
    <main className="min-h-screen bg-[#0b1120] p-6 text-white sm:p-10">

      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-300"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-cyan-400">
            MONGODB FORENSIC STORAGE
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Forensic Artifacts
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Explore browser, filesystem and memory artifacts stored in MongoDB.
          </p>
        </div>

        <button
          onClick={fetchArtifacts}
          className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-3 text-sm text-cyan-300 hover:bg-slate-800"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total Artifacts",
            value: artifacts.length,
          },
          {
            label: "Cases Represented",
            value: new Set(artifacts.map((a) => a.caseNumber)).size,
          },
          {
            label: "Artifact Types",
            value: new Set(artifacts.map((a) => a.artifactType)).size,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-800 bg-[#111e32] p-5"
          >
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-3 text-3xl font-bold">
              {loading ? "..." : item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-800 bg-[#111e32] p-4 sm:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-lg border border-slate-700 px-3">
          <Search size={18} className="text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search evidence code, case or metadata..."
            className="w-full bg-transparent py-3 text-sm outline-none"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-slate-700 bg-[#0b1120] px-4 py-3 text-sm text-white"
        >
          <option value="all">All artifact types</option>
          <option value="browser">Browser</option>
          <option value="filesystem">Filesystem</option>
          <option value="memory">Memory</option>
        </select>
      </div>

      {loading ? (
        <p className="py-12 text-center text-slate-400">
          Loading forensic artifacts...
        </p>
      ) : error ? (
        <div className="rounded-xl border border-red-900 bg-red-950/30 p-6 text-red-300">
          <AlertTriangle className="mb-2" />
          {error}
          <button
            onClick={fetchArtifacts}
            className="ml-3 underline"
          >
            Try again
          </button>
        </div>
      ) : filteredArtifacts.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-[#111e32] p-10 text-center text-slate-400">
          No matching forensic artifacts found.
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredArtifacts.map((artifact) => (
            <article
              key={artifact._id}
              className="rounded-xl border border-slate-800 bg-[#111e32] p-5"
            >
              <div className="mb-5 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-cyan-500/10 p-3 text-cyan-400">
                    {getIcon(artifact.artifactType)}
                  </div>

                  <div>
                    <h2 className="font-bold capitalize">
                      {artifact.artifactType} Artifact
                    </h2>
                    <p className="text-xs text-slate-500">
                      {artifact.evidenceCode}
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                  {artifact.artifactType.toUpperCase()}
                </span>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Case Number</p>
                  <p className="mt-1">{artifact.caseNumber}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Analyzed By</p>
                  <p className="mt-1">{artifact.analyzedBy}</p>
                </div>

                <div className="col-span-2">
                  <p className="text-xs text-slate-500">Collected At</p>
                  <p className="mt-1">
                    {new Date(artifact.collectedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-[#0b1120] p-4">
                <p className="mb-3 text-xs font-semibold tracking-wider text-cyan-400">
                  ARTIFACT METADATA
                </p>

                <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs leading-6 text-slate-300">
                  {JSON.stringify(artifact.metadata, null, 2)}
                </pre>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {artifact.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-emerald-400">
        MongoDB · digital_forensics_mongo · forensic_artifacts
      </p>
    </main>
  );
}
