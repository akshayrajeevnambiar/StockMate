import { describe, it, expect, vi, beforeEach } from "vitest";
import { itemsService } from "./items";
import { mockItems } from "../test/utils";
import { ItemCategory } from "../types";

// Mock the api module
const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock("./api", () => ({
  default: mockApiClient,
}));

describe("Items Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getItems", () => {
    it("should fetch all items when no category specified", async () => {
      mockApiClient.get.mockResolvedValue({ data: mockItems });

      const result = await itemsService.getItems();

      expect(mockApiClient.get).toHaveBeenCalledWith("/items", { params: {} });
      expect(result).toEqual(mockItems);
    });

    it("should fetch items by category when category specified", async () => {
      const filteredItems = mockItems.filter(
        (item) => item.category === "Produce"
      );
      mockApiClient.get.mockResolvedValue({ data: filteredItems });

      const result = await itemsService.getItems(ItemCategory.PRODUCE);

      expect(mockApiClient.get).toHaveBeenCalledWith("/items", {
        params: { category: ItemCategory.PRODUCE },
      });
      expect(result).toEqual(filteredItems);
    });

    it("should handle API errors", async () => {
      mockApiClient.get.mockRejectedValue(new Error("Network error"));

      await expect(itemsService.getItems()).rejects.toThrow("Network error");
    });
  });

  describe("getItem", () => {
    it("should fetch a single item by ID", async () => {
      const item = mockItems[0];
      mockApiClient.get.mockResolvedValue({ data: item });

      const result = await itemsService.getItem(item.id);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/items/${item.id}`);
      expect(result).toEqual(item);
    });

    it("should handle item not found", async () => {
      mockApiClient.get.mockRejectedValue(new Error("Item not found"));

      await expect(itemsService.getItem("non-existent-id")).rejects.toThrow(
        "Item not found"
      );
    });
  });

  describe("getLowStockItems", () => {
    it("should fetch low stock items", async () => {
      const lowStockItems = mockItems.filter(
        (item) => item.current_quantity < item.par_level
      );
      mockApiClient.get.mockResolvedValue({ data: lowStockItems });

      const result = await itemsService.getLowStockItems();

      expect(mockApiClient.get).toHaveBeenCalledWith("/items/low-stock");
      expect(result).toEqual(lowStockItems);
    });
  });

  describe("createItem", () => {
    it("should create a new item", async () => {
      const newItemData = {
        name: "New Test Item",
        description: "A new test item",
        category: ItemCategory.PRODUCE,
        unit_of_measure: "pcs",
        par_level: 100,
        current_quantity: 20,
      };

      const createdItem = {
        id: "123e4567-e89b-12d3-a456-426614174020",
        ...newItemData,
        created_by: "123e4567-e89b-12d3-a456-426614174000",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      mockApiClient.post.mockResolvedValue({ data: createdItem });

      const result = await itemsService.createItem(newItemData);

      expect(mockApiClient.post).toHaveBeenCalledWith("/items", newItemData);
      expect(result).toEqual(createdItem);
    });

    it("should handle validation errors", async () => {
      const invalidItemData = {
        name: "", // Invalid: empty name
        category: ItemCategory.PRODUCE,
        unit_of_measure: "pcs",
        par_level: -1, // Invalid: negative par level
        current_quantity: 10,
      };

      mockApiClient.post.mockRejectedValue(new Error("Validation failed"));

      await expect(itemsService.createItem(invalidItemData)).rejects.toThrow(
        "Validation failed"
      );
    });
  });

  describe("updateItem", () => {
    it("should update an existing item", async () => {
      const itemId = mockItems[0].id;
      const updateData = {
        name: "Updated Item Name",
        current_quantity: 25,
      };

      const updatedItem = {
        ...mockItems[0],
        ...updateData,
        updated_at: "2024-01-02T00:00:00Z",
      };

      mockApiClient.put.mockResolvedValue({ data: updatedItem });

      const result = await itemsService.updateItem(itemId, updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        `/items/${itemId}`,
        updateData
      );
      expect(result).toEqual(updatedItem);
    });

    it("should handle update errors", async () => {
      mockApiClient.put.mockRejectedValue(new Error("Update failed"));

      await expect(itemsService.updateItem("invalid-id", {})).rejects.toThrow(
        "Update failed"
      );
    });
  });

  describe("deleteItem", () => {
    it("should delete an item", async () => {
      const itemId = mockItems[0].id;
      mockApiClient.delete.mockResolvedValue({});

      await itemsService.deleteItem(itemId);

      expect(mockApiClient.delete).toHaveBeenCalledWith(`/items/${itemId}`);
    });

    it("should handle delete errors", async () => {
      mockApiClient.delete.mockRejectedValue(new Error("Delete failed"));

      await expect(itemsService.deleteItem("invalid-id")).rejects.toThrow(
        "Delete failed"
      );
    });
  });
});
