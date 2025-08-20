// src/services/authService.ts
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  id: string; 
  email?: string;
  exp: number;
  [key: string]: unknown; // Dodatkowe pola mogą być obecne w tokenie
}

interface User {
  id: string;
  email?: string;
  roles: string[];
  exp: number;
}

let cachedUser: User | null = null;
let accessToken: string | null = null; // In-memory storage - OWASP compliant

export const getUserFromToken = (): User | null => {
  if (cachedUser) return cachedUser;

  if (!accessToken) return null;

  try {
    const decoded: DecodedToken = jwtDecode(accessToken);

    const roleClaim = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    const roleArray = Array.isArray(roleClaim)
      ? roleClaim
      : typeof roleClaim === "string"
      ? [roleClaim]
      : [];

    const user: User = {
      id: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || decoded.id,
      email: decoded.email,
      roles: roleArray,
      exp: decoded.exp,
    };

    cachedUser = user;
    return user;
  } catch (error) {
    console.error("❌ Błąd dekodowania tokena:", error);
    return null;
  }
};

export const hasRole = (roles: string): boolean => {
  const user = getUserFromToken();
  return user?.roles.includes(roles) ?? false;
};

export const login = async (email: string, password: string) => {
  const response = await fetch(`api/account/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Ważne: pozwala backendowi ustawić httpOnly cookie
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Logowanie nie powiodło się');
  }

  const data = await response.json();
  
  // Zapisz access token w pamięci - OWASP compliant
  accessToken = data.accessToken;
  cachedUser = null; // wyczyść cache po nowym loginie
  
  return {
    token: data.accessToken,
    expiration: data.expiration
  };
};

export const register = async (
  email: string,
  password: string,
  imie: string,
  nazwisko: string
) => {
  const response = await fetch(`api/account/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, imie, nazwisko }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Rejestracja nie powiodła się');
  }

  return await response.json();
};

export const refreshToken = async () => {
  console.log("=== refreshToken called ===");
  console.log("Current accessToken:", accessToken);
  
  const response = await fetch(`api/account/refresh-token`, {
    method: 'POST',
    credentials: 'include', // Ważne: wysyła cookies z refresh tokenem
  });

  if (!response.ok) {
    // Jeśli refresh token jest nieprawidłowy, wyloguj użytkownika
    accessToken = null;
    cachedUser = null;
    throw new Error('Odświeżenie tokena nie powiodło się');
  }

  const data = await response.json();
  
  // Zapisz nowy access token w pamięci - OWASP compliant
  accessToken = data.accessToken;
  
  cachedUser = null; // wyczyść cache przy odświeżeniu
  return data;
};

export const logout = async () => {
  await fetch(`api/account/logout`, {
    method: 'POST',
    credentials: 'include', // Ważne: wysyła cookies żeby backend mógł usunąć refresh token
  });
  // Wyczyść access token z pamięci - OWASP compliant
  accessToken = null;
  cachedUser = null;
};

// Sprawdź czy token wygasł
export const isTokenExpired = (): boolean => {
  const user = getUserFromToken();
  if (!user) return true;
  
  const currentTime = Date.now() / 1000;
  return user.exp < currentTime;
};

// Automatyczne odświeżanie tokenu
export const ensureValidToken = async (): Promise<string | null> => {
  if (!accessToken) return null;
  
  if (isTokenExpired()) {
    try {
      await refreshToken();
      return accessToken;
    } catch (error) {
      console.error("Nie udało się odświeżyć tokenu:", error);
      return null;
    }
  }
  
  return accessToken;
};

// Wrapper dla fetch z automatycznym odświeżaniem tokenu
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = await ensureValidToken();
  
  if (!token) {
    throw new Error("Brak ważnego tokenu autoryzacji");
  }
  
  const headers = {
    ...options.headers,
    "Authorization": `Bearer ${token}`
  };
  
  const response = await fetch(url, { 
    ...options, 
    headers,
    credentials: 'include' // Ważne: wysyła cookies z refresh tokenem
  });
  
  // Jeśli dostajemy 401, spróbuj odświeżyć token i powtórz request
  if (response.status === 401) {
    try {
      await refreshToken();
      
      if (accessToken) {
        const newHeaders = {
          ...options.headers,
          "Authorization": `Bearer ${accessToken}`
        };
        return await fetch(url, { 
          ...options, 
          headers: newHeaders,
          credentials: 'include'
        });
      }
    } catch (error) {
      console.error("Nie udało się odświeżyć tokenu po 401:", error);
    }
  }
  
  return response;
};
