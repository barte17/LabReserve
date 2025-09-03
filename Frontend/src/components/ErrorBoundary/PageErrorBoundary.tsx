import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';

// Używamy własnego toast systemu
let showToastError: ((message: string) => void) | null = null;

export const setPageToastHandler = (handler: (message: string) => void) => {
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
  fallbackPath?: string;
  fallbackText?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class PageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PageErrorBoundary caught an error:', error, errorInfo);
    
    // Logowanie błędu strony
    const errorLog = {
      timestamp: new Date().toISOString(),
      type: 'page_error',
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      page: window.location.pathname,
      userAgent: navigator.userAgent
    };
    
    try {
      const existingLogs = JSON.parse(localStorage.getItem('pageErrorLogs') || '[]');
      existingLogs.push(errorLog);
      localStorage.setItem('pageErrorLogs', JSON.stringify(existingLogs.slice(-10)));
    } catch (e) {
      console.error('Failed to save page error log:', e);
    }

    // Pokazanie toast notification
    showToast('Wystąpił błąd na tej stronie');

    this.setState({ error });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const { fallbackPath = '/', fallbackText = 'Strona główna' } = this.props;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center border border-orange-200">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Błąd na stronie
            </h2>
            
            <p className="text-gray-600 mb-6">
              Ta część aplikacji napotkała problem. Możesz spróbować ponownie lub przejść do innej strony.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Szczegóły błędu
                </summary>
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto max-h-24">
                  {this.state.error.message}
                </div>
              </details>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Spróbuj ponownie
              </button>
              <Link
                to={fallbackPath}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-center"
              >
                {fallbackText}
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PageErrorBoundary;