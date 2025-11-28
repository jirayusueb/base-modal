import { render, screen } from "@testing-library/react";
import React from "react";
import { vi } from "vitest";
import { ErrorBoundary } from "./error-boundary";
import {
  BaseModalError,
  ModalNotFoundError,
} from "@/utils/errors";

/**
 * Test Perspective Table for ErrorBoundary Component
 *
 * | Case ID | Input / Precondition | Perspective (Equivalence / Boundary) | Expected Result | Notes |
 * |---------|----------------------|--------------------------------------|-----------------|-------|
 * | TC-N-01 | ErrorBoundary with children (no error) | Equivalence - normal | Children rendered correctly | - |
 * | TC-N-02 | ErrorBoundary catches generic Error | Equivalence - normal | Default error UI displayed | - |
 * | TC-N-03 | ErrorBoundary catches BaseModalError | Equivalence - normal | BaseModalError UI displayed with code | - |
 * | TC-N-04 | ErrorBoundary with custom fallback | Equivalence - normal | Custom fallback rendered | - |
 * | TC-N-05 | ErrorBoundary with onError callback | Equivalence - normal | Callback called with error and info | - |
 * | TC-A-01 | ErrorBoundary with BaseModalError without code | Boundary - empty code | Error UI displayed without code section | - |
 * | TC-A-02 | ErrorBoundary with Error without message | Boundary - empty message | Default message displayed | - |
 * | TC-B-01 | ErrorBoundary with null children | Boundary - NULL | Renders null | - |
 * | TC-B-02 | ErrorBoundary with undefined children | Boundary - undefined | Renders undefined | - |
 */

// Component that throws an error
class ThrowError extends React.Component<{ error?: Error }> {
  componentDidMount() {
    if (this.props.error) {
      throw this.props.error;
    }
  }

