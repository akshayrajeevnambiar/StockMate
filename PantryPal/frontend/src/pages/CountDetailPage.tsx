import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  UserIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import {
  useCount,
  useSubmitCount,
  useApproveCount,
  useRejectCount,
  useDeleteCount,
  getStatusColor,
  getStatusIcon,
  formatCountDate,
  calculateTotalDiscrepancy,
} from "../services/counts";
import { CountStatus } from "../types";

export default function CountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { data: count, isLoading, error } = useCount(id!);
  const submitCount = useSubmitCount();
  const approveCount = useApproveCount();
  const rejectCount = useRejectCount();
  const deleteCount = useDeleteCount();

  const handleSubmitCount = async () => {
    if (!count) return;
    try {
      await submitCount.mutateAsync(count.id);
    } catch (error) {
      console.error("Failed to submit count:", error);
    }
  };

  const handleApproveCount = async () => {
    if (!count) return;
    try {
      await approveCount.mutateAsync(count.id);
    } catch (error) {
      console.error("Failed to approve count:", error);
    }
  };

  const handleRejectCount = async () => {
    if (!count || !rejectReason.trim()) return;

    try {
      await rejectCount.mutateAsync({
        id: count.id,
        reason: rejectReason,
      });
      setShowRejectModal(false);
      setRejectReason("");
    } catch (error) {
      console.error("Failed to reject count:", error);
    }
  };

  const handleDeleteCount = async () => {
    if (!count) return;
    if (window.confirm("Are you sure you want to delete this count?")) {
      try {
        await deleteCount.mutateAsync(count.id);
        navigate("/counts");
      } catch (error) {
        console.error("Failed to delete count:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading count details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !count) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-red-400">
              <XCircleIcon />
            </div>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              Count Not Found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              The count you're looking for doesn't exist or has been deleted.
            </p>
            <Link
              to="/counts"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-indigo-700"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Counts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalDiscrepancy = calculateTotalDiscrepancy(count.items || []);
  const hasDiscrepancies = totalDiscrepancy > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/counts"
              className="rounded-full bg-white/70 backdrop-blur-sm border border-white/50 p-2 shadow-lg shadow-blue-500/10 transition-all hover:bg-white/80 hover:shadow-xl hover:shadow-blue-500/20"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{getStatusIcon(count.status)}</span>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  Count #{count.id.slice(-8)}
                </h1>
              </div>
              <div className="flex items-center gap-4 text-lg text-gray-600">
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="h-5 w-5" />
                  {formatCountDate(count.count_date)}
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  {count.created_by}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {count.status === CountStatus.DRAFT && (
              <>
                <Link
                  to={`/counts/${count.id}/edit`}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/50 px-4 py-2 text-sm font-semibold text-gray-700 shadow-lg shadow-blue-500/10 transition-all hover:bg-white/80 hover:shadow-xl hover:shadow-blue-500/20"
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit
                </Link>
                <button
                  onClick={handleSubmitCount}
                  disabled={submitCount.isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  {submitCount.isPending
                    ? "Submitting..."
                    : "Submit for Review"}
                </button>
                <button
                  onClick={handleDeleteCount}
                  disabled={deleteCount.isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:from-red-700 hover:to-rose-700 disabled:opacity-50"
                >
                  Delete
                </button>
              </>
            )}

            {count.status === CountStatus.SUBMITTED && (
              <>
                <button
                  onClick={handleApproveCount}
                  disabled={approveCount.isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  {approveCount.isPending ? "Approving..." : "Approve"}
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={rejectCount.isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:from-red-700 hover:to-rose-700 disabled:opacity-50"
                >
                  <XCircleIcon className="h-4 w-4" />
                  Reject
                </button>
              </>
            )}
          </div>
        </div>

        {/* Status and Summary Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 p-6 shadow-lg shadow-blue-500/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Status</h3>
                <span
                  className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
                    count.status
                  )}`}
                >
                  {count.status}
                </span>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 p-6 shadow-lg shadow-blue-500/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Total Items
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {count.items?.length || 0}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <DocumentTextIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div
            className={`rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 p-6 shadow-lg ${
              hasDiscrepancies ? "shadow-red-500/10" : "shadow-green-500/10"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Discrepancies
                </h3>
                <p
                  className={`text-3xl font-bold ${
                    hasDiscrepancies ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {totalDiscrepancy}
                </p>
              </div>
              <div
                className={`rounded-full p-3 ${
                  hasDiscrepancies ? "bg-red-100" : "bg-green-100"
                }`}
              >
                {hasDiscrepancies ? (
                  <ExclamationTriangleIcon
                    className={`h-6 w-6 ${
                      hasDiscrepancies ? "text-red-600" : "text-green-600"
                    }`}
                  />
                ) : (
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Count Information */}
        <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-blue-500/10 overflow-hidden">
          <div className="border-b border-gray-200 bg-white/50 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Count Information
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Created</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(count.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">
                  Last Updated
                </h4>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(count.updated_at).toLocaleString()}
                </p>
              </div>
              {count.submitted_at && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">
                    Submitted
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(count.submitted_at).toLocaleString()}
                  </p>
                </div>
              )}
              {count.reviewed_at && count.reviewed_by && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">
                    Reviewed
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(count.reviewed_at).toLocaleString()} by{" "}
                    {count.reviewed_by}
                  </p>
                </div>
              )}
            </div>

            {count.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Notes</h4>
                <p className="mt-1 text-sm text-gray-900">{count.notes}</p>
              </div>
            )}

            {count.rejection_reason && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <h4 className="text-sm font-medium text-red-800">
                  Rejection Reason
                </h4>
                <p className="mt-1 text-sm text-red-700">
                  {count.rejection_reason}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Count Items */}
        <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-blue-500/10 overflow-hidden">
          <div className="border-b border-gray-200 bg-white/50 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Count Items</h3>
            <p className="mt-1 text-sm text-gray-600">
              {count.items?.length || 0}{" "}
              {(count.items?.length || 0) === 1 ? "item" : "items"} counted
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expected
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discrepancy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/30 divide-y divide-gray-200">
                {(count.items || []).map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-white/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.item_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.expected_quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.actual_quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          item.discrepancy === 0
                            ? "bg-green-100 text-green-800"
                            : item.discrepancy > 0
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.discrepancy > 0 ? "+" : ""}
                        {item.discrepancy}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.notes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reject Modal */}
        {showRejectModal && (
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
                      Reject Count #{count.id.slice(-8)}
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
