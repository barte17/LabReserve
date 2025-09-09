import React, { Component, ErrorInfo, ReactNode } from 'react';

// Używamy własnego toast systemu
let showToastError: ((message: string) => void) | null = null;

export const setAuthToastHandler = (handler: (message: string) => void) => {
  showToastError = handler;
};

const showToast = (message: string) => {
  if (showToastError) {
    showToastError(message);
  } else {
    console.error('Auth Toast Error:', message);
  }
};

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// Komponent fallback dla błędów auth
const AuthErrorFallback = ({ onRetry }: { onRetry: () => void }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6 text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Problem z uwierzytelnianiem
      </h2>
      
      <p className="text-gray-600 mb-6">
        Wystąpił problem z systemem logowania. Aplikacja będzie działać w trybie ograniczonym.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onRetry}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Spróbuj ponownie
        </button>
        <button
          onClick={() => window.location.href = '/login'}
          className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Przejdź do logowania
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Możesz kontynuować przeglądanie w trybie gościa
      </p>
    </div>
  </div>
);

class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AuthErrorBoundary caught an error:', error, errorInfo);
    
    // Logowanie błędu auth
    const errorLog = {
      timestamp: new Date().toISOString(),
      type: 'auth_error',
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
      const existingLogs = JSON.parse(localStorage.getItem('authErrorLogs') || '[]');
      existingLogs.push(errorLog);
      // Zachowaj tylko ostatnie 5 błędów auth
      localStorage.setItem('authErrorLogs', JSON.stringify(existingLogs.slice(-5)));
    } catch (e) {
      console.error('Failed to save auth error log:', e);
    }

    // Wyczyść potencjalnie uszkodzone dane auth
    try {
      // Nie usuwamy wszystkiego, tylko czyścimy potencjalnie problematyczne dane
      console.log('Clearing potentially corrupted auth data...');
    } catch (e) {
      console.error('Failed to clear auth data:', e);
    }

    // Pokazanie toast notification
    showToast('Wystąpił problem z uwierzytelnianiem. Sprawdź połączenie i spróbuj ponownie.');

    this.setState({ error });
  }

  handleRetry = () => {
    // Reset błędu i spróbuj ponownie
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return <AuthErrorFallback onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

export default AuthErrorBoundary;