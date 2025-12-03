import React from "react";
import { BaseModalError } from "@/utils/errors";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error, errorInfo: React.ErrorInfo) => React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * Error boundary component for catching and handling errors in the Base Modal component tree.
 * Provides user-friendly error messages and optional custom error rendering.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for debugging
    if (error instanceof BaseModalError) {
      console.error(
        `[BaseModal Error] ${error.code}: ${error.message}`,
        error.context,
        errorInfo,
      );
    } else {
      console.error("[BaseModal Error]", error, errorInfo);
    }
  }

  renderDefaultError() {
    const { error } = this.state;
    if (error instanceof BaseModalError) {
      return (
        <div className="base-modal-error-boundary">
          <div className="base-modal-error-title">Modal Error</div>
          <div className="base-modal-error-message">{error.message}</div>
          {error.code && (
            <div className="base-modal-error-code">
              Error Code: {error.code}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="base-modal-error-boundary">
        <div className="base-modal-error-title">Something went wrong</div>
        <div className="base-modal-error-message">
          {error?.message || "An unexpected error occurred"}
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo!);
      }
      return this.renderDefaultError();
    }

    return this.props.children;
  }
}
