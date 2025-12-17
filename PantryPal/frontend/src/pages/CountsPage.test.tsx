import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "../test/utils";
import CountsPage from "./CountsPage";
import { CountStatus } from "../types";
import type { Count } from "../types";

// Mock the counts service
vi.mock("../services/counts", () => ({
  useCounts: vi.fn(),
  useCountStats: vi.fn(),
  useDeleteCount: vi.fn(),
  useSubmitCount: vi.fn(),
  useApproveCount: vi.fn(),
  useRejectCount: vi.fn(),
  getStatusColor: vi.fn((status) => {
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
  }),
  getStatusIcon: vi.fn((status) => {
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
  }),
  formatCountDate: vi.fn((date) => new Date(date).toLocaleDateString()),
  calculateTotalDiscrepancy: vi.fn(
    (items) =>
      items?.reduce(
        (sum: number, item: any) => sum + (item.discrepancy || 0),
        0
      ) || 0
  ),
}));

// Mock ToastProvider
vi.mock("../components/ToastProvider", () => ({
  useToast: vi.fn(() => ({
    addToast: vi.fn(),
  })),
}));

const mockCounts: Count[] = [
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
        notes: "Test note",
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
    submitted_at: "2024-01-02T12:00:00Z",
    items: [
      {
        id: "item-2",
        item_id: "inventory-item-2",
        expected_quantity: 50,
        actual_quantity: 55,
        discrepancy: 5,
      },
    ],
  },
];

const mockStats = {
  total: 2,
  draft: 1,
  submitted: 1,
  approved: 0,
  rejected: 0,
};

