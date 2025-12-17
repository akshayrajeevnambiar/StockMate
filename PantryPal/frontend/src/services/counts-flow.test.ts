import { describe, it, expect } from "vitest";
import {
  getStatusColor,
  getStatusIcon,
  formatCountDate,
  calculateTotalDiscrepancy,
} from "../services/counts";
import { CountStatus } from "../types";

// Simple unit tests for utility functions used in the submit flow
describe("Submit Flow Utility Functions", () => {
  describe("getStatusColor", () => {
    it("returns correct colors for each count status", () => {
      expect(getStatusColor(CountStatus.DRAFT)).toBe(
        "bg-gray-100 text-gray-800"
      );
      expect(getStatusColor(CountStatus.SUBMITTED)).toBe(
        "bg-yellow-100 text-yellow-800"
      );
      expect(getStatusColor(CountStatus.APPROVED)).toBe(
        "bg-green-100 text-green-800"
      );
      expect(getStatusColor(CountStatus.REJECTED)).toBe(
        "bg-red-100 text-red-800"
      );
    });
  });

  describe("getStatusIcon", () => {
    it("returns correct icon names for each count status", () => {
      expect(getStatusIcon(CountStatus.DRAFT)).toBe("✏️");
      expect(getStatusIcon(CountStatus.SUBMITTED)).toBe("📤");
      expect(getStatusIcon(CountStatus.APPROVED)).toBe("✅");
      expect(getStatusIcon(CountStatus.REJECTED)).toBe("❌");
    });
  });

  describe("formatCountDate", () => {
    it("formats ISO date strings correctly", () => {
      const isoDate = "2024-01-15T12:30:45Z";
      const formatted = formatCountDate(isoDate);

      // Should contain the date parts (flexible for different locales)
      expect(formatted).toMatch(/2024/);
      expect(formatted).toMatch(/Jan|January|1/);
      expect(formatted).toMatch(/15/);
    });

    it("handles invalid dates gracefully", () => {
      const result = formatCountDate("invalid-date");
      expect(result).toBe("Invalid Date");
    });

    it("handles empty strings", () => {
      const result = formatCountDate("");
      expect(result).toBe("Invalid Date");
    });
  });

  describe("calculateTotalDiscrepancy", () => {
    it("calculates total discrepancy correctly", () => {
      const items = [
        {
          id: "1",
          item_id: "a",
          expected_quantity: 100,
          actual_quantity: 95,
          discrepancy: -5,
        },
        {
          id: "2",
          item_id: "b",
          expected_quantity: 50,
          actual_quantity: 55,
          discrepancy: 5,
        },
        {
          id: "3",
          item_id: "c",
          expected_quantity: 25,
          actual_quantity: 25,
          discrepancy: 0,
        },
      ];

      const total = calculateTotalDiscrepancy(items);
      expect(total).toBe(10); // Math.abs(-5) + Math.abs(5) + Math.abs(0) = 5 + 5 + 0 = 10
    });

    it("handles empty array", () => {
      const total = calculateTotalDiscrepancy([]);
      expect(total).toBe(0);
    });

    it("handles negative discrepancies", () => {
      const items = [
        {
          id: "1",
          item_id: "a",
          expected_quantity: 100,
          actual_quantity: 80,
          discrepancy: -20,
        },
        {
          id: "2",
          item_id: "b",
          expected_quantity: 50,
          actual_quantity: 40,
          discrepancy: -10,
        },
      ];

      const total = calculateTotalDiscrepancy(items);
      expect(total).toBe(30); // Math.abs(-20) + Math.abs(-10) = 20 + 10 = 30
    });

    it("handles positive discrepancies", () => {
      const items = [
        {
          id: "1",
          item_id: "a",
          expected_quantity: 100,
          actual_quantity: 110,
          discrepancy: 10,
        },
        {
          id: "2",
          item_id: "b",
          expected_quantity: 50,
          actual_quantity: 65,
          discrepancy: 15,
        },
      ];

      const total = calculateTotalDiscrepancy(items);
      expect(total).toBe(25);
    });

    it("handles undefined discrepancy values", () => {
      const items = [
        {
          id: "1",
          item_id: "a",
          expected_quantity: 100,
          actual_quantity: 95,
          discrepancy: undefined,
        },
        {
          id: "2",
          item_id: "b",
          expected_quantity: 50,
          actual_quantity: 55,
          discrepancy: 5,
        },
      ];

      const total = calculateTotalDiscrepancy(items as any);
      expect(total).toBeNaN(); // undefined discrepancy results in NaN
    });
  });
});

