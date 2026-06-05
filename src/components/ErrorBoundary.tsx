import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error("ErrorBoundary caught", error, info);
  }

  override render() {
    if (this.state.error) {
      return (
        <main className="loading-screen" style={{ flexDirection: "column", gap: 8 }}>
          <div>⚠ Une erreur est survenue.</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>
            {this.state.error.message}
          </div>
          <button
            className="login-btn"
            style={{ marginTop: 12 }}
            onClick={() => location.reload()}
          >
            Recharger
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}
