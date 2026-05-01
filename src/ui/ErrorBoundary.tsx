/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
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
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-black p-8 z-[9999]">
          <div className="max-w-md w-full bg-zinc-900 border border-red-500/20 rounded-[40px] p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center border border-red-500/30 mx-auto mb-6">
              <span className="text-2xl text-red-400 font-black">!</span>
            </div>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Critical System Error</h2>
            <p className="text-sm text-white/50 mb-8 leading-relaxed">
              Something went wrong. Don't worry, your progress is likely safe. Try refreshing the application to restore service.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-white text-black font-black py-4 rounded-3xl uppercase italic tracking-widest text-xs active:scale-95 transition-all shadow-xl"
            >
              Restart Application
            </button>
            <pre className="mt-6 p-4 bg-black/40 rounded-xl text-[10px] font-mono text-red-400/60 overflow-hidden text-left">
               {this.state.error?.message}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
