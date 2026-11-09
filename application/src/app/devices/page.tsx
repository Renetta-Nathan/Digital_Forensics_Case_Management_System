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
  HardDrive,
  Smartphone,
  Usb,
  Server,
  X,
} from "lucide-react";

type Device = {
  device_id: number;
  device_tag: string;
  device_type: string;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  collected_at: string | null;
  notes: string | null;
  evidence_count: number;
};

const navigation = [
  { name: "Overview", icon: LayoutDashboard, href: "/" },
  { name: "Cases", icon: FolderOpen, href: "/cases" },
  { name: "Evidence", icon: Database, href: "/evidence" },
  { name: "Chain of Custody", icon: Activity, href: "/chain-of-custody" },
  { name: "Devices", icon: Monitor, href: "/devices" },
  { name: "Findings & Notes", icon: FileText, href: "/reports" },
  { name: "Reports", icon: FileText, href: "/reports" },
];

const deviceTypes = [
  "LAPTOP",
  "MOBILE",
  "USB",
  "SERVER",
  "OTHER",
];

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDeviceIcon(type: string) {
  switch (type) {
    case "LAPTOP":
      return HardDrive;
    case "MOBILE":
      return Smartphone;
    case "USB":
      return Usb;
    case "SERVER":
      return Server;
    default:
      return Monitor;
  }
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  async function fetchDevices() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/devices", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load devices");
      }

      setDevices(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDevices();
  }, []);

  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        device.device_tag?.toLowerCase().includes(searchText) ||
        device.manufacturer?.toLowerCase().includes(searchText) ||
        device.model?.toLowerCase().includes(searchText) ||
        device.serial_number?.toLowerCase().includes(searchText);

      const matchesType =
        typeFilter === "ALL" || device.device_type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [devices, search, typeFilter]);

  const totalEvidence = devices.reduce(
    (sum, device) => sum + Number(device.evidence_count || 0),
    0
  );

  const typesRepresented = new Set(
    devices.map((device) => device.device_type)
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
            const active = item.href === "/devices";

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
                FORENSIC OPERATIONS / DEVICE MANAGEMENT
              </p>
              <h2 className="text-3xl font-bold text-white">
                Devices
              </h2>
              <p className="text-slate-400 mt-2">
                Manage devices collected during digital forensic investigations.
              </p>
            </div>

            <button
              onClick={fetchDevices}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold transition"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#111e32] border border-slate-800 rounded-xl p-5">
              <p className="text-sm text-slate-400">Total Devices</p>
              <p className="text-3xl font-bold text-white mt-2">
                {devices.length}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Registered forensic devices
              </p>
            </div>

            <div className="bg-[#111e32] border border-slate-800 rounded-xl p-5">
              <p className="text-sm text-slate-400">Associated Evidence</p>
              <p className="text-3xl font-bold text-cyan-400 mt-2">
                {totalEvidence}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Device-evidence associations
              </p>
            </div>

            <div className="bg-[#111e32] border border-slate-800 rounded-xl p-5">
              <p className="text-sm text-slate-400">Device Categories</p>
              <p className="text-3xl font-bold text-purple-400 mt-2">
                {typesRepresented}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Different device types
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
                placeholder="Search device tag, manufacturer, model or serial number..."
                className="w-full bg-[#0b1120] border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#0b1120] border border-slate-700 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Device Types</option>
              {deviceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Device List */}
          <div className="bg-[#111e32] border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-white">
                  Registered Devices
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {filteredDevices.length} of {devices.length} devices
                </p>
              </div>
              <Monitor className="text-cyan-400" size={22} />
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400">
                Loading devices...
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={fetchDevices}
                  className="text-cyan-400 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : filteredDevices.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                No devices match your search.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
                {filteredDevices.map((device) => {
                  const Icon = getDeviceIcon(device.device_type);

                  return (
                    <button
                      key={device.device_id}
                      onClick={() => setSelectedDevice(device)}
                      className="text-left bg-[#0b1120] border border-slate-800 rounded-xl p-5 hover:border-cyan-400/50 hover:bg-slate-800/30 transition"
                    >
                      <div className="flex items-start justify-between mb-5">
                        <div className="p-3 rounded-xl bg-cyan-400/10 text-cyan-400">
                          <Icon size={23} />
                        </div>
                        <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                          {device.device_type}
                        </span>
                      </div>

                      <h4 className="font-semibold text-white text-lg">
                        {device.device_tag}
                      </h4>

                      <p className="text-sm text-slate-400 mt-1">
                        {[device.manufacturer, device.model]
                          .filter(Boolean)
                          .join(" ") || "Manufacturer/model not specified"}
                      </p>

                      <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-800">
                        <span className="text-xs text-slate-500">
                          Evidence associated
                        </span>
                        <span className="text-sm font-semibold text-cyan-400">
                          {device.evidence_count}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 mt-3">
                        Collected: {formatDate(device.collected_at)}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Device Details Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#111e32] border border-slate-700 rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs text-cyan-400 mb-2">
                  DEVICE #{selectedDevice.device_id}
                </p>
                <h3 className="text-2xl font-bold text-white">
                  {selectedDevice.device_tag}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {selectedDevice.device_type}
                </p>
              </div>

              <button
                onClick={() => setSelectedDevice(null)}
                className="text-slate-400 hover:text-white p-2"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ["Manufacturer", selectedDevice.manufacturer],
                ["Model", selectedDevice.model],
                ["Serial Number", selectedDevice.serial_number],
                ["Device Type", selectedDevice.device_type],
                ["Collection Date", formatDate(selectedDevice.collected_at)],
                ["Associated Evidence", String(selectedDevice.evidence_count)],
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
              <p className="text-xs text-slate-500 mb-2">Notes</p>
              <p className="text-sm text-white">
                {selectedDevice.notes || "No notes recorded."}
              </p>
            </div>

            <button
              onClick={() => setSelectedDevice(null)}
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