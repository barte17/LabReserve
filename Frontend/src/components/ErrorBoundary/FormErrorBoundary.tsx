import React, { Component, ErrorInfo, ReactNode } from 'react';

// Używamy własnego toast systemu
let showToastError: ((message: string) => void) | null = null;

export const setFormToastHandler = (handler: (message: string) => void) => {
  showToastError = handler;
};

const showToast = (message: string) => {
  if (showToastError) {
    showToastError(message);
  } else {
    console.error('Form Toast Error:', message);
  }
};

interface Props {
  children: ReactNode;
  onError?: () => void; // Callback do resetowania formularza
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId: number; // Unikalny ID błędu dla key reset
}

class FormErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorId: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('FormErrorBoundary caught an error:', error, errorInfo);
    
    // Logowanie błędu formularza
    const errorLog = {
      timestamp: new Date().toISOString(),
      type: 'form_error',
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    try {
      const existingLogs = JSON.parse(localStorage.getItem('formErrorLogs') || '[]');
      existingLogs.push(errorLog);
      // Zachowaj tylko ostatnie 10 błędów formularzy
      localStorage.setItem('formErrorLogs', JSON.stringify(existingLogs.slice(-10)));
    } catch (e) {
      console.error('Failed to save form error log:', e);
    }

    // Pokazanie toast notification
    const message = this.props.fallbackMessage || 'Wystąpił błąd w formularzu. Spróbuj ponownie.';
    showToast(message);

    // Wywołaj callback do resetowania formularza
    if (this.props.onError) {
      this.props.onError();
    }

    this.setState({ error });
  }

  handleRetry = () => {
    // Reset błędu i zwiększ errorId żeby wymusić re-render dzieci
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorId: this.state.errorId + 1 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 my-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-orange-800">
                Błąd formularza
              </h3>
              <div className="mt-2 text-sm text-orange-700">
                <p>
                  {this.props.fallbackMessage || 'Wystąpił problem z formularzem. Możesz spróbować ponownie lub odświeżyć stronę.'}
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-orange-600 hover:text-orange-800">
                    Szczegóły błędu (development)
                  </summary>
                  <div className="mt-2 p-2 bg-orange-100 rounded text-xs font-mono text-orange-800 overflow-auto max-h-32">
                    <div className="font-bold">Błąd:</div>
                    <div>{this.state.error.message}</div>
                  </div>
                </details>
              )}

              <div className="mt-4">
                <button
                  onClick={this.handleRetry}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                >
                  Spróbuj ponownie
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Użyj errorId jako key żeby wymusić re-render po błędzie
    return (
      <div key={this.state.errorId}>
        {this.props.children}
      </div>
    );
  }
}

export default FormErrorBoundary;