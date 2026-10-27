import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center p-6 bg-[#F8F9FE] text-slate-800">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-500 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Something went wrong in this view
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                An unexpected interface error occurred. You can refresh the view or return to the dashboard.
              </p>
              {this.state.error?.message && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600 truncate text-left mt-2">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>

              <a
                href="/client/dashboard"
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
