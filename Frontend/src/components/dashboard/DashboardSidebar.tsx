import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Role {
  key: string;
  label: string;
  icon: string;
  color: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  badge?: string | number;
  description?: string;
}

interface DashboardSidebarProps {
  role: string;
  availableRoles: Role[];
  activeSection: string;
  onSectionChange: (section: string) => void;
  onRoleChange: (role: string) => void;
  onClose: () => void;
  stats?: {
    mojeSale?: number;
    mojeStanowiska?: number;
    oczekujaceRezerwacje?: number;
  };
}

export default function DashboardSidebar({
  role,
  availableRoles,
  activeSection,
  onSectionChange,
  onRoleChange,
  onClose,
  stats
}: DashboardSidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Konfiguracja menu dla różnych ról
  const menuConfig: Record<string, MenuItem[]> = {
    admin: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊', description: 'Przegląd systemu' },
      { id: 'sale', label: 'Zarządzanie salami', icon: '🏢', description: 'Dodaj, edytuj sale' },
      { id: 'stanowiska', label: 'Zarządzanie stanowiskami', icon: '💻', description: 'Dodaj, edytuj stanowiska' },
      { id: 'uzytkownicy', label: 'Użytkownicy', icon: '👥', description: 'Zarządzaj kontami' },
      { id: 'rezerwacje', label: 'Wszystkie rezerwacje', icon: '📅', description: 'Podgląd rezerwacji' },
      { id: 'logi', label: 'Logi', icon: '📋', description: 'Historia działań' }
    ],
    opiekun: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊', description: 'Przegląd moich sal' },
      { id: 'moje-sale', label: 'Moje sale', icon: '🏢', badge: stats?.mojeSale || 0, description: 'Sale pod opieką' },
      { id: 'moje-stanowiska', label: 'Moje stanowiska', icon: '💻', badge: stats?.mojeStanowiska || 0, description: 'Stanowiska w salach' },
      { id: 'rezerwacje', label: 'Zarządzaj rezerwacjami', icon: '📅', badge: stats?.oczekujaceRezerwacje || 0, description: 'Zatwierdź/odrzuć' }
    ],
    user: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊', description: 'Przegląd aktywności' },
      { id: 'rezerwuj', label: 'Rezerwuj salę', icon: '📅', description: 'Nowa rezerwacja' },
      { id: 'moje-rezerwacje', label: 'Moje rezerwacje', icon: '📋', description: 'Historia rezerwacji' },
      { id: 'powiadomienia', label: 'Moje powiadomienia', icon: '🔔', description: 'Powiadomienia systemowe' },
      { id: 'profil', label: 'Profil', icon: '👤', description: 'Ustawienia konta' }
    ]
  };

  const currentMenu = menuConfig[role] || menuConfig.user;
  const currentRoleInfo = availableRoles.find(r => r.key === role);

  const handleRoleSwitch = (newRole: string) => {
    onRoleChange(newRole);
    
    // Sprawdź czy jest zapisana sekcja dla nowego panelu
    const savedSection = localStorage.getItem(`lastSection_${newRole}`);
    const targetSection = savedSection || 'dashboard';
    
    navigate(`/panel?view=${newRole}&section=${targetSection}`);
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="h-full flex flex-col bg-white shadow-xl border-r border-gray-200/60">
      {/* Header - Panel Info & Role Switcher */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200/60">
        {/* Panel Header */}
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <div className="flex-shrink-0">
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center text-lg font-semibold
                  ${role === 'admin' ? 'bg-red-100 text-red-700' : ''}
                  ${role === 'opiekun' ? 'bg-blue-100 text-blue-700' : ''}
                  ${role === 'user' ? 'bg-green-100 text-green-700' : ''}
                `}>
                  {currentRoleInfo?.icon}
                </div>
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <h2 className="text-lg font-bold text-gray-900 truncate">
                  {role === 'admin' && 'Panel Admina'}
                  {role === 'opiekun' && 'Panel Opiekuna'}
                  {role === 'user' && 'Panel Użytkownika'}
                </h2>
                <p className="text-sm text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="lg:hidden ml-2 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <span className="sr-only">Zamknij menu</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Role Switcher - Vertical Layout */}
        {availableRoles.length > 1 && (
          <div className="px-6 pb-4">
            <div className="space-y-2">
              <span className="text-xs font-medium text-gray-500 block text-center">Przełącz panel:</span>
              <div className="space-y-1">
                {availableRoles
                  .filter(r => r.key !== role)
                  .map((roleOption) => (
                    <button
                      key={roleOption.key}
                      onClick={() => handleRoleSwitch(roleOption.key)}
                      className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-300"
                    >
                      <span className="mr-2.5">{roleOption.icon}</span>
                      <span>{roleOption.label.replace('Panel ', '')}</span>
                    </button>
                  ))
                }
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto dashboard-sidebar-scrollbar">
        <div className="space-y-2">
          {currentMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSectionChange(item.id);
                onClose();
              }}
              className={`
                w-full group text-left px-4 py-3.5 rounded-xl transition-all duration-200
                flex items-center justify-between
                ${activeSection === item.id
                  ? 'bg-gradient-to-r from-red-50 to-red-50/50 text-red-700 shadow-sm border border-red-200/60'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                }
              `}
            >
              <div className="flex items-center min-w-0 flex-1">
                <span className={`
                  text-lg mr-3 flex-shrink-0 transition-transform duration-200
                  ${activeSection === item.id ? 'scale-110' : 'group-hover:scale-105'}
                `}>
                  {item.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm leading-tight truncate">{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-gray-500 mt-0.5 truncate">
                      {item.description}
                    </div>
                  )}
                </div>
              </div>
              
              {(item.badge !== undefined && item.badge !== null && item.badge > 0) && (
                <div className="flex-shrink-0 ml-2">
                  <span className={`
                    inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-bold rounded-full
                    ${activeSection === item.id
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-700 group-hover:bg-gray-200'
                    }
                  `}>
                    {item.badge}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Footer - Logout */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200/60 p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
        >
          <span className="mr-3 text-base group-hover:scale-110 transition-transform duration-200">🚪</span>
          <span>Wyloguj się</span>
        </button>
      </div>
    </div>
  );
}