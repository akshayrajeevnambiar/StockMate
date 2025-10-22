import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../test/utils";
import userEvent from "@testing-library/user-event";
import ItemFormPage from "./ItemFormPage";
import { itemsService } from "../services/items";
import { mockItems } from "../test/utils";
import { ItemCategory } from "../types";

// Mock the items service
vi.mock("../services/items", () => ({
  itemsService: {
    getItem: vi.fn(),
    createItem: vi.fn(),
    updateItem: vi.fn(),
  },
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockUseParams = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  };
});

describe("ItemFormPage", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({});
  });

  it("renders create form when no ID provided", () => {
    render(<ItemFormPage />);

    expect(
      screen.getByRole("heading", { name: "Add New Item" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/unit of measure/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/par level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/current quantity/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create Item" })
    ).toBeInTheDocument();
  });

  it("renders edit form when ID provided", async () => {
    const itemId = mockItems[0].id;
    mockUseParams.mockReturnValue({ id: itemId });
    vi.mocked(itemsService.getItem).mockResolvedValue(mockItems[0]);

    render(<ItemFormPage />);

    expect(
      screen.getByRole("heading", { name: "Edit Item" })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(itemsService.getItem).toHaveBeenCalledWith(itemId);
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Update Item" })
      ).toBeInTheDocument();
    });
  });

  it("pre-fills form with item data in edit mode", async () => {
    const item = mockItems[0];
    mockUseParams.mockReturnValue({ id: item.id });
    vi.mocked(itemsService.getItem).mockResolvedValue(item);

    render(<ItemFormPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue(item.name)).toBeInTheDocument();
      expect(screen.getByDisplayValue(item.description!)).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(item.unit_of_measure)
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(item.par_level.toString())
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(item.current_quantity.toString())
      ).toBeInTheDocument();
    });
  });

  it("creates new item successfully", async () => {
    const newItemData = {
      name: "New Test Item",
      description: "A new test item",
      category: ItemCategory.PRODUCE,
      unit_of_measure: "pcs",
      par_level: 50,
      current_quantity: 25,
    };

    const newItem = {
      id: "new-id",
      ...newItemData,
      created_by: "user-id",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    vi.mocked(itemsService.createItem).mockResolvedValue(newItem);

    render(<ItemFormPage />);

    // Fill out the form
    await user.type(screen.getByLabelText(/name/i), "New Test Item");
    await user.type(screen.getByLabelText(/description/i), "A new test item");
    await user.selectOptions(
      screen.getByLabelText(/category/i),
      ItemCategory.PRODUCE
    );
    await user.type(screen.getByLabelText(/unit of measure/i), "pcs");
    await user.type(screen.getByLabelText(/par level/i), "50");
    await user.type(screen.getByLabelText(/current quantity/i), "25");

    // Submit the form
    await user.click(screen.getByRole("button", { name: "Create Item" }));

    await waitFor(() => {
      expect(itemsService.createItem).toHaveBeenCalledWith({
        name: "New Test Item",
        description: "A new test item",
        category: ItemCategory.PRODUCE,
        unit_of_measure: "pcs",
        par_level: 50,
        current_quantity: 25,
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/items");
    });
  });

  it("updates existing item successfully", async () => {
    const item = mockItems[0];
    const updatedItem = { ...item, name: "Updated Item Name" };

    mockUseParams.mockReturnValue({ id: item.id });
    vi.mocked(itemsService.getItem).mockResolvedValue(item);
    vi.mocked(itemsService.updateItem).mockResolvedValue(updatedItem);

    render(<ItemFormPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue(item.name)).toBeInTheDocument();
    });

    // Update the name
    const nameInput = screen.getByLabelText(/name/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Item Name");

    // Submit the form
    await user.click(screen.getByRole("button", { name: "Update Item" }));

    await waitFor(() => {
      expect(itemsService.updateItem).toHaveBeenCalledWith(
        item.id,
        expect.objectContaining({
          name: "Updated Item Name",
        })
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/items");
    });
  });

  it("shows validation errors for required fields", async () => {
    render(<ItemFormPage />);

    // Try to submit empty form
    await user.click(screen.getByRole("button", { name: "Create Item" }));

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
      expect(screen.getByText("Category is required")).toBeInTheDocument();
      expect(
        screen.getByText("Unit of measure is required")
      ).toBeInTheDocument();
      expect(screen.getByText("Par level is required")).toBeInTheDocument();
      expect(
        screen.getByText("Current quantity is required")
      ).toBeInTheDocument();
    });

    expect(itemsService.createItem).not.toHaveBeenCalled();
  });

  it("validates numeric fields", async () => {
    render(<ItemFormPage />);

    const parLevelInput = screen.getByLabelText(/par level/i);
    const quantityInput = screen.getByLabelText(/current quantity/i);

    await user.type(parLevelInput, "-5");
    await user.type(quantityInput, "invalid");

    await user.click(screen.getByRole("button", { name: "Create Item" }));

    await waitFor(() => {
      expect(
        screen.getByText("Par level must be a positive number")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Current quantity must be a valid number")
      ).toBeInTheDocument();
    });
  });

  it("handles create API errors", async () => {
    vi.mocked(itemsService.createItem).mockRejectedValue(
      new Error("Creation failed")
    );

    render(<ItemFormPage />);

    // Fill required fields
    await user.type(screen.getByLabelText(/name/i), "Test Item");
    await user.selectOptions(
      screen.getByLabelText(/category/i),
      ItemCategory.PRODUCE
    );
    await user.type(screen.getByLabelText(/unit of measure/i), "pcs");
    await user.type(screen.getByLabelText(/par level/i), "50");
    await user.type(screen.getByLabelText(/current quantity/i), "25");

    await user.click(screen.getByRole("button", { name: "Create Item" }));

    await waitFor(() => {
      expect(screen.getByText(/creation failed/i)).toBeInTheDocument();
    });
  });

  it("handles update API errors", async () => {
    const item = mockItems[0];
    mockUseParams.mockReturnValue({ id: item.id });
    vi.mocked(itemsService.getItem).mockResolvedValue(item);
    vi.mocked(itemsService.updateItem).mockRejectedValue(
      new Error("Update failed")
    );

    render(<ItemFormPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue(item.name)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Update Item" }));

    await waitFor(() => {
      expect(screen.getByText(/update failed/i)).toBeInTheDocument();
    });
  });

  it("navigates back to items list when cancel button clicked", async () => {
    render(<ItemFormPage />);

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith("/items");
  });

  it("shows loading state while submitting", async () => {
    // Make createItem hang to test loading state
    vi.mocked(itemsService.createItem).mockImplementation(
      () => new Promise(() => {})
    );

    render(<ItemFormPage />);

    // Fill required fields
    await user.type(screen.getByLabelText(/name/i), "Test Item");
    await user.selectOptions(
      screen.getByLabelText(/category/i),
      ItemCategory.PRODUCE
    );
    await user.type(screen.getByLabelText(/unit of measure/i), "pcs");
    await user.type(screen.getByLabelText(/par level/i), "50");
    await user.type(screen.getByLabelText(/current quantity/i), "25");

    await user.click(screen.getByRole("button", { name: "Create Item" }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Creating..." })
      ).toBeInTheDocument();
    });
  });
});
