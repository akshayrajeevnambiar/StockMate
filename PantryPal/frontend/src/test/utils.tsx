import type { ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import { ItemCategory, UserRole } from "../types";

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };

// Mock data
export const mockUser = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  email: "test@example.com",
  full_name: "Test User",
  role: UserRole.STAFF,
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

export const mockAdminUser = {
  ...mockUser,
  id: "123e4567-e89b-12d3-a456-426614174001",
  email: "admin@example.com",
  full_name: "Admin User",
  role: UserRole.ADMIN,
};

export const mockItems = [
  {
    id: "123e4567-e89b-12d3-a456-426614174010",
    name: "Test Item 1",
    description: "A test item",
    category: ItemCategory.PRODUCE,
    unit_of_measure: "pcs",
    par_level: 50,
    current_quantity: 10,
    created_by: "123e4567-e89b-12d3-a456-426614174000",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174011",
    name: "Test Item 2",
    description: "Another test item",
    category: ItemCategory.DAIRY,
    unit_of_measure: "bottles",
    par_level: 20,
    current_quantity: 3,
    created_by: "123e4567-e89b-12d3-a456-426614174000",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

// Mock localStorage
export const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Setup localStorage mock
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});