describe("CountsPage", () => {
  const mockUseCounts = vi.fn();
  const mockUseCountStats = vi.fn();
  const mockUseDeleteCount = vi.fn();
  const mockUseSubmitCount = vi.fn();
  const mockUseApproveCount = vi.fn();
  const mockUseRejectCount = vi.fn();
  const mockAddToast = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup default mock implementations
    mockUseCounts.mockReturnValue({
      data: mockCounts,
      isLoading: false,
      error: null,
    });

    mockUseCountStats.mockReturnValue({
      data: mockStats,
    });

    mockUseDeleteCount.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockUseSubmitCount.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockUseApproveCount.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockUseRejectCount.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    // Apply mocks to the module
    const countsModule = await import("../services/counts");
    const toastModule = await import("../components/ToastProvider");

    vi.mocked(countsModule.useCounts).mockImplementation(mockUseCounts);
    vi.mocked(countsModule.useCountStats).mockImplementation(mockUseCountStats);
    vi.mocked(countsModule.useDeleteCount).mockImplementation(
      mockUseDeleteCount
    );
    vi.mocked(countsModule.useSubmitCount).mockImplementation(
      mockUseSubmitCount
    );
    vi.mocked(countsModule.useApproveCount).mockImplementation(
      mockUseApproveCount
    );
    vi.mocked(countsModule.useRejectCount).mockImplementation(
      mockUseRejectCount
    );
    vi.mocked(toastModule.useToast).mockReturnValue({
      addToast: mockAddToast,
      removeToast: vi.fn(),
      toasts: [],
    });
  });

  it("renders counts page with header and stats", async () => {
    render(<CountsPage />);

    expect(
      screen.getByRole("heading", { name: "Inventory Counts" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Track and manage inventory count sessions")
    ).toBeInTheDocument();
    expect(screen.getByText("New Count")).toBeInTheDocument();
  });

  it("displays loading state", async () => {
    mockUseCounts.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<CountsPage />);

    expect(screen.getByText("Loading counts...")).toBeInTheDocument();
  });

  it("displays error state", async () => {
    mockUseCounts.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed to fetch"),
    });

    render(<CountsPage />);

    expect(screen.getByText(/Error loading counts/)).toBeInTheDocument();
    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });

  it("displays empty state when no counts", async () => {
    mockUseCounts.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<CountsPage />);

    expect(screen.getByText("No inventory counts found")).toBeInTheDocument();
    expect(
      screen.getByText("Create your first count to get started")
    ).toBeInTheDocument();
  });

  it("displays counts list with correct information", async () => {
    render(<CountsPage />);

    // Check that counts are displayed (using more flexible text matching)
    expect(screen.getByText(/count-1/)).toBeInTheDocument();
    expect(screen.getByText(/count-2/)).toBeInTheDocument();

    // Check status badges
    expect(screen.getByText("DRAFT")).toBeInTheDocument();
    expect(screen.getByText("SUBMITTED")).toBeInTheDocument();
  });

  it("shows stats cards when stats are available", async () => {
    render(<CountsPage />);

    expect(screen.getByText("2")).toBeInTheDocument(); // Total counts
    expect(screen.getByText("1")).toBeInTheDocument(); // Draft counts
  });

  it("handles submit count action", async () => {
    const mockSubmitMutate = vi.fn().mockResolvedValue({});
    mockUseSubmitCount.mockReturnValue({
      mutateAsync: mockSubmitMutate,
      isPending: false,
    });

    render(<CountsPage />);

    // Find and click submit button for draft count
    const submitButtons = screen.getAllByText("Submit for Review");
    expect(submitButtons).toHaveLength(1);

    fireEvent.click(submitButtons[0]);

    await waitFor(() => {
      expect(mockSubmitMutate).toHaveBeenCalledWith("count-1");
    });
  });

  it("handles approve count action", async () => {
    const mockApproveMutate = vi.fn().mockResolvedValue({});
    mockUseApproveCount.mockReturnValue({
      mutateAsync: mockApproveMutate,
      isPending: false,
    });

    render(<CountsPage />);

    // Find and click approve button for submitted count
    const approveButtons = screen.getAllByText("Approve");
    expect(approveButtons).toHaveLength(1);

    fireEvent.click(approveButtons[0]);

    await waitFor(() => {
      expect(mockApproveMutate).toHaveBeenCalledWith("count-2");
    });
  });

  it("handles reject count action with modal", async () => {
    const mockRejectMutate = vi.fn().mockResolvedValue({});
    mockUseRejectCount.mockReturnValue({
      mutateAsync: mockRejectMutate,
      isPending: false,
    });

    render(<CountsPage />);

    // Find and click reject button for submitted count
    const rejectButtons = screen.getAllByText("Reject");
    expect(rejectButtons).toHaveLength(1);

    fireEvent.click(rejectButtons[0]);

    // Check modal appears
    expect(screen.getByText("Reject Count")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter rejection reason...")
    ).toBeInTheDocument();

    // Enter rejection reason
    const reasonInput = screen.getByPlaceholderText(
      "Enter rejection reason..."
    );
    fireEvent.change(reasonInput, { target: { value: "Discrepancies found" } });

    // Click confirm reject
    const confirmButton = screen.getByRole("button", { name: "Reject Count" });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockRejectMutate).toHaveBeenCalledWith({
        id: "count-2",
        reason: "Discrepancies found",
      });
    });
  });

  it("handles delete count action", async () => {
    const mockDeleteMutate = vi.fn().mockResolvedValue({});
    mockUseDeleteCount.mockReturnValue({
      mutateAsync: mockDeleteMutate,
      isPending: false,
    });

    render(<CountsPage />);

    // Find and click delete button (should only appear for draft counts)
    const deleteButtons = screen.getAllByLabelText(/delete/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockDeleteMutate).toHaveBeenCalledWith("count-1");
    });
  });

  it("displays loading state for action buttons", async () => {
    mockUseSubmitCount.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
    });

    render(<CountsPage />);

    // Submit button should show loading state
    const submitButton = screen.getByText("Submit for Review");
    expect(submitButton).toBeDisabled();
  });

  it("handles API errors gracefully", async () => {
    const mockSubmitMutate = vi.fn().mockRejectedValue(new Error("API Error"));
    mockUseSubmitCount.mockReturnValue({
      mutateAsync: mockSubmitMutate,
      isPending: false,
    });

    render(<CountsPage />);

    const submitButton = screen.getByText("Submit for Review");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmitMutate).toHaveBeenCalled();
    });

    // Check that toast was called with error
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        "error",
        "Submit Failed",
        expect.stringContaining("Failed to submit count")
      );
    });
  });

  it("shows success toast after successful submit", async () => {
    const mockSubmitMutate = vi.fn().mockResolvedValue({});
    mockUseSubmitCount.mockReturnValue({
      mutateAsync: mockSubmitMutate,
      isPending: false,
    });

    render(<CountsPage />);

    const submitButton = screen.getByText("Submit for Review");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmitMutate).toHaveBeenCalled();
    });

    // Check that success toast was called
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        "success",
        "Count Submitted",
        expect.stringContaining("Count submitted successfully")
      );
    });
  });
});
