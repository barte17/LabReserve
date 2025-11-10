import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import UnauthorizedMessage from '../components/UnauthorizedMessage';

interface BusinessRoleRouteProps {
  children: React.ReactNode;
  type?: 'business_roles' | 'stanowiska' | 'sale';
}

export const BusinessRoleRoute: React.FC<BusinessRoleRouteProps> = ({ 
  children, 
  type = 'business_roles' 
}) => {
  const { hasBusinessRole, canReserveStanowiska, canReserveSale } = useAuth();

  // Sprawdź uprawnienia w zależności od typu
  const hasPermission = () => {
    switch (type) {
      case 'stanowiska':
        return canReserveStanowiska();
      case 'sale':
        return canReserveSale();
      case 'business_roles':
      default:
        return hasBusinessRole();
    }
  };

  if (!hasPermission()) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6">
          <UnauthorizedMessage type={type} />
          <div className="mt-6 text-center">
            <button
              onClick={() => window.history.back()}
              className="btn btn-secondary mr-3"
            >
              ← Wstecz
            </button>
            <a
              href="/"
              className="btn btn-primary"
            >
              🏠 Strona główna
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};