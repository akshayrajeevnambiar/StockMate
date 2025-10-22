// User types
export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  STAFF = "staff",
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// Item types
export enum ItemCategory {
  PRODUCE = "Produce",
  DAIRY = "Dairy",
  MEAT_SEAFOOD = "Meat & Seafood",
  DRY_GOODS = "Dry Goods",
  CANNED_GOODS = "Canned Goods",
  BEVERAGES = "Beverages",
  FROZEN_FOODS = "Frozen Foods",
  OTHER = "Other",
}

export interface Item {
  id: string;
  name: string;
  description?: string;
  category: ItemCategory;
  unit_of_measure: string;
  par_level: number;
  current_quantity: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ItemCreate {
  name: string;
  description?: string;
  category: ItemCategory;
  unit_of_measure: string;
  par_level: number;
  current_quantity: number;
}

export interface ItemUpdate {
  name?: string;
  description?: string;
  category?: ItemCategory;
  unit_of_measure?: string;
  par_level?: number;
  current_quantity?: number;
}

// Count types
export enum CountStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface CountItem {
  id: string;
  item_id: string;
  expected_quantity: number;
  actual_quantity: number;
  discrepancy: number;
  notes?: string;
}

export interface Count {
  id: string;
  count_date: string;
  status: CountStatus;
  created_by: string;
  submitted_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  notes?: string;
  items: CountItem[];
  created_at: string;
  updated_at: string;
}

export interface CountCreate {
  count_date: string;
  notes?: string;
  items: Array<{
    item_id: string;
    expected_quantity: number;
    actual_quantity: number;
    notes?: string;
  }>;
}
