import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCounts, useCountStats } from "../services/counts";
import CountsHeader from "../components/counts/CountsHeader";
import { Card } from "../components/ui/Card";
import StatCard from "../components/dashboard/StatCard";
import { CountsFilters } from "../components/counts/CountsFilters";
import { CountsTable } from "../components/counts/CountsTable";
import { CountsEmptyState } from "../components/counts/CountsEmptyState";

export default function CountsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();
  const { data: counts = [], isLoading, error } = useCounts();
  const { data: stats } = useCountStats();

  if (error) {
    const isAuthError =
      error instanceof Error &&
      (error.message.includes("403") ||
        error.message.includes("Forbidden") ||
        error.message.includes("Unauthorized"));

    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              {isAuthError ? "Access Denied" : "Error Loading Counts"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {isAuthError
                ? "You don't have permission to access counts. Please check with your administrator."
                : error instanceof Error
                ? error.message
                : "Failed to load counts"}
            </p>
            {isAuthError && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-gray-400">
                  This might be because the backend count endpoints are not implemented yet.
                </p>
                <button
                  onClick={() => {
                    console.log(
                      "API Base URL:",
                      import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"
                    );
                    console.log(
                      "Access Token:",
                      localStorage.getItem("access_token") ? "Present" : "Missing"
                    );
                    console.log("Error details:", error);
                  }}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                >
                  Debug API Info
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] px-6 py-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <CountsHeader
          onNewCount={() => navigate("/counts/new")}
          onExport={() => {}}
          onShare={() => {}}
        />
        {/* KPI Stat Cards */}
        <>
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={() => (
                  <span className="w-8 h-8 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-900 font-bold">Σ</span>
                  </span>
                )}
                label="Total Counts"
                value={stats.total_counts}
              />
              <StatCard
                icon={() => (
                  <span className="w-8 h-8 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-900 font-bold">P</span>
                  </span>
                )}
                label="Pending Review"
                value={stats.pending_counts}
              />
              <StatCard
                icon={() => (
                  <span className="w-8 h-8 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-900 font-bold">A</span>
                  </span>
                )}
                label="Approved Counts"
                value={stats.approved_counts}
              />
            </div>
          )}
          {/* Main Table Card */}
          <Card className="p-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 px-6 py-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Recent Counts
                </h3>
                <p className="text-sm text-gray-500">
                  Latest inventory counts across your team
                </p>
              </div>
              <CountsFilters
                search={search}
                onSearchChange={setSearch}
                status={status}
                onStatusChange={setStatus}
              />
            </div>
            {isLoading ? (
              <div className="px-6 py-12">
                <div className="space-y-3 mb-8">
                  <div className="h-8 w-40 bg-gray-100/60 rounded-xl animate-pulse" />
                  <div className="h-4 w-32 bg-gray-100/40 rounded-lg animate-pulse" />
                </div>
                <div className="h-12 bg-gray-100/40 rounded-lg animate-pulse mb-4" />
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 bg-gray-100/30 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ) : counts.length === 0 ? (
              <CountsEmptyState onNewCount={() => navigate("/counts/new")} />
            ) : (
              <CountsTable
                counts={counts.filter(
                  (c) =>
                    (!search ||
                      c.id.includes(search) ||
                      c.created_by
                        .toLowerCase()
                        .includes(search.toLowerCase())) &&
                    (!status || c.status === status)
                )}
                onAction={(action, count) => {
                  if (action === "menu") navigate(`/counts/${count.id}`);
                }}
              />
            )}
          </Card>
        </>
      </div>
    </div>
  );
}
