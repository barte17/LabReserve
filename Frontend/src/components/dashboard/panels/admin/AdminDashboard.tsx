import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSale } from '../../../../services/salaService';
import { fetchStanowiska } from '../../../../services/stanowiskoService';
import { fetchUserStats, fetchRezerwacjeStats } from '../../../../services/statsService';

export default function AdminDashboard() {
  const navigate = useNavigate();
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

  useEffect(() => {
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
            change: `${saleData.length} sal w systemie`,
            icon: '🏢',
            color: 'bg-blue-500',
            href: '/panel?view=admin&section=sale'
          },
          {
            title: 'Stanowiska', 
            value: stanowiskaData.length.toString(),
            change: `${stanowiskaData.length} stanowisk`,
            icon: '💻',
            color: 'bg-green-500',
            href: '/panel?view=admin&section=stanowiska'
          },
          {
            title: 'Użytkownicy',
            value: userStatsData.totalUsers.toString(),
            change: `${userStatsData.unconfirmedUsers} oczekuje zatwierdzenia`,
            icon: '👥',
            color: 'bg-purple-500',
            href: '/panel?view=admin&section=uzytkownicy'
          },
          {
            title: 'Rezerwacje',
            value: rezerwacjeStatsData.totalRezerwacje.toString(),
            change: `${rezerwacjeStatsData.oczekujaceRezerwacje} oczekuje`,
            icon: '📅',
            color: 'bg-red-500',
            href: '/panel?view=admin&section=rezerwacje'
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

    loadStats();
  }, []);

  const recentActivities = [
    { action: 'Dodano nową salę', details: 'Sala A101 - Laboratorium IT', time: '2 godz. temu', icon: '🏢' },
    { action: 'Nowy użytkownik', details: 'jan.kowalski@example.com', time: '4 godz. temu', icon: '👤' },
    { action: 'Zatwierdzono rezerwację', details: 'Sala B205 - 15:00-17:00', time: '6 godz. temu', icon: '✅' },
    { action: 'Dodano stanowisko', details: 'Stanowisko PC-12 w sali A101', time: '1 dzień temu', icon: '💻' },
  ];

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            onClick={() => navigate(stat.href)}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg text-white text-2xl mr-4`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.change}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Ostatnie aktywności (do zrobienia w przyszłości)
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action}
                  </p>
                  <p className="text-sm text-gray-500">
                    {activity.details}
                  </p>
                </div>
                <div className="flex-shrink-0 text-xs text-gray-400">
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Szybkie akcje
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/panel?view=admin&section=sale')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">🏢</span>
                <span className="font-medium">Dodaj nową salę</span>
              </div>
            </button>
            <button
              onClick={() => navigate('/panel?view=admin&section=stanowiska')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">💻</span>
                <span className="font-medium">Dodaj nowe stanowisko</span>
              </div>
            </button>
            <button
              onClick={() => navigate('/panel?view=admin&section=uzytkownicy')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">👥</span>
                <span className="font-medium">Zarządzaj użytkownikami</span>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Status systemu
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Baza danych</span>
              <span className="flex items-center text-green-600">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Status</span>
              <span className="flex items-center text-green-600">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                Aktywny
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ostatnia kopia</span>
              <span className="text-sm text-gray-500">2 godz. temu</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}