import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "../test/utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useCounts,
  useSubmitCount,
  useApproveCount,
  useRejectCount,
  useDeleteCount,
  getStatusColor,
  getStatusIcon,
  formatCountDate,
  calculateTotalDiscrepancy,
} from "./counts";
import { CountStatus } from "../types";
import type { Count, CountItem } from "../types";

// Mock fetch globally
const mockFetch = vi.fn();
(globalThis as any).fetch = mockFetch;

// Mock auth service
vi.mock("./auth", () => ({
  authService: {
    getToken: vi.fn(() => "mock-token"),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockCount: Count = {
  id: "count-123",
  count_date: "2024-01-01",
  status: CountStatus.DRAFT,
  created_by: "user-123",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  items: [
    {
      id: "item-1",
      item_id: "inventory-item-1",
      expected_quantity: 100,
      actual_quantity: 95,
      discrepancy: -5,
      notes: "Test note",
    },
  ],
};

const mockCountItems: CountItem[] = [
  {
    id: "item-1",
    item_id: "inventory-item-1",
    expected_quantity: 100,
    actual_quantity: 95,
    discrepancy: -5,
    notes: "Test note",
  },
];

describe("Counts Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  describe("useCounts", () => {
    it("fetches counts successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockCount],
      });

      const { result } = renderHook(() => useCounts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toEqual([mockCount]);
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/v1/counts/",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
        })
      );
    });

    it("handles fetch error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useCounts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("useSubmitCount", () => {
    it("submits count successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockCount, status: CountStatus.SUBMITTED }),
      });

      const { result } = renderHook(() => useSubmitCount(), {
        wrapper: createWrapper(),
      });

      await waitFor(async () => {
        await result.current.mutateAsync("count-123");
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/v1/counts/count-123/submit/",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
        })
      );
    });

    it("handles submit error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ detail: "Forbidden" }),
      });

      const { result } = renderHook(() => useSubmitCount(), {
        wrapper: createWrapper(),
      });

      await waitFor(async () => {
        try {
          await result.current.mutateAsync("count-123");
        } catch (error) {
          expect(error).toBeTruthy();
        }
      });
    });
  });

  describe("useApproveCount", () => {
    it("approves count successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockCount, status: CountStatus.APPROVED }),
      });

      const { result } = renderHook(() => useApproveCount(), {
        wrapper: createWrapper(),
      });

      await waitFor(async () => {
        await result.current.mutateAsync("count-123");
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/v1/counts/count-123/approve/",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
        })
      );
    });
  });

  describe("useRejectCount", () => {
    it("rejects count with reason successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockCount, status: CountStatus.REJECTED }),
      });

      const { result } = renderHook(() => useRejectCount(), {
        wrapper: createWrapper(),
      });

      await waitFor(async () => {
        await result.current.mutateAsync({
          id: "count-123",
          reason: "Discrepancies found",
        });
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/v1/counts/count-123/reject/",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer mock-token",
          }),
          body: JSON.stringify({ reason: "Discrepancies found" }),
        })
      );
    });
  });

  describe("useDeleteCount", () => {
    it("deletes count successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      const { result } = renderHook(() => useDeleteCount(), {
        wrapper: createWrapper(),
      });

      await waitFor(async () => {
        await result.current.mutateAsync("count-123");
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/v1/counts/count-123/",
        expect.objectContaining({
          method: "DELETE",
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
        })
      );
    });
  });

  describe("Utility Functions", () => {
    describe("getStatusColor", () => {
      it("returns correct colors for each status", () => {
        expect(getStatusColor(CountStatus.DRAFT)).toBe("gray");
        expect(getStatusColor(CountStatus.SUBMITTED)).toBe("blue");
        expect(getStatusColor(CountStatus.APPROVED)).toBe("green");
        expect(getStatusColor(CountStatus.REJECTED)).toBe("red");
      });
    });

    describe("getStatusIcon", () => {
      it("returns correct icons for each status", () => {
        expect(getStatusIcon(CountStatus.DRAFT)).toBe("DocumentTextIcon");
        expect(getStatusIcon(CountStatus.SUBMITTED)).toBe("ClockIcon");
        expect(getStatusIcon(CountStatus.APPROVED)).toBe("CheckCircleIcon");
        expect(getStatusIcon(CountStatus.REJECTED)).toBe("XCircleIcon");
      });
    });

    describe("formatCountDate", () => {
      it("formats ISO date correctly", () => {
        const isoDate = "2024-01-01T12:30:45Z";
        const formatted = formatCountDate(isoDate);
        expect(formatted).toMatch(/Jan 1, 2024/);
      });

      it("handles invalid date", () => {
        const formatted = formatCountDate("invalid-date");
        expect(formatted).toBe("Invalid Date");
      });
    });

    describe("calculateTotalDiscrepancy", () => {
      it("calculates positive discrepancy correctly", () => {
        const discrepancy = calculateTotalDiscrepancy(mockCountItems);
        expect(discrepancy).toBe(-5); // 95 - 100 = -5
      });

      it("handles empty items array", () => {
        const discrepancy = calculateTotalDiscrepancy([]);
        expect(discrepancy).toBe(0);
      });

      it("calculates multiple items correctly", () => {
        const multipleItems = [
          {
            ...mockCountItems[0],
            expected_quantity: 100,
            actual_quantity: 95,
            discrepancy: -5,
          },
          {
            ...mockCountItems[0],
            id: "item-2",
            expected_quantity: 50,
            actual_quantity: 55,
            discrepancy: 5,
          },
        ];
        const discrepancy = calculateTotalDiscrepancy(multipleItems);
        expect(discrepancy).toBe(0); // (-5) + (+5) = 0
      });
    });
  });

  describe("Error Handling", () => {
    it("handles 403 Forbidden error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ detail: "Forbidden" }),
      });

      const { result } = renderHook(() => useSubmitCount(), {
        wrapper: createWrapper(),
      });

      try {
        await result.current.mutateAsync("count-123");
      } catch (error: any) {
        expect(error.message).toContain("403");
      }
    });

    it("handles 404 Not Found error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ detail: "Not found" }),
      });

      const { result } = renderHook(() => useSubmitCount(), {
        wrapper: createWrapper(),
      });

      try {
        await result.current.mutateAsync("count-123");
      } catch (error: any) {
        expect(error.message).toContain("404");
      }
    });

    it("handles network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Failed to fetch"));

      const { result } = renderHook(() => useSubmitCount(), {
        wrapper: createWrapper(),
      });

      try {
        await result.current.mutateAsync("count-123");
      } catch (error: any) {
        expect(error.message).toContain("Failed to fetch");
      }
    });
  });
});
