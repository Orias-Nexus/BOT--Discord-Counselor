import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface p-6">
          <div className="max-w-md w-full glass-card p-8 rounded-2xl border border-error/30">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-error text-3xl">error</span>
              <h1 className="text-xl font-bold text-white">Something went wrong</h1>
            </div>
            <p className="text-slate-400 text-sm mb-6 break-words">
              {this.state.error?.message || 'Unknown error'}
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full px-4 py-2 bg-primary text-on-primary rounded-lg font-medium hover:opacity-90 transition"
            >
              Reload app
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
