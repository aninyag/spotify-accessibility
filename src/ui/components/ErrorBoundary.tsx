import * as React from "react";

export class ErrorBoundary extends React.Component<
  { fallback: (err: unknown) => React.ReactNode; children: React.ReactNode },
  { hasError: boolean; err: unknown }
> {
  state: { hasError: boolean; err: unknown } = { hasError: false, err: null };

  static getDerivedStateFromError(err: unknown) {
    return { hasError: true, err };
  }

  componentDidCatch(err: unknown) {
    // Keep this non-fatal in production; still surfaces in console for debugging.
    // eslint-disable-next-line no-console
    console.error("UI crashed:", err);
  }

  render() {
    if (this.state.hasError) return this.props.fallback(this.state.err);
    return this.props.children;
  }
}

