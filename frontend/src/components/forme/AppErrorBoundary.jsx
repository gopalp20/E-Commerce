import { Component } from "react";

export class AppErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="app-recovery" role="alert">
        <p className="eyebrow">FORME</p>
        <h1>Let’s get you back to the store.</h1>
        <p>
          This page couldn’t open. Reload to try again. Your saved bag and
          orders are kept in your account.
        </p>
        <div>
          <button
            className="store-button"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
          <a className="arrow-link" href="/">
            Back to the store
          </a>
        </div>
      </main>
    );
  }
}
