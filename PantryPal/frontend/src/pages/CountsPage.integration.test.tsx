import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "../test/utils";
import CountsPage from "./CountsPage";
import { CountStatus } from "../types";

// Simple integration test focused on the submit flow
describe("CountsPage Submit Flow Integration", () => {
  const mockSubmitMutate = vi.fn();
  const mockApproveMutate = vi.fn();
  const mockRejectMutate = vi.fn();
  const mockDeleteMutate = vi.fn();
  const mockAddToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the counts service
    vi.doMock("../services/counts", () => ({
      useCounts: () => ({
        data: [
          {
            id: "count-1",
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
              },
            ],
          },
          {
            id: "count-2",
            count_date: "2024-01-02",
            status: CountStatus.SUBMITTED,
            created_by: "user-123",
            created_at: "2024-01-02T00:00:00Z",
            updated_at: "2024-01-02T00:00:00Z",
            items: [],
          },
        ],
        isLoading: false,
        error: null,
      }),
      useCountStats: () => ({
        data: { total: 2, draft: 1, submitted: 1, approved: 0, rejected: 0 },
      }),
      useDeleteCount: () => ({
        mutateAsync: mockDeleteMutate,
        isPending: false,
      }),
      useSubmitCount: () => ({
        mutateAsync: mockSubmitMutate,
        isPending: false,
      }),
      useApproveCount: () => ({
        mutateAsync: mockApproveMutate,
        isPending: false,
      }),
      useRejectCount: () => ({
        mutateAsync: mockRejectMutate,
        isPending: false,
      }),
      getStatusColor: (status: CountStatus) => {
        switch (status) {
          case CountStatus.DRAFT:
            return "gray";
          case CountStatus.SUBMITTED:
            return "blue";
          case CountStatus.APPROVED:
            return "green";
          case CountStatus.REJECTED:
            return "red";
          default:
            return "gray";
        }
      },
      getStatusIcon: (status: CountStatus) => {
        switch (status) {
          case CountStatus.DRAFT:
            return "DocumentTextIcon";
          case CountStatus.SUBMITTED:
            return "ClockIcon";
          case CountStatus.APPROVED:
            return "CheckCircleIcon";
          case CountStatus.REJECTED:
            return "XCircleIcon";
          default:
            return "DocumentTextIcon";
        }
      },
      formatCountDate: (date: string) => new Date(date).toLocaleDateString(),
      calculateTotalDiscrepancy: (items: any[]) =>
        items?.reduce(
          (sum: number, item: any) => sum + (item.discrepancy || 0),
          0
        ) || 0,
    }));

    // Mock ToastProvider
    vi.doMock("../components/ToastProvider", () => ({
      useToast: () => ({
        addToast: mockAddToast,
        removeToast: vi.fn(),
        toasts: [],
      }),
    }));
  });

  it("renders page with counts and action buttons", async () => {
    render(<CountsPage />);

    expect(
      screen.getByRole("heading", { name: "Inventory Counts" })
    ).toBeInTheDocument();

    // Should show both counts
    expect(screen.getByText(/count-1/)).toBeInTheDocument();
    expect(screen.getByText(/count-2/)).toBeInTheDocument();

    // Should show appropriate action buttons
    expect(screen.getByText("Submit for Review")).toBeInTheDocument(); // For draft
    expect(screen.getByText("Approve")).toBeInTheDocument(); // For submitted
    expect(screen.getByText("Reject")).toBeInTheDocument(); // For submitted
  });

  it("handles submit action successfully", async () => {
    mockSubmitMutate.mockResolvedValue({});

    render(<CountsPage />);

    const submitButton = screen.getByText("Submit for Review");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmitMutate).toHaveBeenCalledWith("count-1");
    });
  });

  it("handles approve action successfully", async () => {
    mockApproveMutate.mockResolvedValue({});

    render(<CountsPage />);

    const approveButton = screen.getByText("Approve");
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(mockApproveMutate).toHaveBeenCalledWith("count-2");
    });
  });

  it("handles reject action with modal", async () => {
    mockRejectMutate.mockResolvedValue({});

    render(<CountsPage />);

    const rejectButton = screen.getByText("Reject");
    fireEvent.click(rejectButton);

    // Modal should appear
    expect(screen.getByText("Reject Count")).toBeInTheDocument();

    // Enter reason and submit
    const reasonInput = screen.getByPlaceholderText(
      "Enter rejection reason..."
    );
    fireEvent.change(reasonInput, { target: { value: "Issues found" } });

    const confirmButton = screen.getByRole("button", { name: "Reject Count" });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockRejectMutate).toHaveBeenCalledWith({
        id: "count-2",
        reason: "Issues found",
      });
    });
  });

  it("handles API errors gracefully", async () => {
    mockSubmitMutate.mockRejectedValue(new Error("API Error"));

    render(<CountsPage />);

    const submitButton = screen.getByText("Submit for Review");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmitMutate).toHaveBeenCalled();
    });

    // Should call addToast with error
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        "error",
        expect.any(String),
        expect.stringContaining("Failed to submit count")
      );
    });
  });

  it("shows success message on successful submit", async () => {
    mockSubmitMutate.mockResolvedValue({});

    render(<CountsPage />);

    const submitButton = screen.getByText("Submit for Review");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        "success",
        expect.any(String),
        expect.stringContaining("successfully")
      );
    });
  });

  it("displays loading state on buttons during actions", async () => {
    // Mock pending state
    vi.doMock("../services/counts", () => ({
      useCounts: () => ({
        data: [
          {
            id: "count-1",
            count_date: "2024-01-01",
            status: CountStatus.DRAFT,
            created_by: "user-123",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
            items: [],
          },
        ],
        isLoading: false,
        error: null,
      }),
      useCountStats: () => ({
        data: { total: 1, draft: 1, submitted: 0, approved: 0, rejected: 0 },
      }),
      useDeleteCount: () => ({
        mutateAsync: mockDeleteMutate,
        isPending: false,
      }),
      useSubmitCount: () => ({
        mutateAsync: mockSubmitMutate,
        isPending: true,
      }), // Pending state
      useApproveCount: () => ({
        mutateAsync: mockApproveMutate,
        isPending: false,
      }),
      useRejectCount: () => ({
        mutateAsync: mockRejectMutate,
        isPending: false,
      }),
      getStatusColor: () => "gray",
      getStatusIcon: () => "DocumentTextIcon",
      formatCountDate: (date: string) => new Date(date).toLocaleDateString(),
      calculateTotalDiscrepancy: () => 0,
    }));

    render(<CountsPage />);

    const submitButton = screen.getByText("Submit for Review");
    expect(submitButton).toBeDisabled();
  });
});
