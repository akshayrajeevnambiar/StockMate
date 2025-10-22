import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "./auth";
import { mockLocalStorage } from "../test/utils";

// Mock the api module
const mockApiClient = {
  post: vi.fn(),
  get: vi.fn(),
};

vi.mock("./api", () => ({
  default: mockApiClient,
}));

// Mock window.location
const mockLocation = {
  href: "",
};
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

describe("Auth Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockLocation.href = "";
  });

  describe("login", () => {
    it("should login successfully and store tokens", async () => {
      const mockResponse = {
        data: {
          access_token: "mock-access-token",
          refresh_token: "mock-refresh-token",
          token_type: "bearer",
        },
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const credentials = { username: "testuser", password: "password123" };
      const result = await authService.login(credentials);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/auth/login",
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "access_token",
        "mock-access-token"
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "refresh_token",
        "mock-refresh-token"
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw error on login failure", async () => {
      const mockError = new Error("Invalid credentials");
      mockApiClient.post.mockRejectedValue(mockError);

      const credentials = { username: "wronguser", password: "wrongpass" };

      await expect(authService.login(credentials)).rejects.toThrow(
        "Invalid credentials"
      );
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe("getCurrentUser", () => {
    it("should fetch current user successfully", async () => {
      const mockUser = {
        id: "123",
        username: "testuser",
        email: "test@example.com",
        full_name: "Test User",
        role: "staff" as const,
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      mockApiClient.get.mockResolvedValue({ data: mockUser });

      const result = await authService.getCurrentUser();

      expect(mockApiClient.get).toHaveBeenCalledWith("/auth/me");
      expect(result).toEqual(mockUser);
    });

    it("should handle API errors", async () => {
      mockApiClient.get.mockRejectedValue(new Error("Unauthorized"));

      await expect(authService.getCurrentUser()).rejects.toThrow(
        "Unauthorized"
      );
    });
  });

  describe("logout", () => {
    it("should clear stored tokens and redirect to login", () => {
      authService.logout();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("access_token");
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("refresh_token");
      expect(mockLocation.href).toBe("/login");
    });
  });

  describe("isAuthenticated", () => {
    it("should return true when access token exists", () => {
      mockLocalStorage.getItem.mockReturnValue("mock-token");

      const result = authService.isAuthenticated();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("access_token");
      expect(result).toBe(true);
    });

    it("should return false when no access token exists", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe("getToken", () => {
    it("should return stored access token", () => {
      const mockToken = "mock-access-token";
      mockLocalStorage.getItem.mockReturnValue(mockToken);

      const result = authService.getToken();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("access_token");
      expect(result).toBe(mockToken);
    });

    it("should return null when no token exists", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = authService.getToken();

      expect(result).toBeNull();
    });
  });
});
