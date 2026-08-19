import { Component } from 'react';
import { RefreshCw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught error', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="app">
          <main className="main">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                gap: '16px',
                textAlign: 'center',
                padding: '24px',
              }}
            >
              <h2 style={{ fontSize: '24px' }}>Une erreur est survenue</h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>
                Une erreur inattendue s’est produite. Veuillez recharger la page pour réessayer.
              </p>
              <button className="btn btn-primary" onClick={this.handleReset}>
                <RefreshCw size={18} />
                Recharger
              </button>
            </div>
          </main>
        </div>
      );
    }

    return this.props.children;
  }
}
