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
        <div className="min-h-screen flex items-center justify-center bg-background text-on-surface p-6">
          <div className="max-w-md w-full bg-surface-container-lowest p-8 rounded-3xl ambient-shadow border border-error/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-error-container rounded-xl">
                <span className="material-symbols-outlined text-error">error</span>
              </div>
              <h1 className="text-xl font-bold text-on-surface">Something went wrong</h1>
            </div>
            <p className="text-on-surface-variant text-sm mb-6 break-words">
              {this.state.error?.message || 'Unknown error'}
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full px-4 py-3 bg-primary text-on-primary rounded-xl font-medium hover:opacity-90 transition-opacity"
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
