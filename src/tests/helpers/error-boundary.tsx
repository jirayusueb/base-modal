import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  info?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ hasError: true, error, info });
  }

  renderDefaultError() {
    return <div>Something went wrong.</div>;
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="common-error-boundary">{this.renderDefaultError()}</div>
      );
    }
    return this.props.children;
  }
}
