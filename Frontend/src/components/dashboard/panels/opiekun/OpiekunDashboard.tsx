import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { fetchMojeSale } from '../../../../services/salaService';
import { fetchMojeRezerwacje, generateRecentActivities } from '../../../../services/rezerwacjaService';
import { fetchMojeStanowiska } from '../../../../services/stanowiskoService';

export default function OpiekunDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    mojeSale: 0,
    mojeStanowiska: 0,
    oczekujaceRezerwacje: 0,
    dzisiejszeRezerwacje: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Pobierz sale opiekuna
        const saleData = await fetchMojeSale();
        
        // Pobierz rezerwacje opiekuna
        const rezerwacjeData = await fetchMojeRezerwacje();
        
        // Pobierz stanowiska opiekuna (prawdziwe dane)
        const stanowiskaData = await fetchMojeStanowiska();
        
        // Oblicz oczekujące rezerwacje
        const oczekujaceRezerwacje = rezerwacjeData.filter((r: any) => r.status === 'oczekujące').length;
        
        // Oblicz dzisiejsze rezerwacje
        const today = new Date().toDateString();
        const dzisiejszeRezerwacje = rezerwacjeData.filter((r: any) => {
          const rezerwacjaDate = new Date(r.dataStart).toDateString();
          return rezerwacjaDate === today && r.status === 'zaakceptowano';
        }).length;
        
        setStats({
          mojeSale: saleData.length,
          mojeStanowiska: stanowiskaData.length, // Prawdziwa liczba stanowisk
          oczekujaceRezerwacje,
          dzisiejszeRezerwacje
        });
        
        // Generuj ostatnie aktywności (Opcja A - bez nowej tabeli)
        const activities = generateRecentActivities(rezerwacjeData);
        setRecentActivities(activities);
        
      } catch (error) {
        console.error('Błąd pobierania statystyk:', error);
        // Fallback do mock data w przypadku błędu
        setStats({
          mojeSale: 0,
          mojeStanowiska: 0,
          oczekujaceRezerwacje: 0,
          dzisiejszeRezerwacje: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsCards = [
    {
      title: 'Moje sale',
      value: stats.mojeSale,
      change: 'Pod Twoją opieką',
      icon: '🏢',
      color: 'bg-blue-500',
      href: '#moje-sale'
    },
    {
      title: 'Stanowiska', 
      value: stats.mojeStanowiska,
      change: 'W Twoich salach',
      icon: '💻',
      color: 'bg-green-500',
      href: '#moje-stanowiska'
    },
    {
      title: 'Oczekujące',
      value: stats.oczekujaceRezerwacje,
      change: 'Wymagają zatwierdzenia',
      icon: '⏳',
      color: 'bg-orange-500',
      href: '#rezerwacje'
    },
    {
      title: 'Dzisiaj',
      value: stats.dzisiejszeRezerwacje,
      change: 'Aktywne rezerwacje',
      icon: '📅',
      color: 'bg-red-500',
      href: '#rezerwacje'
    }
  ];


  // Generuj nadchodzące rezerwacje z prawdziwych danych
  const upcomingReservations = React.useMemo(() => {
    if (!recentActivities.length) return [];
    
    // Weź z recentActivities tylko oczekujące i zaakceptowane na najbliższe dni
    return recentActivities
      .filter(activity => activity.type === 'new' || activity.type === 'approved')
      .slice(0, 3) // Max 3 nadchodzące
      .map(activity => ({
        sala: activity.details.split(' •')[0], // Wyciągnij nazwę sali z details
        uzytkownik: 'Użytkownik', // Można rozszerzyć o prawdziwe dane
        czas: activity.details.split(' •')[1] || 'Brak danych',
        status: activity.type === 'new' ? 'oczekujące' : 'zaakceptowano'
      }));
  }, [recentActivities]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div
            key={index}
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Ostatnie aktywności
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    activity.type === 'new' ? 'bg-blue-100' :
                    activity.type === 'approved' ? 'bg-green-100' :
                    activity.type === 'cancelled' ? 'bg-red-100' :
                    'bg-gray-100'
                  }`}>
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

        {/* Upcoming Reservations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Nadchodzące rezerwacje
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingReservations.map((reservation, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {reservation.sala}
                    </p>
                    <p className="text-xs text-gray-500">
                      {reservation.uzytkownik} • {reservation.czas}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    reservation.status === 'oczekujące' 
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {reservation.status}
                  </span>
                </div>
              ))}
            </div>
            
            {stats.oczekujaceRezerwacje > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                  Zarządzaj wszystkimi rezerwacjami ({stats.oczekujaceRezerwacje} oczekuje)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Szybkie akcje
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🏢</span>
              <div>
                <p className="font-medium">Edytuj moje sale</p>
                <p className="text-sm text-gray-500">Zmień opisy i godziny</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📅</span>
              <div>
                <p className="font-medium">Zatwierdzaj rezerwacje</p>
                <p className="text-sm text-gray-500">Sprawdź oczekujące</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📊</span>
              <div>
                <p className="font-medium">Zobacz raporty</p>
                <p className="text-sm text-gray-500">Statystyki użycia</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}