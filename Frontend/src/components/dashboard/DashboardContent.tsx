import React from 'react';

// Import istniejących komponentów admin
import SaleListAdmin from '../SaleListAdmin';
import StanowiskaListAdmin from '../StanowiskaListAdmin';
import UsersListAdmin from '../UsersListAdmin';

// Import nowych komponentów opiekun (będą utworzone)
import OpiekunDashboard from './panels/opiekun/OpiekunDashboard';
import MojeSale from './panels/opiekun/MojeSale';
import MojeStanowiska from './panels/opiekun/MojeStanowiska';
import ZarzadzajRezerwacje from './panels/opiekun/ZarzadzajRezerwacje';

// Import komponentów user (będą utworzone)
import UserDashboardPanel from './panels/user/UserDashboard';
import RezerwujSale from './panels/user/RezerwujSale';
import MojeRezerwacje from './panels/user/MojeRezerwacje';
import UserProfile from './panels/user/UserProfile';

// Import admina dashboard (będzie utworzony)
import AdminDashboard from './panels/admin/AdminDashboard';

interface DashboardContentProps {
  role: string;
  activeSection: string;
}

export default function DashboardContent({ role, activeSection }: DashboardContentProps) {
  // Renderowanie dla roli Admin
  if (role === 'admin') {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'sale':
        return <SaleListAdmin />;
      case 'stanowiska':
        return <StanowiskaListAdmin />;
      case 'uzytkownicy':
        return <UsersListAdmin />;
      case 'rezerwacje':
        return <div className="text-center py-8 text-gray-500">Moduł rezerwacji w przygotowaniu...</div>;
      default:
        return <AdminDashboard />;
    }
  }

  // Renderowanie dla roli Opiekun
  if (role === 'opiekun') {
    switch (activeSection) {
      case 'dashboard':
        return <OpiekunDashboard />;
      case 'moje-sale':
        return <MojeSale />;
      case 'moje-stanowiska':
        return <MojeStanowiska />;
      case 'rezerwacje':
        return <ZarzadzajRezerwacje />;
      default:
        return <OpiekunDashboard />;
    }
  }

  // Renderowanie dla roli User
  if (role === 'user') {
    switch (activeSection) {
      case 'dashboard':
        return <UserDashboardPanel />;
      case 'rezerwuj':
        return <RezerwujSale />;
      case 'moje-rezerwacje':
        return <MojeRezerwacje />;
      case 'profil':
        return <UserProfile />;
      default:
        return <UserDashboardPanel />;
    }
  }

  // Fallback
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 text-6xl mb-4">🤔</div>
      <h2 className="text-xl font-medium text-gray-900 mb-2">
        Nieznana rola: {role}
      </h2>
      <p className="text-gray-500">
        Nie można wyświetlić zawartości dla tej roli.
      </p>
    </div>
  );
}