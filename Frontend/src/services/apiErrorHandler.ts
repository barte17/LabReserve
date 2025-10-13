// Używam własnego toast systemu zamiast react-hot-toast
let showToastError: ((message: string) => void) | null = null;

// Funkcja do ustawienia toast handlera
export const setToastHandler = (handler: (message: string) => void) => {
  showToastError = handler;
};

const showToast = (message: string) => {
  if (showToastError) {
    showToastError(message);
  } else {
    // Fallback - pokaż alert jeśli toast nie jest dostępny
    console.error('Toast Error:', message);
    alert(message);
  }
};

export interface ApiError {
  message: string;
  status?: number;
  statusText?: string;
  url?: string;
  timestamp: string;
}

export class ApiErrorHandler {
  private static logError(error: ApiError) {
    console.error('API Error:', error);
    
    // Logowanie do localStorage dla debugowania
    try {
      const existingLogs = JSON.parse(localStorage.getItem('apiErrorLogs') || '[]');
      existingLogs.push(error);
      localStorage.setItem('apiErrorLogs', JSON.stringify(existingLogs.slice(-20)));
    } catch (e) {
      console.error('Failed to save API error log:', e);
    }
  }

  private static getErrorMessage(status: number, defaultMessage: string): string {
    switch (status) {
      case 400:
        return 'Nieprawidłowe dane w żądaniu';
      case 401:
        return 'Brak autoryzacji. Zaloguj się ponownie.';
      case 403:
        return 'Brak uprawnień do wykonania tej operacji';
      case 404:
        return 'Nie znaleziono zasobu';
      case 409:
        return 'Konflikt danych. Spróbuj ponownie.';
      case 422:
        return 'Dane nie przeszły walidacji';
      case 429:
        return 'Zbyt wiele żądań. Spróbuj za chwilę.';
      case 500:
        return 'Błąd serwera. Spróbuj ponownie.';
      case 502:
        return 'Serwer jest niedostępny';
      case 503:
        return 'Serwis tymczasowo niedostępny';
      case 504:
        return 'Przekroczono czas oczekiwania';
      default:
        return defaultMessage;
    }
  }

  private static shouldRetry(status: number): boolean {
    // Retry dla błędów serwera (5xx) ale nie dla błędów klienta (4xx)
    return status >= 500 && status < 600;
  }

  private static shouldShowToast(status: number): boolean {
    // Nie pokazuj toast dla 401
    return status !== 401;
  }

  public static async handleResponse(response: Response, customErrorMessage?: string): Promise<Response> {
    if (!response.ok) {
      const error: ApiError = {
        message: customErrorMessage || this.getErrorMessage(response.status, 'Wystąpił błąd podczas komunikacji z serwerem'),
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        timestamp: new Date().toISOString()
      };

      this.logError(error);

      // Pokazuj toast tylko dla odpowiednich błędów
      if (this.shouldShowToast(response.status)) {
        showToast(error.message);
      }

      // Rzuć błąd z dodatkową informacją
      const apiError = new Error(error.message) as Error & { status?: number; shouldRetry?: boolean };
      apiError.status = response.status;
      apiError.shouldRetry = this.shouldRetry(response.status);
      
      throw apiError;
    }

    return response;
  }

  public static async handleNetworkError(error: Error, url?: string): Promise<never> {
    const apiError: ApiError = {
      message: 'Brak połączenia z internetem lub serwer jest niedostępny',
      url,
      timestamp: new Date().toISOString()
    };

    this.logError(apiError);

    showToast(apiError.message);

    const networkError = new Error(apiError.message) as Error & { shouldRetry?: boolean };
    networkError.shouldRetry = true;
    
    throw networkError;
  }

  public static async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;
        const shouldRetry = (error as any)?.shouldRetry;

        if (!shouldRetry || attempt === maxRetries) {
          throw error;
        }

        // Exponential backoff
        const waitTime = delay * Math.pow(2, attempt - 1);
        console.log(`API request failed, retrying in ${waitTime}ms (attempt ${attempt}/${maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    throw lastError!;
  }
}

export async function apiRequest(
  url: string, 
  options: RequestInit = {},
  customErrorMessage?: string
): Promise<Response> {
  try {
    // Użyj authenticatedFetch z authService (używa in-memory tokens + refresh)
    const { authenticatedFetch } = await import('./authService');
    
    const response = await authenticatedFetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    return await ApiErrorHandler.handleResponse(response, customErrorMessage);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      // Network error
      await ApiErrorHandler.handleNetworkError(error, url);
    }
    throw error;
  }
}

export async function apiRequestWithRetry<T>(
  requestFn: () => Promise<Response>,
  maxRetries: number = 3
): Promise<T> {
  return ApiErrorHandler.retryRequest(async () => {
    const response = await requestFn();
    return response.json();
  }, maxRetries);
}