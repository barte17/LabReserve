import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSale } from '../../../../services/salaService';
import { fetchStanowiska } from '../../../../services/stanowiskoService';
import { fetchUserStats, fetchRezerwacjeStats } from '../../../../services/statsService';
import { checkExpiredReservations } from '../../../../services/rezerwacjaService';
import { auditLogService } from '../../../../services/auditLogService';
import type { AuditLog } from '../../../../services/auditLogService';
import { useToastContext } from '../../../ToastProvider';

interface AdminDashboardProps {
  onSectionChange?: (section: string, shouldAutoAdd?: boolean, options?: { autoFilter?: string }) => void;
}

export default function AdminDashboard({ onSectionChange }: AdminDashboardProps = {}) {
  const navigate = useNavigate();
  const { showInfo, showSuccess, showError } = useToastContext();

  const handleSectionChange = (section: string, shouldAutoAdd: boolean = false, options?: { autoFilter?: string }) => {
    if (onSectionChange) {
      onSectionChange(section, shouldAutoAdd, options);
    } else {
      // Fallback: nawiguj przez URL
      navigate(`/panel?view=admin&section=${section}`);
    }
  };

  const handleCheckExpiredReservations = async () => {
    try {
      const result = await checkExpiredReservations();

      if (result.updatedCount === 0) {
        showInfo('Brak przeterminowanych rezerwacji');
      } else {
        showSuccess(`Zaktualizowano ${result.updatedCount} ${result.updatedCount === 1 ? 'rezerwację' : 'rezerwacji'} na status "po terminie"`);
      }

      // Odśwież statystyki po sprawdzeniu
      loadStats();
    } catch (error) {
      console.error('Błąd sprawdzania wygasłych rezerwacji:', error);
      showError('Błąd podczas sprawdzania wygasłych rezerwacji');
    }
  };

  const [stats, setStats] = useState([
    {
      title: 'Sale',
      value: '0',
      change: 'Ładowanie...',
      icon: '🏢',
      color: 'bg-blue-500',
      href: '/panel?view=admin&section=sale'
    },
    {
      title: 'Stanowiska',
      value: '0',
      change: 'Ładowanie...',
      icon: '💻',
      color: 'bg-green-500',
      href: '/panel?view=admin&section=stanowiska'
    },
    {
      title: 'Użytkownicy',
      value: '0',
      change: 'Ładowanie...',
      icon: '👥',
      color: 'bg-purple-500',
      href: '/panel?view=admin&section=uzytkownicy'
    },
    {
      title: 'Rezerwacje',
      value: '0',
      change: 'Ładowanie...',
      icon: '📅',
      color: 'bg-red-500',
      href: '/panel?view=admin&section=rezerwacje'
    }
  ]);

  const [recentActivities, setRecentActivities] = useState<AuditLog[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  const loadStats = async () => {
    try {
      // Pobierz wszystkie dane z API
      const [saleData, stanowiskaData, userStatsData, rezerwacjeStatsData] = await Promise.all([
        fetchSale(),
        fetchStanowiska(),
        fetchUserStats(),
        fetchRezerwacjeStats()
      ]);

      setStats([
        {
          title: 'Sale',
          value: saleData.length.toString(),
          change: '',
          icon: '🏢',
          color: 'bg-blue-500',
          section: 'sale',
          unconfirmedUsers: 0,
          pendingReservations: 0
        },
        {
          title: 'Stanowiska',
          value: stanowiskaData.length.toString(),
          change: '',
          icon: '💻',
          color: 'bg-green-500',
          section: 'stanowiska',
          unconfirmedUsers: 0,
          pendingReservations: 0
        },
        {
          title: 'Użytkownicy',
          value: userStatsData.totalUsers.toString(),
          change: '',
          icon: '👥',
          color: 'bg-purple-500',
          section: 'uzytkownicy',
          unconfirmedUsers: userStatsData.unconfirmedUsers,
          pendingReservations: 0
        },
        {
          title: 'Rezerwacje',
          value: rezerwacjeStatsData.totalRezerwacje.toString(),
          change: '',
          icon: '📅',
          color: 'bg-red-500',
          section: 'rezerwacje',
          unconfirmedUsers: 0,
          pendingReservations: rezerwacjeStatsData.oczekujaceRezerwacje
        }
      ]);
    } catch (error) {
      console.error('Błąd pobierania statystyk:', error);
      // Fallback w przypadku błędu
      setStats([
        {
          title: 'Sale',
          value: '0',
          change: 'Błąd ładowania',
          icon: '🏢',
          color: 'bg-blue-500',
          href: '/panel?view=admin&section=sale'
        },
        {
          title: 'Stanowiska',
          value: '0',
          change: 'Błąd ładowania',
          icon: '💻',
          color: 'bg-green-500',
          href: '/panel?view=admin&section=stanowiska'
        },
        {
          title: 'Użytkownicy',
          value: '0',
          change: 'Błąd ładowania',
          icon: '👥',
          color: 'bg-purple-500',
          href: '/panel?view=admin&section=uzytkownicy'
        },
        {
          title: 'Rezerwacje',
          value: '0',
          change: 'Błąd ładowania',
          icon: '📅',
          color: 'bg-red-500',
          href: '/panel?view=admin&section=rezerwacje'
        }
      ]);
    }
  };

  const loadRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      const response = await auditLogService.getAuditLogs({
        sortBy: 'Timestamp',
        sortOrder: 'desc',
        page: 1,
        pageSize: 5
      });
      setRecentActivities(response.logs);
    } catch (error) {
      console.error('Błąd ładowania ostatnich aktywności:', error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'UTWORZENIE_REZERWACJI': return '📅';
      case 'ZMIANA_STATUSU_REZERWACJI': return '🔄';
      case 'USUNIECIE_REZERWACJI': return '❌';
      case 'LOGOWANIE_UDANE': return '✅';
      case 'LOGOWANIE_NIEUDANE': return '❌';
      case 'WYLOGOWANIE': return '🚪';
      case 'REJESTRACJA_UZYTKOWNIKA': return '👤';
      default: return '📋';
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'UTWORZENIE_REZERWACJI': return 'bg-green-100 text-green-600';
      case 'ZMIANA_STATUSU_REZERWACJI': return 'bg-blue-100 text-blue-600';
      case 'USUNIECIE_REZERWACJI': return 'bg-red-100 text-red-600';
      case 'LOGOWANIE_UDANE': return 'bg-green-100 text-green-600';
      case 'LOGOWANIE_NIEUDANE': return 'bg-yellow-100 text-yellow-600';
      case 'WYLOGOWANIE': return 'bg-gray-100 text-gray-600';
      case 'REJESTRACJA_UZYTKOWNIKA': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatActivityTime = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} min. temu`;
    } else if (diffHours < 24) {
      return `${diffHours} godz. temu`;
    } else {
      return `${diffDays} dni temu`;
    }
  };

  useEffect(() => {
    loadStats();
    loadRecentActivities();
  }, []);


  return (
    <div className="space-y-4 w-full overflow-x-hidden">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            onClick={() => handleSectionChange(stat.section)}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg text-white text-2xl mr-4`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {stat.change && <p className="text-xs text-gray-500">{stat.change}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Szybkie akcje
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => handleSectionChange('sale', true)}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">🏢</span>
                <span className="font-medium">Dodaj nową salę</span>
              </div>
            </button>
            <button
              onClick={() => handleSectionChange('stanowiska', true)}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">💻</span>
                <span className="font-medium">Dodaj nowe stanowisko</span>
              </div>
            </button>
            <button
              onClick={() => handleSectionChange('uzytkownicy')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">👥</span>
                <span className="font-medium">Zarządzaj użytkownikami</span>
              </div>
            </button>
            <button
              onClick={handleCheckExpiredReservations}
              className="w-full text-left p-3 rounded-lg border border-orange-200 hover:bg-orange-50 transition-colors border-2"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">⏰</span>
                <span className="font-medium text-orange-700">Sprawdź wygasłe rezerwacje</span>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Wymagają uwagi
          </h3>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleSectionChange('uzytkownicy', true)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600">👥</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Użytkownicy bez ról biznesowych</p>
                    <p className="text-xs text-gray-500">Kliknij aby zarządzać</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-orange-600">
                    {stats.find(s => s.title === 'Użytkownicy')?.unconfirmedUsers || '0'}
                  </span>
                  <p className="text-xs text-gray-500">oczekuje</p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleSectionChange('rezerwacje', false, { autoFilter: 'oczekujące' })}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600">📅</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Oczekujące rezerwacje</p>
                    <p className="text-xs text-gray-500">Kliknij aby zarządzać</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-yellow-600">
                    {stats.find(s => s.title === 'Rezerwacje')?.pendingReservations || '0'}
                  </span>
                  <p className="text-xs text-gray-500">oczekuje</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3 mt-4">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">
                    {new Date().toLocaleDateString('pl-PL', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date().toLocaleTimeString('pl-PL', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              📋 Ostatnie aktywności
            </h2>
            <button
              onClick={() => handleSectionChange('logi')}
              className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Zobacz wszystkie logi
            </button>
          </div>
        </div>
        <div className="p-6">
          {activitiesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Brak ostatnich aktywności
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={activity.id || index} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${getActivityColor(activity.action)}`}>
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {activity.userEmail && `${activity.userEmail}`}
                      {activity.details && ` - ${activity.details}`}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-xs text-gray-400">
                    {formatActivityTime(activity.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}