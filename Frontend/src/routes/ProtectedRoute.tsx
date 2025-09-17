import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLogged, isLoading } = useAuth();

  // Pokaż loading podczas sprawdzania auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Sprawdzanie uprawnień...</p>
        </div>
      </div>
    );
  }

  // Przekieruj do loginu jeśli nie zalogowany
  if (!isLogged) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}