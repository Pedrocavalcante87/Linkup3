import { Component } from 'react'

/**
 * Error Boundary para capturar erros de runtime e evitar crash da aplicação
 * Envolve toda a árvore de componentes no App.jsx
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔴 [ErrorBoundary] Erro capturado:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
    
    // TODO: Enviar para serviço de telemetria (Sentry, etc)
    if (window.telemetry?.trackEvent) {
      window.telemetry.trackEvent('ERROR_BOUNDARY_TRIGGERED', {
        error: error.toString(),
        componentStack: errorInfo.componentStack
      })
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    })
    // Recarregar snapshot para tentar recuperar estado consistente
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-text-primary)'
          }}
        >
          <div style={{
            maxWidth: '600px',
            padding: '2rem',
            backgroundColor: 'var(--color-card)',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)'
          }}>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--danger)' }}>
              ⚠️ Ops! Algo deu errado
            </h1>
            
            <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
              A aplicação encontrou um erro inesperado. Você pode tentar recarregar a página ou entrar em contato com o suporte.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ 
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: 'var(--color-border-light)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontFamily: 'monospace'
              }}>
                <summary style={{ cursor: 'pointer', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Detalhes do erro (dev mode)
                </summary>
                <pre style={{ overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleReset}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              🔄 Recarregar Aplicação
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
