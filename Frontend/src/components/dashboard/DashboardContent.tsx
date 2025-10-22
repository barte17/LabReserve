import React from 'react';

// Import istniejących komponentów admin
import SaleListAdmin from '../SaleListAdmin';
import StanowiskaListAdmin from '../StanowiskaListAdmin';
import UsersListAdmin from '../UsersListAdmin';
import RezerwacjeList from '../RezerwacjeList';

// Import nowych komponentów opiekun (będą utworzone)
import OpiekunDashboard from './panels/opiekun/OpiekunDashboard';
import MojeSale from './panels/opiekun/MojeSale';
import MojeStanowiska from './panels/opiekun/MojeStanowiska';
import ZarzadzajRezerwacje from './panels/opiekun/ZarzadzajRezerwacje';

// Import komponentów user (będą utworzone)
import UserDashboardPanel from './panels/user/UserDashboard';
import RezerwujSale from './panels/user/RezerwujSale';
import MojeRezerwacje from './panels/user/MojeRezerwacje';
import MojePowiadomienia from './panels/user/MojePowiadomienia';
import UserProfile from './panels/user/UserProfile';

// Import adminowych komponentów
import AdminDashboard from './panels/admin/AdminDashboard';
import Logi from './panels/admin/Logi';

interface DashboardContentProps {
  role: string;
  activeSection: string;
  onSectionChange?: (section: string, shouldAutoAdd?: boolean, options?: { autoFilter?: string }) => void;
  autoAdd?: string | null;
  onAutoAddProcessed?: () => void;
  onStatsUpdate?: (stats: { mojeSale: number; mojeStanowiska: number; oczekujaceRezerwacje: number }) => void;
  autoFilterRezerwacje?: string | null;
  onAutoFilterProcessed?: () => void;
}

export default function DashboardContent({ role, activeSection, onSectionChange, autoAdd, onAutoAddProcessed, onStatsUpdate, autoFilterRezerwacje, onAutoFilterProcessed }: DashboardContentProps) {
  // Renderowanie dla roli Admin
  if (role === 'admin') {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard onSectionChange={onSectionChange} />;
      case 'sale':
        return <SaleListAdmin autoAdd={autoAdd === 'sale'} onAutoAddProcessed={onAutoAddProcessed} />;
      case 'stanowiska':
        return <StanowiskaListAdmin autoAdd={autoAdd === 'stanowiska'} onAutoAddProcessed={onAutoAddProcessed} />;
      case 'uzytkownicy':
        return <UsersListAdmin autoFilter={autoAdd === 'uzytkownicy-niezatwierdzeni' ? 'niezatwierdzony' : undefined} />;
      case 'rezerwacje':
        return <RezerwacjeList autoFilter={autoFilterRezerwacje || undefined} onAutoFilterProcessed={onAutoFilterProcessed} />;
      case 'logi':
        return <Logi />;
      default:
        return <AdminDashboard />;
    }
  }

  // Renderowanie dla roli Opiekun
  if (role === 'opiekun') {
    switch (activeSection) {
      case 'dashboard':
        return (
          <OpiekunDashboard
            onStatsUpdate={onStatsUpdate}
            onNavigate={(section, opts) => onSectionChange?.(section, false, opts)}
          />
        );
      case 'moje-sale':
        return <MojeSale />;
      case 'moje-stanowiska':
        return <MojeStanowiska />;
      case 'rezerwacje':
        return <ZarzadzajRezerwacje autoFilter={autoFilterRezerwacje || undefined} onAutoFilterProcessed={onAutoFilterProcessed} />;
      default:
        return <OpiekunDashboard onStatsUpdate={onStatsUpdate} />;
    }
  }

  // Renderowanie dla roli User
  if (role === 'user') {
    switch (activeSection) {
      case 'dashboard':
        return <UserDashboardPanel onNavigate={(section) => onSectionChange?.(section)} />;
      case 'rezerwuj':
        return <RezerwujSale />;
      case 'moje-rezerwacje':
        return <MojeRezerwacje />;
      case 'powiadomienia':
        return <MojePowiadomienia />;
      case 'profil':
        return <UserProfile />;
      default:
        return <UserDashboardPanel onNavigate={(section) => onSectionChange?.(section)} />;
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