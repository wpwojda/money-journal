import { Component } from "react";
import { STORAGE_KEY, downloadJSON } from "../lib/storage.js";
import { todayISO } from "../lib/dateUtils.js";

/**
 * Catches render/lifecycle errors anywhere below it so a single bad component can never
 * leave the user staring at a blank page.
 *
 * Because all financial data lives only in this browser, the fallback deliberately offers
 * a raw export: even if the app itself is broken, the user must still be able to get
 * their data out. The export reads straight from localStorage rather than from React
 * state, so it works even when the component tree failed to render.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, exported: false };
  }

  static getDerivedStateFromError(error) {
    return { error, exported: false };
  }

  componentDidCatch(error, info) {
    // No telemetry by design - this project sends nothing anywhere. Logging to the local
    // console is the only reporting channel, and it stays on the user's machine.
    console.error("Money Journal crashed:", error, info?.componentStack);
  }

  handleExport = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      downloadJSON(parsed, `money-journal-recovery-${todayISO()}.json`);
      this.setState({ exported: true });
    } catch {
      // If even the raw read fails there is nothing recoverable to hand back.
      this.setState({ exported: false });
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="card p-6 md:p-8 max-w-lg w-full" role="alert">
          <h1 className="text-xl font-semibold text-primary-c mb-2">Something went wrong</h1>
          <p className="text-sm text-secondary-c leading-relaxed mb-4">
            Money Journal hit an unexpected error and stopped rendering. Your saved data is still on
            this device and has not been changed. Download a copy before reloading if you want to be
            certain it is safe.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <button onClick={this.handleExport} className="btn-ghost flex-1 py-2.5 text-sm">
              {this.state.exported ? "Downloaded ✓" : "Download my data"}
            </button>
            <button onClick={this.handleReload} className="btn-primary flex-1 py-2.5 text-sm">
              Reload the app
            </button>
          </div>

          <details className="text-xs text-muted-c">
            <summary className="cursor-pointer hover:text-secondary-c">Technical details</summary>
            <pre className="mt-2 whitespace-pre-wrap break-words surface-muted rounded-lg p-3">
              {String(this.state.error?.stack || this.state.error)}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}
