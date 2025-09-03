import React, { Component, ErrorInfo, ReactNode } from 'react';

// Używamy własnego toast systemu
let showToastError: ((message: string) => void) | null = null;

// Funkcja do ustawienia toast handlera
export const setGlobalToastHandler = (handler: (message: string) => void) => {
  showToastError = handler;
};

const showToast = (message: string) => {
  if (showToastError) {
    showToastError(message);
  } else {
    console.error('Toast Error:', message);
  }
};

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Aktualizuj state, aby następny render pokazał fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Logowanie błędu
    console.error('GlobalErrorBoundary caught an error:', error, errorInfo);
    
    // Logowanie do localStorage dla debugowania
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    try {
      const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      existingLogs.push(errorLog);
      // Zachowaj tylko ostatnie 10 błędów
      localStorage.setItem('errorLogs', JSON.stringify(existingLogs.slice(-10)));
    } catch (e) {
      console.error('Failed to save error log to localStorage:', e);
    }

    // Pokazanie toast notification
    showToast('Wystąpił nieoczekiwany błąd. Strona zostanie odświeżona.');

    // Aktualizacja state z pełnymi informacjami o błędzie
    this.setState({ error, errorInfo });
  }

  handleRefresh = () => {
    // Wyczyść błąd i odśwież stronę
    window.location.reload();
  };

  handleGoHome = () => {
    // Wyczyść błąd i idź do strony głównej
    this.setState({ hasError: false });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Ups! Coś poszło nie tak
            </h1>
            
            <p className="text-gray-600 mb-6">
              Wystąpił nieoczekiwany błąd w aplikacji. Przepraszamy za niedogodności.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Szczegóły błędu (tylko w trybie deweloperskim)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto max-h-32">
                  <div className="font-bold">Błąd:</div>
                  <div className="mb-2">{this.state.error.message}</div>
                  {this.state.error.stack && (
                    <>
                      <div className="font-bold">Stack trace:</div>
                      <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRefresh}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Odśwież stronę
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Strona główna
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Jeśli problem się powtarza, skontaktuj się z administratorem.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;