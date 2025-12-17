import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "../test/utils";
import { ToastProvider, useToast } from "./ToastProvider";
import type { ReactNode } from "react";

// Test component that uses the toast hook
const TestComponent = () => {
  const { addToast, toasts } = useToast();

  return (
    <div>
      <button
        onClick={() => addToast("success", "Success Title", "Success message")}
        data-testid="add-success-toast"
      >
        Add Success Toast
      </button>
      <button
        onClick={() => addToast("error", "Error Title", "Error message")}
        data-testid="add-error-toast"
      >
        Add Error Toast
      </button>
      <button
        onClick={() => addToast("warning", "Warning Title")}
        data-testid="add-warning-toast"
      >
        Add Warning Toast
      </button>
      <button
        onClick={() => addToast("info", "Info Title", undefined, 10000)}
        data-testid="add-info-toast"
      >
        Add Info Toast
      </button>
      <div data-testid="toast-count">{toasts.length}</div>
    </div>
  );
};

const renderWithToastProvider = (children: ReactNode) => {
  return render(<ToastProvider>{children}</ToastProvider>);
};

describe("ToastProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("provides toast context to children", () => {
    renderWithToastProvider(<TestComponent />);

    expect(screen.getByTestId("add-success-toast")).toBeInTheDocument();
    expect(screen.getByTestId("toast-count")).toHaveTextContent("0");
  });

  it("throws error when useToast is used outside ToastProvider", () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useToast must be used within a ToastProvider");

    consoleSpy.mockRestore();
  });

  it("adds success toast with correct properties", async () => {
    renderWithToastProvider(<TestComponent />);

    await act(async () => {
      screen.getByTestId("add-success-toast").click();
    });

    expect(screen.getByTestId("toast-count")).toHaveTextContent("1");
    expect(screen.getByText("Success Title")).toBeInTheDocument();
    expect(screen.getByText("Success message")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("adds error toast with correct styling", async () => {
    renderWithToastProvider(<TestComponent />);

    await act(async () => {
      screen.getByTestId("add-error-toast").click();
    });

    expect(screen.getByText("Error Title")).toBeInTheDocument();
    expect(screen.getByText("Error message")).toBeInTheDocument();

    // Check for error styling (red colors)
    const toastElement = screen
      .getByText("Error Title")
      .closest('[class*="bg-red"]');
    expect(toastElement).toBeInTheDocument();
  });

  it("adds warning toast without message", async () => {
    renderWithToastProvider(<TestComponent />);

    await act(async () => {
      screen.getByTestId("add-warning-toast").click();
    });

    expect(screen.getByText("Warning Title")).toBeInTheDocument();
    expect(screen.queryByText("Warning message")).not.toBeInTheDocument();
  });

  it("adds info toast with custom duration", async () => {
    renderWithToastProvider(<TestComponent />);

    await act(async () => {
      screen.getByTestId("add-info-toast").click();
    });

    expect(screen.getByText("Info Title")).toBeInTheDocument();

    // Should still be visible after default duration (5000ms)
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByText("Info Title")).toBeInTheDocument();
  });

  it("auto-removes toast after duration", async () => {
    renderWithToastProvider(<TestComponent />);

    await act(async () => {
      screen.getByTestId("add-success-toast").click();
    });

    expect(screen.getByText("Success Title")).toBeInTheDocument();

    // Advance time to trigger auto-removal
    act(() => {
      vi.advanceTimersByTime(5300); // Duration + animation time
    });

    await waitFor(
      () => {
        expect(screen.queryByText("Success Title")).not.toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    expect(screen.getByTestId("toast-count")).toHaveTextContent("0");
  });

  it("manually removes toast when close button is clicked", async () => {
    renderWithToastProvider(<TestComponent />);

    await act(async () => {
      screen.getByTestId("add-success-toast").click();
    });

    expect(screen.getByText("Success Title")).toBeInTheDocument();

    // Click close button
    await act(async () => {
      screen.getByRole("button", { name: /close/i }).click();
    });

    // Advance time for animation
    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(
      () => {
        expect(screen.queryByText("Success Title")).not.toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    expect(screen.getByTestId("toast-count")).toHaveTextContent("0");
  });

  it("handles multiple toasts correctly", async () => {
    renderWithToastProvider(<TestComponent />);

    await act(async () => {
      screen.getByTestId("add-success-toast").click();
      screen.getByTestId("add-error-toast").click();
      screen.getByTestId("add-warning-toast").click();
    });

    expect(screen.getByTestId("toast-count")).toHaveTextContent("3");
    expect(screen.getByText("Success Title")).toBeInTheDocument();
    expect(screen.getByText("Error Title")).toBeInTheDocument();
    expect(screen.getByText("Warning Title")).toBeInTheDocument();
  });

  it("generates unique IDs for each toast", async () => {
    const TestComponentWithIds = () => {
      const { addToast, toasts } = useToast();

      return (
        <div>
          <button
            onClick={() => addToast("success", "Toast 1")}
            data-testid="add-toast-1"
          >
            Add Toast 1
          </button>
          <button
            onClick={() => addToast("success", "Toast 2")}
            data-testid="add-toast-2"
          >
            Add Toast 2
          </button>
          <div data-testid="toast-ids">
            {toasts.map((toast) => toast.id).join(",")}
          </div>
        </div>
      );
    };

    renderWithToastProvider(<TestComponentWithIds />);

    await act(async () => {
      screen.getByTestId("add-toast-1").click();
      screen.getByTestId("add-toast-2").click();
    });

    const idsText = screen.getByTestId("toast-ids").textContent || "";
    const ids = idsText.split(",").filter(Boolean);

    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toEqual(ids[1]);
    expect(ids[0]).toMatch(/^[a-z0-9]+$/);
    expect(ids[1]).toMatch(/^[a-z0-9]+$/);
  });
});
