import * as React from "react";

export class ErrorBoundary extends React.Component<
  { fallback: (err: unknown, componentStack: string) => React.ReactNode; children: React.ReactNode },
  { hasError: boolean; err: unknown; componentStack: string }
> {
  state: { hasError: boolean; err: unknown; componentStack: string } = {
    hasError: false,
    err: null,
    componentStack: "",
  };

  static getDerivedStateFromError(err: unknown) {
    return { hasError: true, err };
  }

  componentDidCatch(err: unknown, info: { componentStack: string }) {
    // Keep this non-fatal in production; still surfaces in console for debugging.
    // eslint-disable-next-line no-console
    console.error("UI crashed:", err);
    this.setState({ componentStack: info.componentStack ?? "" });
  }

  render() {
    if (this.state.hasError) return this.props.fallback(this.state.err, this.state.componentStack);
    return this.props.children;
  }
}

