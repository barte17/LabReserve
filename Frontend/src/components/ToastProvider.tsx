import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
  title?: string;
  actionUrl?: string;
  actionLabel?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  showNotification: (title: string, message: string, actionUrl?: string, actionLabel?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Komponent Toast
const Toast = ({ message, type, title, actionUrl, actionLabel, onClose, duration = 3000 }: {
  message: string;
  type: ToastType;
  title?: string;
  actionUrl?: string;
  actionLabel?: string;
  onClose: () => void;
  duration?: number;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-white border-l-4 border-emerald-500 text-gray-800 shadow-lg';
      case 'error':
        return 'bg-white border-l-4 border-red-500 text-gray-800 shadow-lg';
      case 'warning':
        return 'bg-white border-l-4 border-amber-500 text-gray-800 shadow-lg';
      case 'info':
        return 'bg-white border-l-4 border-blue-500 text-gray-800 shadow-lg';
      default:
        return 'bg-white border-l-4 border-gray-400 text-gray-800 shadow-lg';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
        );
      case 'info':
        return (
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        );
    }
  };

  const handleActionClick = () => {
    if (actionUrl) {
      window.location.href = actionUrl;
    }
    onClose();
  };

  return (
    <div className={`
      animate-in slide-in-from-right-full duration-300 ease-out
      p-4 rounded-lg min-w-80 max-w-md backdrop-blur-sm
      border-2 border-gray-300 ring-2 ring-gray-100/60 shadow-xl
      ${getToastStyles()}
    `}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          {title && (
            <div className="font-semibold text-sm text-gray-900 mb-1 leading-tight">
              {title}
            </div>
          )}
          <div className={`${title ? 'text-sm text-gray-600' : 'text-sm text-gray-800'} break-words leading-relaxed`}>
            {message}
          </div>
          
          {actionUrl && actionLabel && (
            <button
              onClick={handleActionClick}
              className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-150 hover:underline"
            >
              {actionLabel}
            </button>
          )}
        </div>
        
        <button 
          onClick={onClose}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-150 rounded-full hover:bg-gray-100"
          aria-label="Zamknij powiadomienie"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

// Provider
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [idCounter, setIdCounter] = useState(0);

  const generateUniqueId = useCallback(() => {
    const newId = Date.now() + idCounter;
    setIdCounter(prev => prev + 1);
    return newId;
  }, [idCounter]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = generateUniqueId();
    setToasts(prev => [...prev, { id, message, type }]);
  }, [generateUniqueId]);

  const showNotification = useCallback((title: string, message: string, actionUrl?: string, actionLabel?: string) => {
    const id = generateUniqueId();
    setToasts(prev => [...prev, { 
      id, 
      message, 
      type: 'info', 
      title, 
      actionUrl, 
      actionLabel,
      duration: 5000 // Dłuższy czas dla powiadomień z akcjami
    }]);
  }, [generateUniqueId]);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const showError = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const showWarning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);
  const showInfo = useCallback((message: string) => showToast(message, 'info'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo, showNotification }}>
      {children}
      <div className="fixed top-4 right-4 z-[70] space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className="pointer-events-auto transform transition-all duration-300 ease-out"
            style={{ 
              transform: `translateY(${index * 4}px)`,
              zIndex: 70 - index 
            }}
          >
            <Toast
              message={toast.message}
              type={toast.type}
              title={toast.title}
              actionUrl={toast.actionUrl}
              actionLabel={toast.actionLabel}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Hook
export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};