  render() {
    return <div>No error</div>;
  }
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    // Suppress console.error in tests
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("ErrorBoundary with children (no error)", () => {
    // Given: ErrorBoundary with children that don't throw
    // When: Component is rendered
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>,
    );

    // Then: Children should be rendered
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("ErrorBoundary catches generic Error", () => {
    // Given: ErrorBoundary with component that throws generic Error
    const error = new Error("Generic error message");

    // When: Component throws error
    render(
      <ErrorBoundary>
        <ThrowError error={error} />
      </ErrorBoundary>,
    );

    // Then: Default error UI should be displayed
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Generic error message")).toBeInTheDocument();
    expect(screen.getByText("Generic error message")).toHaveClass(
      "base-modal-error-message",
    );
  });

  it("ErrorBoundary catches BaseModalError", () => {
    // Given: ErrorBoundary with component that throws BaseModalError
    const error = new ModalNotFoundError("test-modal");

    // When: Component throws BaseModalError
    render(
      <ErrorBoundary>
        <ThrowError error={error} />
      </ErrorBoundary>,
    );

    // Then: BaseModalError UI should be displayed with code
    expect(screen.getByText("Modal Error")).toBeInTheDocument();
    expect(screen.getByText(/Modal with id "test-modal" not found/)).toBeInTheDocument();
    expect(screen.getByText(/Error Code: MODAL_NOT_FOUND/)).toBeInTheDocument();
  });

  it("ErrorBoundary with custom fallback", () => {
    // Given: ErrorBoundary with custom fallback function
    const error = new Error("Test error");
    const fallback = vi.fn((err: Error, errorInfo: React.ErrorInfo) => (
      <div>Custom error: {err.message}</div>
    ));

    // When: Component throws error
    render(
      <ErrorBoundary fallback={fallback}>
        <ThrowError error={error} />
      </ErrorBoundary>,
    );

    // Then: Custom fallback should be rendered
    expect(fallback).toHaveBeenCalled();
    expect(screen.getByText("Custom error: Test error")).toBeInTheDocument();
  });

  it("ErrorBoundary with onError callback", () => {
    // Given: ErrorBoundary with onError callback
    const error = new Error("Test error");
    const onError = vi.fn();
    const errorInfo = {
      componentStack: "Test stack",
    } as React.ErrorInfo;

    // When: Component throws error
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError error={error} />
      </ErrorBoundary>,
    );

    // Then: onError callback should be called with error and errorInfo
    expect(onError).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      }),
    );
  });

  it("ErrorBoundary logs BaseModalError correctly", () => {
    // Given: ErrorBoundary with BaseModalError
    const error = new ModalNotFoundError("test-modal");
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // When: Component throws BaseModalError
    render(
      <ErrorBoundary>
        <ThrowError error={error} />
      </ErrorBoundary>,
    );

    // Then: console.error should be called with BaseModalError format
    // Format: `[BaseModal Error] ${error.code}: ${error.message}`, error.context, errorInfo
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("[BaseModal Error] MODAL_NOT_FOUND:"),
      expect.objectContaining({ modalId: "test-modal" }), // error.context
      expect.any(Object), // errorInfo
    );
  });

  it("ErrorBoundary logs generic Error correctly", () => {
    // Given: ErrorBoundary with generic Error
    const error = new Error("Generic error");
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // When: Component throws generic Error
    render(
      <ErrorBoundary>
        <ThrowError error={error} />
      </ErrorBoundary>,
    );

    // Then: console.error should be called with generic format
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[BaseModal Error]",
      expect.any(Error),
      expect.any(Object), // errorInfo
    );
  });

  it("ErrorBoundary with BaseModalError without code", () => {
    // Given: BaseModalError with empty code (edge case)
    const error = new BaseModalError("Test error", "");

    // When: Component throws BaseModalError with empty code
    render(
      <ErrorBoundary>
        <ThrowError error={error} />
      </ErrorBoundary>,
    );

    // Then: Error UI should be displayed without code section
    expect(screen.getByText("Modal Error")).toBeInTheDocument();
    expect(screen.getByText("Test error")).toBeInTheDocument();
    expect(screen.queryByText(/Error Code:/)).not.toBeInTheDocument();
  });

  it("ErrorBoundary with Error without message", () => {
    // Given: Error without message
    const error = new Error("");

    // When: Component throws Error without message
    render(
      <ErrorBoundary>
        <ThrowError error={error} />
      </ErrorBoundary>,
    );

    // Then: Default message should be displayed
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("An unexpected error occurred")).toBeInTheDocument();
  });

  it("ErrorBoundary with null children", () => {
    // Given: ErrorBoundary with null children
    // When: Component is rendered
    const { container } = render(<ErrorBoundary>{null}</ErrorBoundary>);

    // Then: Should render without error
    expect(container.firstChild).toBeNull();
  });

  it("ErrorBoundary with undefined children", () => {
    // Given: ErrorBoundary with undefined children
    // When: Component is rendered
    const { container } = render(
      <ErrorBoundary>{undefined}</ErrorBoundary>,
    );

    // Then: Should render without error
    expect(container.firstChild).toBeNull();
  });

  it("ErrorBoundary fallback receives correct error and errorInfo", () => {
    // Given: ErrorBoundary with fallback that checks parameters
    const error = new Error("Test error");
    let receivedError: Error | undefined;
    let receivedErrorInfo: React.ErrorInfo | undefined;

    const fallback = (err: Error, errorInfo: React.ErrorInfo) => {
      receivedError = err;
      receivedErrorInfo = errorInfo;
      return <div>Fallback rendered</div>;
    };

    // When: Component throws error
    render(
      <ErrorBoundary fallback={fallback}>
        <ThrowError error={error} />
      </ErrorBoundary>,
    );

    // Then: Fallback should receive correct error and errorInfo
    expect(receivedError).toBe(error);
    expect(receivedErrorInfo).toBeDefined();
    expect(receivedErrorInfo?.componentStack).toBeDefined();
  });
});

