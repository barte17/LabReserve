import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserFromToken } from '../services/authService';

interface User {
  id: string;
  email?: string;
  roles: string[];
  exp: number;
}

interface AuthContextType {
  user: User | null;
  isLogged: boolean;
  hasRole: (role: string) => boolean;
  refreshAuth: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLogged, setIsLogged] = useState(false);

  const refreshAuth = async () => {
    console.log("=== AuthContext refreshAuth called ===");
    const currentUser = getUserFromToken();
    console.log("Current user from token:", currentUser);
    
    // Jeśli nie ma tokenu w pamięci, spróbuj odświeżyć używając refresh token
    if (!currentUser) {
      console.log("No user found, trying to refresh token...");
      try {
        const { refreshToken } = await import('../services/authService');
        console.log("Calling refreshToken...");
        await refreshToken();
        const newUser = getUserFromToken();
        console.log("New user after refresh:", newUser);
        setUser(newUser);
        setIsLogged(!!newUser);
        return;
      } catch (error) {
        console.log("Nie udało się odświeżyć tokenu:", error);
        setUser(null);
        setIsLogged(false);
        return;
      }
    }
    
    console.log("User found in token, setting state");
    setUser(currentUser);
    setIsLogged(!!currentUser);
  };

  const hasRole = (role: string): boolean => {
    return user?.roles.includes(role) ?? false;
  };

  const logout = async () => {
    try {
      const { logout: authLogout } = await import('../services/authService');
      await authLogout();
    } catch (error) {
      console.error("Błąd podczas wylogowywania:", error);
    }
    setUser(null);
    setIsLogged(false);
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLogged, hasRole, refreshAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};