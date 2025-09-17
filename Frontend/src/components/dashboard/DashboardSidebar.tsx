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
}

export default function DashboardSidebar({
  role,
  availableRoles,
  activeSection,
  onSectionChange,
  onRoleChange,
  onClose
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
      { id: 'rezerwacje', label: 'Wszystkie rezerwacje', icon: '📅', description: 'Podgląd rezerwacji' }
    ],
    opiekun: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊', description: 'Przegląd moich sal' },
      { id: 'moje-sale', label: 'Moje sale', icon: '🏢', badge: '0', description: 'Sale pod opieką' },
      { id: 'moje-stanowiska', label: 'Moje stanowiska', icon: '💻', badge: '0', description: 'Stanowiska w salach' },
      { id: 'rezerwacje', label: 'Zarządzaj rezerwacjami', icon: '📅', badge: '0', description: 'Zatwierdź/odrzuć' }
    ],
    user: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊', description: 'Przegląd aktywności' },
      { id: 'rezerwuj', label: 'Rezerwuj salę', icon: '📅', description: 'Nowa rezerwacja' },
      { id: 'moje-rezerwacje', label: 'Moje rezerwacje', icon: '📋', description: 'Historia rezerwacji' },
      { id: 'profil', label: 'Profil', icon: '👤', description: 'Ustawienia konta' }
    ]
  };

  const currentMenu = menuConfig[role] || menuConfig.user;
  const currentRoleInfo = availableRoles.find(r => r.key === role);

  const handleRoleSwitch = (newRole: string) => {
    onRoleChange(newRole);
    navigate(`/panel?view=${newRole}`);
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-2xl mr-3">{currentRoleInfo?.icon}</div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {role === 'admin' && 'Panel Admina'}
                {role === 'opiekun' && 'Panel Opiekuna'}
                {role === 'user' && 'Panel Użytkownika'}
              </h2>
              <p className="text-sm text-gray-500">
                {user?.email}
              </p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <span className="sr-only">Zamknij menu</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {currentMenu.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onSectionChange(item.id);
              onClose();
            }}
            className={`
              w-full text-left px-3 py-3 rounded-lg transition-colors duration-200
              flex items-center justify-between group
              ${activeSection === item.id
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <div className="flex items-center">
              <span className="text-lg mr-3">{item.icon}</span>
              <div>
                <div className="font-medium">{item.label}</div>
                {item.description && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    {item.description}
                  </div>
                )}
              </div>
            </div>
            
            {item.badge && (
              <span className={`
                px-2 py-1 text-xs font-medium rounded-full
                ${activeSection === item.id
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
                }
              `}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Role switcher i logout */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 space-y-2">
        {/* Role switcher - tylko jeśli więcej niż jedna rola */}
        {availableRoles.length > 1 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">PRZEŁĄCZ PANEL:</p>
            {availableRoles
              .filter(r => r.key !== role)
              .map((roleOption) => (
                <button
                  key={roleOption.key}
                  onClick={() => handleRoleSwitch(roleOption.key)}
                  className="w-full text-left px-3 py-2 text-sm rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 flex items-center transition-colors"
                >
                  <span className="mr-2">{roleOption.icon}</span>
                  {roleOption.label.replace('Panel ', '')}
                </button>
              ))
            }
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-sm rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center transition-colors"
        >
          <span className="mr-2">🚪</span>
          Wyloguj się
        </button>
      </div>
    </div>
  );
}