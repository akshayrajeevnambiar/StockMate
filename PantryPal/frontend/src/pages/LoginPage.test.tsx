import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../test/utils";
import userEvent from "@testing-library/user-event";
import LoginPage from "./LoginPage";
import { authService } from "../services/auth";

// Mock the auth service
vi.mock("../services/auth", () => ({
  authService: {
    login: vi.fn(),
    isAuthenticated: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("LoginPage", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form with all elements", () => {
    render(<LoginPage />);

    expect(screen.getByText("PantryPal")).toBeInTheDocument();
    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("handles successful login", async () => {
    const mockLoginResponse = {
      access_token: "test-token",
      refresh_token: "test-refresh-token",
      token_type: "bearer",
    };

    vi.mocked(authService.login).mockResolvedValue(mockLoginResponse);

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: "Sign in" });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        username: "test@example.com",
        password: "password123",
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("displays error message on login failure", async () => {
    const errorResponse = {
      response: {
        data: {
          detail: "Invalid credentials",
        },
      },
    };
    vi.mocked(authService.login).mockRejectedValue(errorResponse);

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: "Sign in" });

    await user.type(emailInput, "wrong@example.com");
    await user.type(passwordInput, "wrongpass");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("displays generic error message when no detail provided", async () => {
    vi.mocked(authService.login).mockRejectedValue(new Error("Network error"));

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: "Sign in" });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Login failed. Please try again.")
      ).toBeInTheDocument();
    });
  });

  it("shows loading state while submitting", async () => {
    // Make login hang to test loading state
    vi.mocked(authService.login).mockImplementation(
      () => new Promise(() => {})
    );

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: "Sign in" });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Signing in..." })
      ).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  it("shows validation errors for empty fields", async () => {
    render(<LoginPage />);

    const submitButton = screen.getByRole("button", { name: "Sign in" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Email is required")).toBeInTheDocument();
      expect(screen.getByText("Password is required")).toBeInTheDocument();
    });

    // Should not call login service if fields are empty
    expect(authService.login).not.toHaveBeenCalled();
  });

  it("clears error message when form is resubmitted", async () => {
    // First submission with error
    vi.mocked(authService.login).mockRejectedValueOnce(
      new Error("Invalid credentials")
    );

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: "Sign in" });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "wrongpass");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Login failed. Please try again.")
      ).toBeInTheDocument();
    });

    // Second submission should clear error
    vi.mocked(authService.login).mockResolvedValueOnce({
      access_token: "token",
      refresh_token: "refresh",
      token_type: "bearer",
    });

    await user.clear(passwordInput);
    await user.type(passwordInput, "correctpass");
    await user.click(submitButton);

    // Error should be cleared (will disappear once the new request starts)
    await waitFor(() => {
      expect(
        screen.queryByText("Login failed. Please try again.")
      ).not.toBeInTheDocument();
    });
  });
});
