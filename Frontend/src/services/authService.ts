// src/services/authService.ts

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

  return await response.json();
};

export const logout = async () => {
  await fetch(`api/account/logout`, {
    method: 'POST',
    credentials: 'include',
  });
};
