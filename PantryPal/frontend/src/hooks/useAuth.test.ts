import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "../test/utils";
import { useAuth } from "./useAuth";
import { authService } from "../services/auth";
import { mockUser } from "../test/utils";

// Mock the auth service
vi.mock("../services/auth", () => ({
  authService: {
    getCurrentUser: vi.fn(),
    isAuthenticated: vi.fn(),
    logout: vi.fn(),
  },
}));

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns user data when authenticated", async () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false); // Initially false until user loads

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("returns no user when not authenticated", () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(false);

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(authService.getCurrentUser).not.toHaveBeenCalled();
  });

  it("handles authentication errors", async () => {
    const error = new Error("Authentication failed");
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);
    vi.mocked(authService.getCurrentUser).mockRejectedValue(error);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeUndefined();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeTruthy();
  });

  it("provides logout function", async () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    result.current.logout();

    expect(authService.logout).toHaveBeenCalled();
  });

  it("does not retry failed requests", async () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);
    vi.mocked(authService.getCurrentUser).mockRejectedValue(
      new Error("Network error")
    );

    renderHook(() => useAuth());

    await waitFor(() => {
      expect(authService.getCurrentUser).toHaveBeenCalledTimes(1);
    });

    // Should not retry after error
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(authService.getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it("updates authentication status when user data changes", async () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

    const { result, rerender } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    // Simulate user becoming unauthenticated
    vi.mocked(authService.isAuthenticated).mockReturnValue(false);
    rerender();

    expect(result.current.isAuthenticated).toBe(true); // Still true because we have user data

    // But if user data is cleared (logout), authentication should be false
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null as any);
    rerender();

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
