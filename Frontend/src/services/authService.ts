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
  role: string[];
  exp: number;
}

let cachedUser: User | null = null;

export const getUserFromToken = (): User | null => {
  if (cachedUser) return cachedUser;

  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  try {
    const decoded: DecodedToken = jwtDecode(token);

    const roleClaim = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    const roleArray = Array.isArray(roleClaim)
      ? roleClaim
      : typeof roleClaim === "string"
      ? [roleClaim]
      : [];

    const user: User = {
      id: decoded.id,
      email: decoded.email,
      role: roleArray,
      exp: decoded.exp,
    };

    cachedUser = user;
    return user;
  } catch (error) {
    console.error("❌ Błąd dekodowania tokena:", error);
    return null;
  }
};

export const hasRole = (role: string): boolean => {
  const user = getUserFromToken();
  return user?.role.includes(role) ?? false;
};

export const login = async (email: string, password: string) => {
  const response = await fetch(`api/account/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', 
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Logowanie nie powiodło się');
  }

  cachedUser = null; // wyczyść cache po nowym loginie
  return await response.json();
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
  const response = await fetch(`api/refresh-token`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Odświeżenie tokena nie powiodło się');
  }

  cachedUser = null; // wyczyść cache przy odświeżeniu
  return await response.json();
};

export const logout = async () => {
  await fetch(`api/account/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  cachedUser = null;
};
