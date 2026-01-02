// src/components/ErrorBoundary.jsx
// Composant pour capturer les erreurs React et afficher un fallback

import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Met à jour l'état pour afficher l'UI de fallback
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Vous pouvez logger l'erreur vers un service de reporting
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Optionnel: envoyer l'erreur à un service de monitoring
    // logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // UI de fallback personnalisée
      return (
        <div style={styles.container}>
          <div style={styles.content}>
            <div style={styles.icon}>⚠️</div>
            <h1 style={styles.title}>Oups ! Une erreur est survenue</h1>
            <p style={styles.message}>
              Nous sommes désolés, quelque chose s'est mal passé. 
              Veuillez réessayer ou retourner à l'accueil.
            </p>
            
            {/* Afficher les détails en mode développement */}
            {import.meta.env.DEV && this.state.error && (
              <details style={styles.details}>
                <summary style={styles.summary}>Détails de l'erreur (dev)</summary>
                <pre style={styles.errorText}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <div style={styles.buttons}>
              <button onClick={this.handleReload} style={styles.buttonPrimary}>
                🔄 Recharger la page
              </button>
              <button onClick={this.handleGoHome} style={styles.buttonSecondary}>
                🏠 Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Styles inline pour éviter les dépendances CSS
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    padding: '2rem',
  },
  content: {
    maxWidth: '500px',
    textAlign: 'center',
    backgroundColor: '#fff',
    padding: '3rem 2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  },
  icon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '1rem',
  },
  message: {
    fontSize: '1rem',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '2rem',
  },
  details: {
    marginBottom: '2rem',
    textAlign: 'left',
  },
  summary: {
    cursor: 'pointer',
    color: '#666',
    fontSize: '0.875rem',
    marginBottom: '0.5rem',
  },
  errorText: {
    backgroundColor: '#f8f9fa',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '0.75rem',
    overflow: 'auto',
    maxHeight: '200px',
    color: '#dc3545',
  },
  buttons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  buttonPrimary: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#ff6b35',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonSecondary: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#666',
    backgroundColor: '#e9ecef',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};

export default ErrorBoundary;