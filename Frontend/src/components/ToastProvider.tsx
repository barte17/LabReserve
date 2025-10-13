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
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-black';
      case 'info':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  const handleActionClick = () => {
    if (actionUrl) {
      window.location.href = actionUrl;
    }
    onClose();
  };

  return (
    <div className={`fixed top-4 right-4 z-[70] p-4 rounded-lg shadow-lg min-w-80 max-w-md ${getToastStyles()}`}>
      <div className="flex items-start space-x-3">
        <span className="text-lg mt-0.5">{getIcon()}</span>
        
        <div className="flex-1 min-w-0">
          {title && (
            <div className="font-semibold text-sm mb-1">{title}</div>
          )}
          <div className={`${title ? 'text-sm' : ''} break-words`}>{message}</div>
          
          {actionUrl && actionLabel && (
            <button
              onClick={handleActionClick}
              className="mt-2 text-sm underline hover:no-underline opacity-90 hover:opacity-100"
            >
              {actionLabel}
            </button>
          )}
        </div>
        
        <button 
          onClick={onClose}
          className="text-lg hover:opacity-70 ml-2"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Provider
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const showNotification = useCallback((title: string, message: string, actionUrl?: string, actionLabel?: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { 
      id, 
      message, 
      type: 'info', 
      title, 
      actionUrl, 
      actionLabel,
      duration: 5000 // Dłuższy czas dla powiadomień z akcjami
    }]);
  }, []);

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
      <div className="fixed top-4 right-4 z-[70] space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            title={toast.title}
            actionUrl={toast.actionUrl}
            actionLabel={toast.actionLabel}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
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