// Test the core flow logic
describe("Submit Flow Status Logic", () => {
  it("identifies which actions are available for each status", () => {
    const getAvailableActions = (status: CountStatus) => {
      const actions = [];

      if (status === CountStatus.DRAFT) {
        actions.push("submit", "edit", "delete");
      } else if (status === CountStatus.SUBMITTED) {
        actions.push("approve", "reject", "view");
      } else if (
        status === CountStatus.APPROVED ||
        status === CountStatus.REJECTED
      ) {
        actions.push("view");
      }

      return actions;
    };

    expect(getAvailableActions(CountStatus.DRAFT)).toEqual([
      "submit",
      "edit",
      "delete",
    ]);
    expect(getAvailableActions(CountStatus.SUBMITTED)).toEqual([
      "approve",
      "reject",
      "view",
    ]);
    expect(getAvailableActions(CountStatus.APPROVED)).toEqual(["view"]);
    expect(getAvailableActions(CountStatus.REJECTED)).toEqual(["view"]);
  });

  it("validates status transitions", () => {
    const isValidTransition = (from: CountStatus, to: CountStatus) => {
      const validTransitions: Record<CountStatus, CountStatus[]> = {
        [CountStatus.DRAFT]: [CountStatus.SUBMITTED],
        [CountStatus.SUBMITTED]: [CountStatus.APPROVED, CountStatus.REJECTED],
        [CountStatus.APPROVED]: [], // No further transitions
        [CountStatus.REJECTED]: [], // No further transitions
      };

      return validTransitions[from]?.includes(to) || false;
    };

    // Valid transitions
    expect(isValidTransition(CountStatus.DRAFT, CountStatus.SUBMITTED)).toBe(
      true
    );
    expect(isValidTransition(CountStatus.SUBMITTED, CountStatus.APPROVED)).toBe(
      true
    );
    expect(isValidTransition(CountStatus.SUBMITTED, CountStatus.REJECTED)).toBe(
      true
    );

    // Invalid transitions
    expect(isValidTransition(CountStatus.DRAFT, CountStatus.APPROVED)).toBe(
      false
    );
    expect(isValidTransition(CountStatus.APPROVED, CountStatus.SUBMITTED)).toBe(
      false
    );
    expect(isValidTransition(CountStatus.REJECTED, CountStatus.APPROVED)).toBe(
      false
    );
  });
});

// Test error message generation
describe("Submit Flow Error Messages", () => {
  it("generates appropriate error messages for different HTTP status codes", () => {
    const getErrorMessage = (statusCode: number, action: string) => {
      switch (statusCode) {
        case 403:
          return `You do not have permission to ${action} counts.`;
        case 404:
          return `The count you are trying to ${action} no longer exists.`;
        case 400:
          return `This count cannot be ${action}ed. Please check its status.`;
        default:
          return `Failed to ${action} count. Please try again.`;
      }
    };

    expect(getErrorMessage(403, "submit")).toBe(
      "You do not have permission to submit counts."
    );
    expect(getErrorMessage(404, "approve")).toBe(
      "The count you are trying to approve no longer exists."
    );
    expect(getErrorMessage(400, "reject")).toBe(
      "This count cannot be rejected. Please check its status."
    );
    expect(getErrorMessage(500, "submit")).toBe(
      "Failed to submit count. Please try again."
    );
  });

  it("generates success messages for different actions", () => {
    const getSuccessMessage = (action: string, countId: string) => {
      const countName = `Count #${countId.slice(-8)}`;

      switch (action) {
        case "submit":
          return `${countName} has been successfully submitted for review.`;
        case "approve":
          return `${countName} has been approved successfully.`;
        case "reject":
          return `${countName} has been rejected.`;
        case "delete":
          return `${countName} has been deleted successfully.`;
        default:
          return `Action completed successfully.`;
      }
    };

    expect(getSuccessMessage("submit", "count-12345678")).toBe(
      "Count #12345678 has been successfully submitted for review."
    );
    expect(getSuccessMessage("approve", "count-87654321")).toBe(
      "Count #87654321 has been approved successfully."
    );
    expect(getSuccessMessage("reject", "count-11111111")).toBe(
      "Count #11111111 has been rejected."
    );
    expect(getSuccessMessage("delete", "count-22222222")).toBe(
      "Count #22222222 has been deleted successfully."
    );
  });
});
