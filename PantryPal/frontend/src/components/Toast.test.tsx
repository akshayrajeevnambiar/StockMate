import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "../test/utils";
import ToastComponent from "./Toast";
import type { Toast } from "./Toast";

const mockToast: Toast = {
  id: "test-toast-1",
  type: "success",
  title: "Test Title",
  message: "Test message",
  duration: 5000,
};

const mockOnRemove = vi.fn();

describe("Toast Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders toast with title and message", () => {
    render(<ToastComponent toast={mockToast} onRemove={mockOnRemove} />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("renders toast without message", () => {
    const toastWithoutMessage = { ...mockToast, message: undefined };
    render(
      <ToastComponent toast={toastWithoutMessage} onRemove={mockOnRemove} />
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.queryByText("Test message")).not.toBeInTheDocument();
  });

  it("displays correct icon for success toast", () => {
    render(<ToastComponent toast={mockToast} onRemove={mockOnRemove} />);

    // Check for success icon by looking for the SVG with the correct color class
    const iconContainer = screen
      .getByText("Test Title")
      .closest("div")
      ?.querySelector(".text-green-400");
    expect(iconContainer).toBeInTheDocument();
  });

  it("displays correct icon for error toast", () => {
    const errorToast = { ...mockToast, type: "error" as const };
    render(<ToastComponent toast={errorToast} onRemove={mockOnRemove} />);

    // Check for error icon with red color
    const iconContainer = screen
      .getByText("Test Title")
      .closest("div")
      ?.querySelector(".text-red-400");
    expect(iconContainer).toBeInTheDocument();
  });

  it("displays correct icon for warning toast", () => {
    const warningToast = { ...mockToast, type: "warning" as const };
    render(<ToastComponent toast={warningToast} onRemove={mockOnRemove} />);

    // Check for warning icon with yellow color
    const iconContainer = screen
      .getByText("Test Title")
      .closest("div")
      ?.querySelector(".text-yellow-400");
    expect(iconContainer).toBeInTheDocument();
  });

  it("displays correct icon for info toast", () => {
    const infoToast = { ...mockToast, type: "info" as const };
    render(<ToastComponent toast={infoToast} onRemove={mockOnRemove} />);

    // Check for info icon with blue color
    const iconContainer = screen
      .getByText("Test Title")
      .closest("div")
      ?.querySelector(".text-blue-400");
    expect(iconContainer).toBeInTheDocument();
  });

  it("applies correct background color for success toast", () => {
    render(<ToastComponent toast={mockToast} onRemove={mockOnRemove} />);

    const toastContainer = screen
      .getByText("Test Title")
      .closest(".bg-green-50");
    expect(toastContainer).toBeInTheDocument();
  });

  it("applies correct background color for error toast", () => {
    const errorToast = { ...mockToast, type: "error" as const };
    render(<ToastComponent toast={errorToast} onRemove={mockOnRemove} />);

    const toastContainer = screen.getByText("Test Title").closest(".bg-red-50");
    expect(toastContainer).toBeInTheDocument();
  });

  it("has close button that calls onRemove", async () => {
    render(<ToastComponent toast={mockToast} onRemove={mockOnRemove} />);

    const closeButton = screen.getByRole("button", { name: /close/i });
    expect(closeButton).toBeInTheDocument();

    await act(async () => {
      closeButton.click();
    });

    // Should trigger animation and then call onRemove
    act(() => {
      vi.advanceTimersByTime(300); // Animation duration
    });

    await waitFor(() => {
      expect(mockOnRemove).toHaveBeenCalledWith("test-toast-1");
    });
  });

  it("auto-removes after duration", async () => {
    render(<ToastComponent toast={mockToast} onRemove={mockOnRemove} />);

    // Advance time by the duration
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Wait for animation to complete
    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockOnRemove).toHaveBeenCalledWith("test-toast-1");
    });
  });

  it("uses default duration when not specified", async () => {
    const toastWithoutDuration = { ...mockToast, duration: undefined };
    render(
      <ToastComponent toast={toastWithoutDuration} onRemove={mockOnRemove} />
    );

    // Advance time by default duration (5000ms)
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Wait for animation to complete
    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockOnRemove).toHaveBeenCalledWith("test-toast-1");
    });
  });

  it("respects custom duration", async () => {
    const customDurationToast = { ...mockToast, duration: 10000 };
    render(
      <ToastComponent toast={customDurationToast} onRemove={mockOnRemove} />
    );

    // Advance time by default duration (should still be visible)
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(mockOnRemove).not.toHaveBeenCalled();

    // Advance time by custom duration
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Wait for animation to complete
    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockOnRemove).toHaveBeenCalledWith("test-toast-1");
    });
  });

  it("cleans up timer on unmount", () => {
    const { unmount } = render(
      <ToastComponent toast={mockToast} onRemove={mockOnRemove} />
    );

    unmount();

    // Advance time and ensure onRemove is not called
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(mockOnRemove).not.toHaveBeenCalled();
  });

  it("applies correct border color for each toast type", () => {
    const toastTypes = [
      { type: "success" as const, borderClass: "border-green-200" },
      { type: "error" as const, borderClass: "border-red-200" },
      { type: "warning" as const, borderClass: "border-yellow-200" },
      { type: "info" as const, borderClass: "border-blue-200" },
    ];

    toastTypes.forEach(({ type, borderClass }) => {
      const toast = { ...mockToast, type };
      const { unmount } = render(
        <ToastComponent toast={toast} onRemove={mockOnRemove} />
      );

      const toastElement = screen.getByText("Test Title").closest("div");
      expect(toastElement).toHaveClass(borderClass);

      unmount();
    });
  });
});
