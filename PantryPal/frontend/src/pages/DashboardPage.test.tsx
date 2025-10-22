import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../test/utils";
import DashboardPage from "./DashboardPage";
import { itemsService } from "../services/items";
import { mockItems } from "../test/utils";

// Mock the items service
vi.mock("../services/items", () => ({
  itemsService: {
    getLowStockItems: vi.fn(),
  },
}));

// Mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Link: ({ children, to, ...props }: any) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders dashboard with welcome message", () => {
    vi.mocked(itemsService.getLowStockItems).mockResolvedValue([]);

    render(<DashboardPage />);

    expect(
      screen.getByRole("heading", { name: "Dashboard" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Welcome to PantryPal inventory management system")
    ).toBeInTheDocument();
  });

  it("displays dashboard cards/widgets", async () => {
    vi.mocked(itemsService.getLowStockItems).mockResolvedValue([]);

    render(<DashboardPage />);

    // Check for dashboard sections that might be present
    expect(
      screen.getByText(/total items/i) || screen.getByText(/inventory/i)
    ).toBeTruthy();
    expect(
      screen.getByText(/low stock/i) || screen.getByText(/alerts/i)
    ).toBeTruthy();
  });

  it("shows low stock items", async () => {
    const lowStockItems = [mockItems[1]]; // Item 2 is low stock
    vi.mocked(itemsService.getLowStockItems).mockResolvedValue(lowStockItems);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(itemsService.getLowStockItems).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText(lowStockItems[0].name)).toBeInTheDocument();
    });
  });

  it("shows empty state when no low stock items", async () => {
    vi.mocked(itemsService.getLowStockItems).mockResolvedValue([]);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/no low stock items/i) ||
          screen.getByText(/all items are well stocked/i)
      ).toBeTruthy();
    });
  });

  it("shows loading state", () => {
    // Make getLowStockItems hang to test loading state
    vi.mocked(itemsService.getLowStockItems).mockImplementation(
      () => new Promise(() => {})
    );

    render(<DashboardPage />);

    expect(
      screen.getByTestId("loading") || document.querySelector(".animate-spin")
    ).toBeTruthy();
  });

  it("handles API errors gracefully", async () => {
    vi.mocked(itemsService.getLowStockItems).mockRejectedValue(
      new Error("API Error")
    );

    render(<DashboardPage />);

    await waitFor(() => {
      // Should handle error gracefully - might show error message or empty state
      expect(
        screen.getByText(/error/i) ||
          screen.getByText(/failed/i) ||
          screen.getByText(/no items/i)
      ).toBeTruthy();
    });
  });

  it("has navigation links to key sections", () => {
    vi.mocked(itemsService.getLowStockItems).mockResolvedValue([]);

    render(<DashboardPage />);

    // Check for navigation links that might be present
    const links = screen.getAllByRole("link");
    const linkHrefs = links.map((link) => link.getAttribute("href"));

    // Common dashboard links
    expect(
      linkHrefs.some((href) => href?.includes("/items")) ||
        linkHrefs.some((href) => href?.includes("/inventory"))
    ).toBeTruthy();
  });

  it("displays statistics or metrics", async () => {
    vi.mocked(itemsService.getLowStockItems).mockResolvedValue([mockItems[1]]);

    render(<DashboardPage />);

    await waitFor(() => {
      // Look for any numerical displays that might represent stats
      expect(
        screen.getByText("1") || // Count of low stock items
          screen.getByText(/\d+/) || // Any number
          document.querySelector('[class*="stat"]') // Stat-related CSS classes
      ).toBeTruthy();
    });
  });

  it("provides quick access to add new items", () => {
    vi.mocked(itemsService.getLowStockItems).mockResolvedValue([]);

    render(<DashboardPage />);

    // Look for quick action buttons or links
    expect(
      screen.getByRole("link", { name: /add/i }) ||
        screen.getByRole("button", { name: /add/i }) ||
        screen.getByText(/add item/i)
    ).toBeTruthy();
  });

  it("shows recent activity or quick actions", () => {
    vi.mocked(itemsService.getLowStockItems).mockResolvedValue([]);

    render(<DashboardPage />);

    // Dashboard should have some actionable content
    expect(
      screen.getByText(/recent/i) ||
        screen.getByText(/activity/i) ||
        screen.getByText(/quick/i) ||
        screen.getByText(/action/i)
    ).toBeTruthy();
  });
});
