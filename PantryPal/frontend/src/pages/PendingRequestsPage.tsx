import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, XMarkIcon, EyeIcon } from "@heroicons/react/24/outline";
import apiClient from "../services/api";
import type { Count } from "../types";
import { CountStatus } from "../types";
import { useToast } from "../components/ToastProvider";

interface CountWithDetails extends Count {
  created_by_username?: string;
  count_items?: Array<{
    id: string;
    item_id: string;
    item_name?: string;
    item_unit?: string;
    counted_quantity: number;
  }>;
}

export default function PendingRequestsPage() {
  const [selectedCount, setSelectedCount] = useState<CountWithDetails | null>(null);
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending counts (status = SUBMITTED)
  const { data: pendingCounts, isLoading } = useQuery({
    queryKey: ["counts", "pending"],
    queryFn: async () => {
      const response = await apiClient.get("/counts?status=SUBMITTED");
      return response.data;
    },
  });

  // Approve count mutation
  const approveMutation = useMutation({
    mutationFn: async (countId: string) => {
      const response = await apiClient.patch(`/counts/${countId}`, {
        status: CountStatus.APPROVED,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counts"] });
      addToast("success", "Count approved successfully");
      setSelectedCount(null);
    },
    onError: (error: any) => {
      if (error.response?.status === 403) {
        addToast("error", "You don't have permission to approve this count");
      } else if (error.response?.status === 404) {
        addToast("error", "Count not found");
      } else {
        addToast("error", "Failed to approve count");
      }
    },
  });

  // Reject count mutation
  const rejectMutation = useMutation({
    mutationFn: async (countId: string) => {
      const response = await apiClient.patch(`/counts/${countId}`, {
        status: CountStatus.REJECTED,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counts"] });
      addToast("success", "Count rejected successfully");
      setSelectedCount(null);
    },
    onError: (error: any) => {
      if (error.response?.status === 403) {
        addToast("error", "You don't have permission to reject this count");
      } else if (error.response?.status === 404) {
        addToast("error", "Count not found");
      } else {
        addToast("error", "Failed to reject count");
      }
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Pending Requests</h1>
          <p className="mt-2 text-sm text-gray-700">
            Review and approve inventory counts submitted by staff members.
          </p>
        </div>
      </div>

      {!pendingCounts || pendingCounts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">No pending requests to review.</p>
        </div>
      ) : (
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Count ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Submitted By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Date Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingCounts.map((count: CountWithDetails) => (
                      <tr key={count.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {count.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {count.created_by_username || "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(count.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {count.count_items?.length || count.items?.length || 0} items
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => setSelectedCount(count)}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            Review
                          </button>
                          <button
                            onClick={() => approveMutation.mutate(count.id)}
                            disabled={approveMutation.isPending}
                            className="text-green-600 hover:text-green-900 inline-flex items-center disabled:opacity-50"
                          >
                            <CheckIcon className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => rejectMutation.mutate(count.id)}
                            disabled={rejectMutation.isPending}
                            className="text-red-600 hover:text-red-900 inline-flex items-center disabled:opacity-50"
                          >
                            <XMarkIcon className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Count Detail Modal */}
      {selectedCount && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Count Details - {selectedCount.id}
                </h3>
                <button
                  onClick={() => setSelectedCount(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-700">Submitted By:</p>
                  <p className="text-sm text-gray-900">{selectedCount.created_by_username || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Date Submitted:</p>
                  <p className="text-sm text-gray-900">{formatDateTime(selectedCount.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Status:</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {selectedCount.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Total Items:</p>
                  <p className="text-sm text-gray-900">{selectedCount.count_items?.length || selectedCount.items?.length || 0}</p>
                </div>
              </div>

              {/* Count Items Table */}
              {(selectedCount.count_items || selectedCount.items) && (selectedCount.count_items?.length || selectedCount.items?.length || 0) > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Count Items</h4>
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Item
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Counted Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Expected Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Discrepancy
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(selectedCount.count_items || selectedCount.items || []).map((item: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.item_name || `Item ID: ${item.item_id}`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.counted_quantity || item.actual_quantity || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.expected_quantity || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.discrepancy || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedCount(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => rejectMutation.mutate(selectedCount.id)}
                  disabled={rejectMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => approveMutation.mutate(selectedCount.id)}
                  disabled={approveMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}