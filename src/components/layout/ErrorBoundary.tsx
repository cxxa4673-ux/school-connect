import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * Global React error boundary.
 *
 * Catches any runtime render error and shows a friendly recovery screen instead
 * of a blank white page. A "Reload" button resets the app; a "Reset demo data"
 * button clears localStorage so corrupted persisted state can't keep crashing it.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    // Note: React's TS types are not installed in this project, so the base
    // Component class is untyped (`any`). We cast `this` to a small shape so the
    // class still type-checks cleanly even without @types/react.
    (this as any).state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message || 'An unexpected error occurred.' };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    // In production you would forward this to an error-tracking service.
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      // Remove only the app's own keys, leaving unrelated localStorage intact.
      Object.keys(localStorage)
        .filter((k) => k.startsWith('sc_'))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    const state = (this as any).state as State;
    const children = (this as any).props.children as ReactNode;
    if (!state.hasError) return children;

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-12 h-12 mx-auto rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Something went wrong</h1>
            <p className="text-sm text-slate-400 mt-1">
              The app hit an unexpected error. Your data is safe — try reloading.
            </p>
            <p className="text-[11px] text-slate-500 mt-2 font-mono break-all">{state.message}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={this.handleReload}
              className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm"
            >
              Reload
            </button>
            <button
              onClick={this.handleReset}
              className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm"
            >
              Reset demo data
            </button>
          </div>
        </div>
      </div>
    );
  }
}
