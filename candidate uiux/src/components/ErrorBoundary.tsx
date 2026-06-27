import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-chalk p-6 font-sans">
          <div className="w-full max-w-md rounded-2xl border border-chalk-200 bg-white p-8 text-center shadow-soft">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h1 className="mb-2 font-serif text-[24px] font-bold text-navy">
              Something went wrong
            </h1>
            <p className="mb-8 text-[15px] text-navy/60">
              We've encountered an unexpected error. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-xl bg-navy px-5 py-3 text-[14px] font-bold text-white shadow-soft transition-colors hover:bg-navy/90"
            >
              Refresh Page
            </button>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 text-left">
                <p className="font-mono text-[11px] text-red-500 overflow-x-auto whitespace-pre-wrap bg-red-50 p-4 rounded-lg">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
