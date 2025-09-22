import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardHeaderProps {
  role: string;
  onMenuClick: () => void;
}

export default function DashboardHeader({ role, onMenuClick }: DashboardHeaderProps) {
  const { user } = useAuth();

  const getRoleInfo = () => {
    switch (role) {
      case 'admin':
        return { label: 'Administrator', color: 'bg-red-600', icon: '🔧' };
      case 'opiekun':
        return { label: 'Opiekun', color: 'bg-red-500', icon: '👨‍🏫' };
      case 'user':
        return { label: 'Użytkownik', color: 'bg-gray-600', icon: '👤' };
      default:
        return { label: 'Użytkownik', color: 'bg-gray-600', icon: '👤' };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Mobile menu button */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <span className="sr-only">Otwórz menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Breadcrumb - desktop only */}
            <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-500">
              <span>Panel</span>
              <span>/</span>
              <span className="text-gray-900 font-medium">{roleInfo.label}</span>
            </div>
          </div>

          {/* User info */}
          <div className="flex items-center space-x-4">
            {/* Role badge */}
            <div className={`
              ${roleInfo.color} text-white px-3 py-1 rounded-full text-sm font-medium
              flex items-center space-x-2
            `}>
              <span>{roleInfo.icon}</span>
              <span className="hidden sm:inline">{roleInfo.label}</span>
            </div>

            {/* User info */}
            <div className="flex items-center">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}