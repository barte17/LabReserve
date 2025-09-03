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

export const getErrorLogs = (type?: 'global' | 'page' | 'api'): ErrorLog[] => {
  try {
    const globalLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
    const pageLogs = JSON.parse(localStorage.getItem('pageErrorLogs') || '[]');
    const apiLogs = JSON.parse(localStorage.getItem('apiErrorLogs') || '[]');
    
    const allLogs = [
      ...globalLogs.map((log: any) => ({ ...log, type: 'global' })),
      ...pageLogs.map((log: any) => ({ ...log, type: 'page' })),
      ...apiLogs.map((log: any) => ({ ...log, type: 'api' }))
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

export const clearErrorLogs = (type?: 'global' | 'page' | 'api'): void => {
  try {
    if (type) {
      const key = type === 'global' ? 'errorLogs' : 
                  type === 'page' ? 'pageErrorLogs' : 'apiErrorLogs';
      localStorage.removeItem(key);
    } else {
      localStorage.removeItem('errorLogs');
      localStorage.removeItem('pageErrorLogs');
      localStorage.removeItem('apiErrorLogs');
    }
  } catch (e) {
    console.error('Failed to clear error logs:', e);
  }
};

export const exportErrorLogs = (): string => {
  const logs = getErrorLogs();
  return JSON.stringify(logs, null, 2);
};

// Development helper - wywołaj w konsoli przeglądarki
if (typeof window !== 'undefined') {
  (window as any).errorUtils = {
    getLogs: getErrorLogs,
    clearLogs: clearErrorLogs,
    exportLogs: exportErrorLogs,
    // Dodatkowe funkcje pomocnicze
    showAllLogs: () => {
      const logs = getErrorLogs();
      console.table(logs);
      return logs;
    },
    testApiError: async () => {
      try {
        const response = await fetch('/api/test-nonexistent-endpoint');
        console.log('Response:', response);
      } catch (error) {
        console.log('Caught error:', error);
      }
    }
  };
  
  // Automatyczne dodanie do window przy załadowaniu
  console.log('🛠️ Error Utils dostępne w konsoli:');
  console.log('- errorUtils.getLogs() - pokaż wszystkie błędy');
  console.log('- errorUtils.getLogs("api") - pokaż błędy API');
  console.log('- errorUtils.showAllLogs() - pokaż w tabeli');
  console.log('- errorUtils.clearLogs() - wyczyść błędy');
  console.log('- errorUtils.testApiError() - test API error');
}