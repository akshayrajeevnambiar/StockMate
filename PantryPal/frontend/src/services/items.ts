import apiClient from "./api";
import type { Item, ItemCreate, ItemUpdate, ItemCategory } from "../types";

export const itemsService = {
  async getItems(category?: ItemCategory): Promise<Item[]> {
    const params = category ? { category } : {};
    const response = await apiClient.get<Item[]>("/items", { params });
    return response.data;
  },

  async getItem(id: string): Promise<Item> {
    const response = await apiClient.get<Item>(`/items/${id}`);
    return response.data;
  },

  async getLowStockItems(): Promise<Item[]> {
    const response = await apiClient.get<Item[]>("/items/low-stock");
    return response.data;
  },

  async createItem(item: ItemCreate): Promise<Item> {
    const response = await apiClient.post<Item>("/items", item);
    return response.data;
  },

  async updateItem(id: string, item: ItemUpdate): Promise<Item> {
    const response = await apiClient.put<Item>(`/items/${id}`, item);
    return response.data;
  },

  async deleteItem(id: string): Promise<void> {
    await apiClient.delete(`/items/${id}`);
  },
};
