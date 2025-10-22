import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../test/utils";
import userEvent from "@testing-library/user-event";
import ItemsPage from "./ItemsPage";
import { itemsService } from "../services/items";
import { mockItems } from "../test/utils";
import { ItemCategory } from "../types";

// Mock the items service
vi.mock("../services/items", () => ({
  itemsService: {
    getItems: vi.fn(),
    getLowStockItems: vi.fn(),
    deleteItem: vi.fn(),
  },
}));

// Mock react-router-dom
const mockUseSearchParams = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Link: ({ children, to, ...props }: any) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
    useSearchParams: () => [mockUseSearchParams(), vi.fn()],
  };
});

// Mock window.confirm
const mockConfirm = vi.fn();
Object.defineProperty(window, "confirm", { value: mockConfirm });

describe("ItemsPage", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
    vi.mocked(itemsService.getItems).mockResolvedValue(mockItems);
  });

  it("renders items list with all required elements", async () => {
    render(<ItemsPage />);

    expect(
      screen.getByRole("heading", { name: "Inventory Items" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Manage your pantry inventory items")
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /add item/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(mockItems[0].name)).toBeInTheDocument();
      expect(screen.getByText(mockItems[1].name)).toBeInTheDocument();
    });
  });

  it("shows loading state", () => {
    // Make getItems hang to test loading state
    vi.mocked(itemsService.getItems).mockImplementation(
      () => new Promise(() => {})
    );

    render(<ItemsPage />);

    expect(
      screen.getByTestId("loading-spinner") ||
        screen.getByRole("status", { name: /loading/i }) ||
        document.querySelector(".animate-spin")
    ).toBeTruthy();
  });

  it("handles empty items list", async () => {
    vi.mocked(itemsService.getItems).mockResolvedValue([]);

    render(<ItemsPage />);

    await waitFor(() => {
      expect(screen.getByText("No items")).toBeInTheDocument();
      expect(
        screen.getByText("Get started by creating a new item.")
      ).toBeInTheDocument();
    });
  });

  it("filters items by category", async () => {
    render(<ItemsPage />);

    await waitFor(() => {
      expect(screen.getByText(mockItems[0].name)).toBeInTheDocument();
    });

    // Find and interact with category filter
    const categorySelect = screen.getByLabelText(/filter by category/i);
    await user.selectOptions(categorySelect, ItemCategory.PRODUCE);

    await waitFor(() => {
      expect(itemsService.getItems).toHaveBeenCalledWith(ItemCategory.PRODUCE);
    });
  });

  it("displays low stock items when filter is set", async () => {
    const lowStockItems = [mockItems[1]]; // Item 2 is low stock (3 < 20)
    vi.mocked(itemsService.getLowStockItems).mockResolvedValue(lowStockItems);

    // Mock search params to include low-stock filter
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams("filter=low-stock")
    );

    render(<ItemsPage />);

    expect(
      screen.getByRole("heading", { name: "Low Stock Items" })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(itemsService.getLowStockItems).toHaveBeenCalled();
      expect(screen.getByText(lowStockItems[0].name)).toBeInTheDocument();
    });
  });

  it("shows low stock status for items below par level", async () => {
    render(<ItemsPage />);

    await waitFor(() => {
      // Both items in mock data have quantity < par_level, so should show low stock
      const lowStockElements = screen.getAllByText("Low Stock");
      expect(lowStockElements).toHaveLength(2);
    });
  });

  it("navigates to add item page when add button clicked", async () => {
    render(<ItemsPage />);

    const addButton = screen.getByRole("link", { name: /add item/i });
    expect(addButton).toHaveAttribute("href", "/items/new");
  });

  it("navigates to edit page when edit link clicked", async () => {
    render(<ItemsPage />);

    await waitFor(() => {
      expect(screen.getByText(mockItems[0].name)).toBeInTheDocument();
    });

    const editLinks = screen.getAllByRole("link", { name: "Edit" });
    expect(editLinks[0]).toHaveAttribute(
      "href",
      `/items/${mockItems[0].id}/edit`
    );
  });

  it("handles item deletion with confirmation", async () => {
    mockConfirm.mockReturnValue(true);
    vi.mocked(itemsService.deleteItem).mockResolvedValue(undefined);

    render(<ItemsPage />);

    await waitFor(() => {
      expect(screen.getByText(mockItems[0].name)).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    await user.click(deleteButtons[0]);

    expect(mockConfirm).toHaveBeenCalledWith(
      `Are you sure you want to delete "${mockItems[0].name}"?`
    );
    expect(itemsService.deleteItem).toHaveBeenCalledWith(mockItems[0].id);
  });

  it("cancels deletion when user clicks cancel", async () => {
    mockConfirm.mockReturnValue(false);

    render(<ItemsPage />);

    await waitFor(() => {
      expect(screen.getByText(mockItems[0].name)).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    await user.click(deleteButtons[0]);

    expect(mockConfirm).toHaveBeenCalled();
    expect(itemsService.deleteItem).not.toHaveBeenCalled();
  });

  it("displays item details correctly in table", async () => {
    render(<ItemsPage />);

    await waitFor(() => {
      const item = mockItems[0];
      expect(screen.getByText(item.name)).toBeInTheDocument();
      expect(screen.getByText(item.description!)).toBeInTheDocument();
      expect(screen.getByText(item.category)).toBeInTheDocument();
      expect(
        screen.getByText(`${item.current_quantity} ${item.unit_of_measure}`)
      ).toBeInTheDocument();
      expect(
        screen.getByText(`${item.par_level} ${item.unit_of_measure}`)
      ).toBeInTheDocument();
    });
  });

  it("handles API errors gracefully", async () => {
    vi.mocked(itemsService.getItems).mockRejectedValue(
      new Error("Network error")
    );

    render(<ItemsPage />);

    // When API fails, it should show empty state or error state
    await waitFor(() => {
      // The component might show "No items" or an error message
      expect(
        screen.getByText("No items") ||
          screen.getByText(/error/i) ||
          screen.getByText(/failed/i)
      ).toBeTruthy();
    });
  });
});
