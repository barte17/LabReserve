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
  isLoading: boolean;
  hasRole: (role: string) => boolean;
  refreshAuth: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLogged, setIsLogged] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshAuth = async () => {
    console.log("=== AuthContext refreshAuth called ===");
    
    // Zabezpieczenie przed podwójnym wywołaniem
    if (isRefreshing) {
      console.log("Already refreshing, skipping...");
      return;
    }
    
    setIsLoading(true);
    const currentUser = getUserFromToken();
    console.log("Current user from token:", currentUser);
    
    // Jeśli nie ma tokenu w pamięci, spróbuj odświeżyć (httpOnly cookie nie jest widoczne w JS)
    if (!currentUser) {
      console.log("No user in memory, trying to refresh token...");
      setIsRefreshing(true);
      try {
        console.log("Attempting refresh token request...");
        const { refreshToken } = await import('../services/authService');
        await refreshToken();
        console.log("refreshToken() completed successfully");
        const newUser = getUserFromToken();
        console.log("User after refresh:", newUser);
        setUser(newUser);
        setIsLogged(!!newUser);
        setIsRefreshing(false);
        console.log("AuthContext state updated after refresh");
        setIsLoading(false);
        return;
      } catch (error) {
        console.log("Failed to refresh token:", error);
        // To jest OK - oznacza że nie ma ważnego refresh token
      } finally {
        setIsRefreshing(false);
        setIsLoading(false);
      }
    }
    
    setUser(currentUser);
    setIsLogged(!!currentUser);
    setIsLoading(false);
    console.log("Auth state updated, isLogged:", !!currentUser);
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
    console.log("=== AuthContext useEffect mounting ===");
    console.log("Document cookies at mount:", document.cookie);
    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLogged, isLoading, hasRole, refreshAuth, logout }}>
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