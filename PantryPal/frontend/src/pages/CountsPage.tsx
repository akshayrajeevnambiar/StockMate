import { useState } from "react";
import { Link } from "react-router-dom";
import {
  PlusIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  UserIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import {
  useCounts,
  useCountStats,
  useDeleteCount,
  useSubmitCount,
  useApproveCount,
  useRejectCount,
  getStatusColor,
  getStatusIcon,
  formatCountDate,
  calculateTotalDiscrepancy,
} from "../services/counts";
import type { Count } from "../types";
import { CountStatus } from "../types";

export default function CountsPage() {
  const [selectedCount, setSelectedCount] = useState<Count | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { data: counts = [], isLoading, error } = useCounts();
  const { data: stats } = useCountStats();
  const deleteCount = useDeleteCount();
  const submitCount = useSubmitCount();
  const approveCount = useApproveCount();
  const rejectCount = useRejectCount();

  const handleSubmitCount = async (id: string) => {
    try {
      await submitCount.mutateAsync(id);
    } catch (error) {
      console.error("Failed to submit count:", error);
    }
  };

  const handleApproveCount = async (id: string) => {
    try {
      await approveCount.mutateAsync(id);
    } catch (error) {
      console.error("Failed to approve count:", error);
    }
  };

  const handleRejectCount = async () => {
    if (!selectedCount || !rejectReason.trim()) return;

    try {
      await rejectCount.mutateAsync({
        id: selectedCount.id,
        reason: rejectReason,
      });
      setShowRejectModal(false);
      setSelectedCount(null);
      setRejectReason("");
    } catch (error) {
      console.error("Failed to reject count:", error);
    }
  };

  const handleDeleteCount = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this count?")) {
      try {
        await deleteCount.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete count:", error);
      }
    }
  };

  if (error) {
    const isAuthError =
      error instanceof Error &&
      (error.message.includes("403") ||
        error.message.includes("Forbidden") ||
        error.message.includes("Unauthorized"));

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-red-400">
              <XCircleIcon />
            </div>
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
                  This might be because the backend count endpoints are not
                  implemented yet.
                </p>
                <button
                  onClick={() => {
                    console.log(
                      "API Base URL:",
                      import.meta.env.VITE_API_BASE_URL ||
                        "http://localhost:8000/api"
                    );
                    console.log(
                      "Access Token:",
                      localStorage.getItem("access_token")
                        ? "Present"
                        : "Missing"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Inventory Counts
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Manage and track inventory counting processes
            </p>
          </div>
          <Link
            to="/counts/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <PlusIcon className="h-5 w-5" />
            New Count
          </Link>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 p-6 shadow-lg shadow-blue-500/10 transition-all hover:bg-white/80 hover:shadow-xl hover:shadow-blue-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Counts
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.total_counts}
                  </p>
                </div>
                <div className="rounded-full bg-blue-100 p-3">
                  <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 p-6 shadow-lg shadow-yellow-500/10 transition-all hover:bg-white/80 hover:shadow-xl hover:shadow-yellow-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Review
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.pending_counts}
                  </p>
                </div>
                <div className="rounded-full bg-yellow-100 p-3">
                  <ClockIcon className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 p-6 shadow-lg shadow-green-500/10 transition-all hover:bg-white/80 hover:shadow-xl hover:shadow-green-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.approved_counts}
                  </p>
                </div>
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 p-6 shadow-lg shadow-red-500/10 transition-all hover:bg-white/80 hover:shadow-xl hover:shadow-red-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Discrepancy
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.discrepancy_value}
                  </p>
                </div>
                <div className="rounded-full bg-red-100 p-3">
                  <ChartBarIcon className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Counts List */}
        <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-blue-500/10 overflow-hidden">
          <div className="border-b border-gray-200 bg-white/50 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Counts
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {counts.length} {counts.length === 1 ? "count" : "counts"} total
            </p>
          </div>

          {isLoading ? (
            <div className="px-6 py-12">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading counts...</span>
              </div>
            </div>
          ) : counts.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No counts yet
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Get started by creating your first inventory count.
              </p>
              <Link
                to="/counts/new"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-indigo-700"
              >
                <PlusIcon className="h-4 w-4" />
                Create First Count
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {counts.map((count) => (
                <div
                  key={count.id}
                  className="group px-6 py-6 transition-all hover:bg-white/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">
                          {getStatusIcon(count.status)}
                        </span>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            Count #{count.id.slice(-8)}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <CalendarDaysIcon className="h-4 w-4" />
                              {formatCountDate(count.count_date)}
                            </div>
                            <div className="flex items-center gap-1">
                              <UserIcon className="h-4 w-4" />
                              {count.created_by}
                            </div>
                            <div className="flex items-center gap-1">
                              <DocumentTextIcon className="h-4 w-4" />
                              {count.items?.length || 0} items
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                            count.status
                          )}`}
                        >
                          {count.status}
                        </span>
                        {calculateTotalDiscrepancy(count.items || []) > 0 && (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                            {calculateTotalDiscrepancy(count.items || [])}{" "}
                            discrepancies
                          </span>
                        )}
                      </div>

                      {count.notes && (
                        <p className="text-sm text-gray-600 mb-3">
                          {count.notes}
                        </p>
                      )}

                      {count.rejection_reason && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-3">
                          <p className="text-sm font-medium text-red-800">
                            Rejection Reason:
                          </p>
                          <p className="text-sm text-red-700">
                            {count.rejection_reason}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Link
                        to={`/counts/${count.id}`}
                        className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-200"
                      >
                        View Details
                      </Link>

                      {count.status === CountStatus.DRAFT && (
                        <>
                          <button
                            onClick={() => handleSubmitCount(count.id)}
                            disabled={submitCount.isPending}
                            className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-200 disabled:opacity-50"
                          >
                            Submit
                          </button>
                          <button
                            onClick={() => handleDeleteCount(count.id)}
                            disabled={deleteCount.isPending}
                            className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </>
                      )}

                      {count.status === CountStatus.SUBMITTED && (
                        <>
                          <button
                            onClick={() => handleApproveCount(count.id)}
                            disabled={approveCount.isPending}
                            className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-200 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCount(count);
                              setShowRejectModal(true);
                            }}
                            disabled={rejectCount.isPending}
                            className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reject Modal */}
        {showRejectModal && selectedCount && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
              <div className="relative transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm border border-white/50 px-6 py-6 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <XCircleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-4 text-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Reject Count #{selectedCount.id.slice(-8)}
                    </h3>
                    <div className="mt-4">
                      <label
                        htmlFor="reason"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Rejection Reason
                      </label>
                      <textarea
                        id="reason"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={4}
                        className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                        placeholder="Please provide a reason for rejecting this count..."
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRejectModal(false);
                      setSelectedCount(null);
                      setRejectReason("");
                    }}
                    className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRejectCount}
                    disabled={!rejectReason.trim() || rejectCount.isPending}
                    className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                  >
                    {rejectCount.isPending ? "Rejecting..." : "Reject Count"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
