import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-10 font-sans">
          <div className="max-w-md w-full bg-zinc-900 border border-red-500/20 rounded-[3rem] p-12 text-center space-y-8 shadow-2xl shadow-red-500/5">
            <div className="inline-flex p-6 bg-red-600/10 rounded-full border border-red-500/20 mb-4">
              <AlertTriangle className="text-red-500 w-12 h-12" />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Something went wrong</h2>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                The swarm encountered an unexpected UI crash. Your data is safe, but this view needs to be restarted.
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-left">
               <code className="text-[10px] text-zinc-600 font-mono break-all line-clamp-3">
                 {this.state.error?.message || "Unknown error"}
               </code>
            </div>

            <button 
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-3 bg-white text-black hover:bg-zinc-200 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl"
            >
              <RefreshCw size={18} />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
