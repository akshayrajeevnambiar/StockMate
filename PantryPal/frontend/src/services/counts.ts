import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./api";
import type { Count, CountCreate, CountItem } from "../types";
import { CountStatus } from "../types";

// API calls
export const countsApi = {
  // Get all counts
  getCounts: async (): Promise<Count[]> => {
    const response = await apiClient.get("/counts");
    return response.data;
  },

  // Get count by ID
  getCount: async (id: string): Promise<Count> => {
    const response = await apiClient.get(`/counts/${id}`);
    return response.data;
  },

  // Create new count
  createCount: async (data: CountCreate): Promise<Count> => {
    const response = await apiClient.post("/counts", data);
    return response.data;
  },

  // Update count
  updateCount: async (id: string, data: Partial<Count>): Promise<Count> => {
    const response = await apiClient.put(`/counts/${id}`, data);
    return response.data;
  },

  // Submit count for review
  submitCount: async (id: string): Promise<Count> => {
    const response = await apiClient.patch(`/counts/${id}/submit`);
    return response.data;
  },

  // Approve count
  approveCount: async (id: string): Promise<Count> => {
    const response = await apiClient.patch(`/counts/${id}/approve`);
    return response.data;
  },

  // Reject count
  rejectCount: async (id: string, reason: string): Promise<Count> => {
    const response = await apiClient.patch(`/counts/${id}/reject`, { reason });
    return response.data;
  },

  // Delete count
  deleteCount: async (id: string): Promise<void> => {
    await apiClient.delete(`/counts/${id}`);
  },

  // Get count statistics
  getCountStats: async (): Promise<{
    total_counts: number;
    pending_counts: number;
    approved_counts: number;
    discrepancy_value: number;
  }> => {
    const response = await apiClient.get("/counts/stats");
    return response.data;
  },
};

// React Query hooks
export const useCounts = () => {
  return useQuery({
    queryKey: ["counts"],
    queryFn: countsApi.getCounts,
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors (403, 401)
      if (error?.response?.status === 403 || error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useCount = (id: string) => {
  return useQuery({
    queryKey: ["counts", id],
    queryFn: () => countsApi.getCount(id),
    enabled: !!id,
  });
};

export const useCountStats = () => {
  return useQuery({
    queryKey: ["count-stats"],
    queryFn: countsApi.getCountStats,
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors (403, 401)
      if (error?.response?.status === 403 || error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useCreateCount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: countsApi.createCount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counts"] });
      queryClient.invalidateQueries({ queryKey: ["count-stats"] });
    },
  });
};

export const useUpdateCount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Count> }) =>
      countsApi.updateCount(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["counts"] });
      queryClient.invalidateQueries({ queryKey: ["counts", data.id] });
      queryClient.invalidateQueries({ queryKey: ["count-stats"] });
    },
  });
};

export const useSubmitCount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: countsApi.submitCount,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["counts"] });
      queryClient.invalidateQueries({ queryKey: ["counts", data.id] });
      queryClient.invalidateQueries({ queryKey: ["count-stats"] });
    },
  });
};

export const useApproveCount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: countsApi.approveCount,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["counts"] });
      queryClient.invalidateQueries({ queryKey: ["counts", data.id] });
      queryClient.invalidateQueries({ queryKey: ["count-stats"] });
    },
  });
};

export const useRejectCount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      countsApi.rejectCount(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["counts"] });
      queryClient.invalidateQueries({ queryKey: ["counts", data.id] });
      queryClient.invalidateQueries({ queryKey: ["count-stats"] });
    },
  });
};

export const useDeleteCount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: countsApi.deleteCount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counts"] });
      queryClient.invalidateQueries({ queryKey: ["count-stats"] });
    },
  });
};

// Utility functions
export const getStatusColor = (status: CountStatus): string => {
  switch (status) {
    case CountStatus.DRAFT:
      return "bg-gray-100 text-gray-800";
    case CountStatus.SUBMITTED:
      return "bg-yellow-100 text-yellow-800";
    case CountStatus.APPROVED:
      return "bg-green-100 text-green-800";
    case CountStatus.REJECTED:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getStatusIcon = (status: CountStatus): string => {
  switch (status) {
    case CountStatus.DRAFT:
      return "✏️";
    case CountStatus.SUBMITTED:
      return "📤";
    case CountStatus.APPROVED:
      return "✅";
    case CountStatus.REJECTED:
      return "❌";
    default:
      return "📋";
  }
};

export const formatCountDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const calculateTotalDiscrepancy = (items: CountItem[]): number => {
  return items.reduce((total, item) => total + Math.abs(item.discrepancy), 0);
};
