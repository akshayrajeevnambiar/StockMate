# Submit Flow Test Documentation

This document outlines the test cases created for the inventory counts submit flow functionality. The tests verify that the enhanced UI feedback, toast notifications, and error handling work correctly.

## Test Files Created

### 1. `ToastProvider.test.tsx`

Tests the toast notification system that provides user feedback throughout the submit flow.

**Test Coverage:**

- ✅ Toast context provides functions to children components
- ✅ Throws error when used outside provider
- ✅ Adds different types of toasts (success, error, warning, info)
- ✅ Handles toast styling correctly for each type
- ⚠️ Auto-removal timing (needs adjustment for CI)
- ⚠️ Manual removal via close button (needs adjustment for CI)
- ✅ Multiple toasts handling
- ✅ Unique ID generation for each toast

### 2. `Toast.test.tsx`

Tests individual toast component functionality.

**Test Coverage:**

- ✅ Renders toast with title and message
- ✅ Renders toast without message
- ⚠️ Icon display verification (SVG role detection needs adjustment)
- ⚠️ Background color application (CSS class verification needs adjustment)
- ⚠️ Timer-based auto-removal (needs timing adjustment)
- ✅ Cleanup on unmount

### 3. `counts.test.tsx`

Tests the counts API service functionality and React Query hooks.

**Test Coverage:**

- ✅ useCounts hook fetches data successfully
- ✅ Error handling for failed requests
- ✅ useSubmitCount mutation with API calls
- ✅ useApproveCount, useRejectCount, useDeleteCount mutations
- ✅ Utility functions (getStatusColor, getStatusIcon, formatCountDate, calculateTotalDiscrepancy)
- ✅ HTTP status code error handling (403, 404, 400, network errors)
- ✅ Authentication token inclusion in requests

### 4. `CountsPage.test.tsx`

Tests the main counts page component with mocked dependencies.

**Test Coverage:**

- ✅ Page rendering with header and stats
- ✅ Loading state display
- ✅ Error state handling
- ✅ Empty state when no counts
- ✅ Count list display with status information
- ✅ Submit button functionality
- ✅ Approve/Reject button functionality
- ✅ Delete button functionality
- ✅ Modal interactions for reject action
- ✅ Loading states on action buttons
- ✅ API error handling with toast notifications
- ✅ Success message display after actions

### 5. `CountsPage.integration.test.tsx`

Simplified integration tests focusing on the complete submit flow.

**Test Coverage:**

- 🔄 Full page rendering with counts and action buttons
- 🔄 Submit action end-to-end flow
- 🔄 Approve action end-to-end flow
- 🔄 Reject action with modal and reason input
- 🔄 Error handling with toast feedback
- 🔄 Success messages after successful actions
- 🔄 Loading state verification during actions

## Key Submit Flow Features Tested

### 1. Enhanced Button States

- **Loading States**: Buttons show loading spinners and disable during API calls
- **Visual Feedback**: Gradient backgrounds and hover effects
- **Status-based Actions**: Different buttons shown based on count status

### 2. Toast Notification System

- **Success Notifications**: Confirm successful actions with specific messages
- **Error Notifications**: Show detailed error information based on HTTP status codes
- **Info Notifications**: Provide feedback during long-running operations
- **Auto-dismiss**: Toasts automatically disappear after set duration
- **Manual Close**: Users can close toasts manually

### 3. Error Handling

- **403 Forbidden**: "You do not have permission to submit counts"
- **404 Not Found**: "The count you are trying to submit no longer exists"
- **400 Bad Request**: "This count cannot be submitted. Please check its status"
- **Network Errors**: "Unable to connect to the server. Please try again"
- **Generic Errors**: Fallback error messages for unexpected issues

### 4. Workflow Actions

- **Submit for Review**: Draft counts can be submitted for approval
- **Approve**: Submitted counts can be approved by authorized users
- **Reject**: Submitted counts can be rejected with a required reason
- **Delete**: Draft counts can be deleted

## Test Status Summary

| Component       | Unit Tests  | Integration Tests | Status       |
| --------------- | ----------- | ----------------- | ------------ |
| ToastProvider   | ✅ Partial  | ⚠️ Timing Issues  | 80% Complete |
| Toast Component | ✅ Partial  | ⚠️ DOM Queries    | 70% Complete |
| Counts Service  | ✅ Complete | ✅ Complete       | 95% Complete |
| CountsPage      | ✅ Complete | 🔄 In Progress    | 85% Complete |

## Known Issues & Improvements Needed

### Testing Issues

1. **Timer-based tests**: Auto-removal timing tests fail in CI environment
2. **SVG role detection**: Icon tests need adjustment for SVG accessibility
3. **CSS class verification**: Background color tests need better DOM selectors
4. **Provider wrapping**: Integration tests need proper context providers

### Code Improvements

1. **Confirmation dialogs**: Add confirmation for critical actions
2. **Status animations**: Smooth transitions when count status changes
3. **Optimistic updates**: Update UI immediately, revert on failure
4. **Retry mechanisms**: Allow users to retry failed actions

## Running the Tests

```bash
# Run all tests
npm test

# Run specific test files
npm test -- --run src/components/ToastProvider.test.tsx
npm test -- --run src/components/Toast.test.tsx
npm test -- --run src/services/counts.test.tsx
npm test -- --run src/pages/CountsPage.test.tsx

# Run tests in watch mode
npm test -- --watch
```

## Test Environment Setup

The tests use:

- **Vitest**: Test runner and assertion library
- **React Testing Library**: DOM testing utilities
- **MSW**: Mock Service Worker for API mocking (recommended for integration tests)
- **React Query**: State management testing with QueryClient
- **Fake Timers**: For testing time-based functionality

## Recommendations for Production

1. **Fix timing-sensitive tests** by using mock timers properly
2. **Add E2E tests** with Playwright or Cypress for full user journey testing
3. **Implement visual regression testing** for UI components
4. **Add accessibility testing** for screen reader compatibility
5. **Create performance tests** for large count datasets
