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
  hasBusinessRole: () => boolean;
  canReserveStanowiska: () => boolean;
  canReserveSale: () => boolean;
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
    
    try {
      setIsLoading(true);
      
      // Bezpieczne pobieranie użytkownika z tokenu
      let currentUser = null;
      try {
        currentUser = getUserFromToken();
        console.log("Current user from token:", currentUser);
      } catch (error) {
        console.error("Error getting user from token:", error);
        // Wyczyść potencjalnie uszkodzone dane
        setUser(null);
        setIsLogged(false);
        setIsLoading(false);
        return;
      }
      
      // Jeśli nie ma tokenu w pamięci, spróbuj odświeżyć (httpOnly cookie nie jest widoczne w JS)
      if (!currentUser) {
        console.log("No user in memory, trying to refresh token...");
        setIsRefreshing(true);
        try {
          console.log("Attempting refresh token request...");
          const { refreshToken } = await import('../services/authService');
          await refreshToken();
          console.log("refreshToken() completed successfully");
          
          // Bezpieczne pobieranie nowego użytkownika
          try {
            const newUser = getUserFromToken();
            console.log("User after refresh:", newUser);
            setUser(newUser);
            setIsLogged(!!newUser);
          } catch (error) {
            console.error("Error getting user after refresh:", error);
            setUser(null);
            setIsLogged(false);
          }
          
          setIsRefreshing(false);
          console.log("AuthContext state updated after refresh");
          setIsLoading(false);
          return;
        } catch (error) {
          console.log("Failed to refresh token:", error);
          // To jest OK - oznacza że nie ma ważnego refresh token
          setUser(null);
          setIsLogged(false);
        } finally {
          setIsRefreshing(false);
          setIsLoading(false);
        }
      } else {
        // Mamy użytkownika z tokenu
        setUser(currentUser);
        setIsLogged(!!currentUser);
        setIsLoading(false);
        console.log("Auth state updated, isLogged:", !!currentUser);
      }
    } catch (error) {
      console.error("Unexpected error in refreshAuth:", error);
      // Graceful fallback - wyczyść stan auth
      setUser(null);
      setIsLogged(false);
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const hasRole = (role: string): boolean => {
    return user?.roles.includes(role) ?? false;
  };

  // Sprawdza czy użytkownik ma jakąkolwiek rolę biznesową (nie tylko "Uzytkownik")
  const hasBusinessRole = (): boolean => {
    if (!user?.roles) return false;
    return user.roles.some(role => role !== "Uzytkownik");
  };

  // Sprawdza czy użytkownik może tworzyć rezerwacje stanowisk
  const canReserveStanowiska = (): boolean => {
    return hasRole("Student") || hasRole("Nauczyciel") || hasRole("Opiekun") || hasRole("Admin");
  };

  // Sprawdza czy użytkownik może tworzyć rezerwacje sal
  const canReserveSale = (): boolean => {
    return hasRole("Nauczyciel") || hasRole("Opiekun") || hasRole("Admin");
  };

  const logout = async () => {
    try {
      const { logout: authLogout } = await import('../services/authService');
      await authLogout();
    } catch (error) {
      console.error("Błąd podczas wylogowywania:", error);
      // Nie blokuj wylogowania z powodu błędu API
    }
    
    // Zawsze wyczyść stan lokalny, niezależnie od błędów API
    try {
      setUser(null);
      setIsLogged(false);
      setIsRefreshing(false);
    } catch (error) {
      console.error("Error clearing auth state:", error);
      // Ostateczny fallback - reload strony
      window.location.reload();
    }
  };

  useEffect(() => {
    console.log("=== AuthContext useEffect mounting ===");
    console.log("Document cookies at mount:", document.cookie);
    
    // Bezpieczne wywołanie refreshAuth z error handling
    const initializeAuth = async () => {
      try {
        await refreshAuth();
      } catch (error) {
        console.error("Error during auth initialization:", error);
        // Graceful fallback - ustaw stan na niezalogowany
        setUser(null);
        setIsLogged(false);
        setIsLoading(false);
        setIsRefreshing(false);
      }
    };
    
    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLogged, isLoading, hasRole, hasBusinessRole, canReserveStanowiska, canReserveSale, refreshAuth, logout }}>
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