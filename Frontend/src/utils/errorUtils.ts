// Utility functions for error handling and debugging

export interface ErrorLog {
  timestamp: string;
  type: 'global' | 'page' | 'api';
  error: {
    message: string;
    stack?: string;
    name: string;
  };
  context?: {
    url?: string;
    userAgent?: string;
    userId?: string;
    page?: string;
    status?: number;
  };
}

export const getErrorLogs = (type?: 'global' | 'page' | 'api' | 'form' | 'auth'): ErrorLog[] => {
  try {
    const globalLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
    const pageLogs = JSON.parse(localStorage.getItem('pageErrorLogs') || '[]');
    const apiLogs = JSON.parse(localStorage.getItem('apiErrorLogs') || '[]');
    const formLogs = JSON.parse(localStorage.getItem('formErrorLogs') || '[]');
    const authLogs = JSON.parse(localStorage.getItem('authErrorLogs') || '[]');

    const allLogs = [
      ...globalLogs.map((log: any) => ({ ...log, type: 'global' })),
      ...pageLogs.map((log: any) => ({ ...log, type: 'page' })),
      ...apiLogs.map((log: any) => ({ ...log, type: 'api' })),
      ...formLogs.map((log: any) => ({ ...log, type: 'form' })),
      ...authLogs.map((log: any) => ({ ...log, type: 'auth' }))
    ];

    if (type) {
      return allLogs.filter(log => log.type === type);
    }

    return allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (e) {
    console.error('Failed to get error logs:', e);
    return [];
  }
};

export const clearErrorLogs = (type?: 'global' | 'page' | 'api' | 'form' | 'auth'): void => {
  try {
    if (type) {
      const keyMap = {
        'global': 'errorLogs',
        'page': 'pageErrorLogs',
        'api': 'apiErrorLogs',
        'form': 'formErrorLogs',
        'auth': 'authErrorLogs'
      };
      localStorage.removeItem(keyMap[type]);
    } else {
      localStorage.removeItem('errorLogs');
      localStorage.removeItem('pageErrorLogs');
      localStorage.removeItem('apiErrorLogs');
      localStorage.removeItem('formErrorLogs');
      localStorage.removeItem('authErrorLogs');
    }
  } catch (e) {
    console.error('Failed to clear error logs:', e);
  }
};

export const exportErrorLogs = (): string => {
  const logs = getErrorLogs();
  return JSON.stringify(logs, null, 2);
};

// Development helper removed for security - no console access to error logs