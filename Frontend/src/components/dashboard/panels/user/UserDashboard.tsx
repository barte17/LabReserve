import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { fetchMojeRezerwacje } from '../../../../services/rezerwacjaService';

interface Rezerwacja {
  id: number;
  dataStart: string;
  dataKoniec: string;
  dataUtworzenia: string;
  status: string;
  opis: string;
  uzytkownikId: string;
  uzytkownikImie: string;
  uzytkownikNazwisko: string;
  uzytkownikEmail: string;
  salaNumer: number;
  salaBudynek: string;
  stanowiskoNazwa?: string;
}

interface UserDashboardProps {
  onNavigate?: (section: string) => void;
}

export default function UserDashboard({ onNavigate }: UserDashboardProps = {}) {
  const { user } = useAuth();
  const [rezerwacje, setRezerwacje] = useState<Rezerwacja[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [aktywosciPage, setAktywosciPage] = useState(0);
  const [nadchodzacePage, setNadchodzacePage] = useState(0);
  const itemsPerPage = 4;

  useEffect(() => {
    loadRezerwacje();
  }, []);

  const loadRezerwacje = async () => {
    try {
      const data = await fetchMojeRezerwacje();
      setRezerwacje(data);
    } catch (error) {
      console.error('Błąd pobierania rezerwacji:', error);
    } finally {
      setLoading(false);
    }
  };

  // Oblicz statystyki
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

  const stats = {
    aktywne: rezerwacje.filter(r => {
      const start = new Date(r.dataStart);
      const end = new Date(r.dataKoniec);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return start <= today && end >= today && r.status === 'zaakceptowano';
    }).length,
    
    oczekujace: rezerwacje.filter(r => r.status === 'oczekujące').length,
    
    nadchodzaceTydzien: rezerwacje.filter(r => {
      const start = new Date(r.dataStart);
      start.setHours(0, 0, 0, 0);
      return start > today && start <= endOfWeek && r.status === 'zaakceptowano';
    }).length,
    
    dzisiaj: rezerwacje.filter(r => {
      const start = new Date(r.dataStart);
      start.setHours(0, 0, 0, 0);
      return start.getTime() === today.getTime() && r.status === 'zaakceptowano';
    }).length
  };

  // Ostatnie aktywności (wszystkie, paginowane po 4)
  const ostatnieAktywnosci = rezerwacje
    .sort((a, b) => new Date(b.dataUtworzenia).getTime() - new Date(a.dataUtworzenia).getTime());

  // Nadchodzące rezerwacje (wszystkie, paginowane po 4)
  const nadchodzaceRezerwacje = rezerwacje
    .filter(r => {
      const start = new Date(r.dataStart);
      return start > today && (r.status === 'zaakceptowano' || r.status === 'oczekujące');
    })
    .sort((a, b) => new Date(a.dataStart).getTime() - new Date(b.dataStart).getTime());

  // Paginacja dla karuzel
  const aktywosciTotalPages = Math.ceil(ostatnieAktywnosci.length / itemsPerPage);
  const nadchodzaceTotalPages = Math.ceil(nadchodzaceRezerwacje.length / itemsPerPage);
  
  const currentAktywnosci = ostatnieAktywnosci.slice(
    aktywosciPage * itemsPerPage, 
    (aktywosciPage + 1) * itemsPerPage
  );
  
  const currentNadchodzace = nadchodzaceRezerwacje.slice(
    nadchodzacePage * itemsPerPage, 
    (nadchodzacePage + 1) * itemsPerPage
  );

  // Kalendarzowy widok (bieżący miesiąc)
  const currentMonth = new Date();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  
  const kalendarzRezerwacje = rezerwacje.filter(r => {
    const start = new Date(r.dataStart);
    return start >= firstDay && start <= lastDay && r.status === 'zaakceptowano';
  });

  const getDaysInMonth = () => {
    const days = [];
    const startDate = new Date(firstDay);
    
    // Dopełnij dni z poprzedniego miesiąca
    const startDay = startDate.getDay() === 0 ? 6 : startDate.getDay() - 1;
    for (let i = startDay - 1; i >= 0; i--) {
      const day = new Date(firstDay);
      day.setDate(day.getDate() - i - 1);
      days.push({ date: day, isCurrentMonth: false });
    }
    
    // Dni bieżącego miesiąca
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Dopełnij do 42 dni (6 tygodni)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const day = new Date(lastDay);
      day.setDate(day.getDate() + i);
      days.push({ date: day, isCurrentMonth: false });
    }
    
    return days;
  };

  const getReservationsForDay = (date: Date) => {
    return kalendarzRezerwacje.filter(r => {
      const rezDate = new Date(r.dataStart);
      return rezDate.toDateString() === date.toDateString();
    });
  };

  const handleDateClick = (date: Date) => {
    if (!date || !getReservationsForDay(date).length) return;
    setSelectedDate(date);
  };

  const selectedDateReservations = selectedDate ? getReservationsForDay(selectedDate) : [];

  const handleNavigate = (section: string) => {
    if (onNavigate) {
      onNavigate(section);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Szybkie statystyki */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          onClick={() => handleNavigate('moje-rezerwacje')}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">📅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg text-gray-900">
                <span className="font-semibold">{stats.aktywne}</span>{' '}
                <span className="font-normal">
                  {stats.aktywne === 1 ? 'rezerwacja' : 
                   stats.aktywne >= 2 && stats.aktywne <= 4 ? 'rezerwacje' : 
                   'rezerwacji'}
                </span>
              </h3>
              <p className="text-sm text-gray-500">Aktywne dzisiaj</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => handleNavigate('moje-rezerwacje')}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600 text-xl">⏳</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg text-gray-900">
                <span className="font-semibold">{stats.oczekujace}</span>{' '}
                <span className="font-normal">
                  {stats.oczekujace === 1 ? 'rezerwacja' : 
                   stats.oczekujace >= 2 && stats.oczekujace <= 4 ? 'rezerwacje' : 
                   'rezerwacji'}
                </span>
              </h3>
              <p className="text-sm text-gray-500">Oczekujące</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => handleNavigate('moje-rezerwacje')}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">📊</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg text-gray-900">
                <span className="font-semibold">{stats.nadchodzaceTydzien}</span>{' '}
                <span className="font-normal">
                  {stats.nadchodzaceTydzien === 1 ? 'rezerwacja' : 
                   stats.nadchodzaceTydzien >= 2 && stats.nadchodzaceTydzien <= 4 ? 'rezerwacje' : 
                   'rezerwacji'}
                </span>
              </h3>
              <p className="text-sm text-gray-500">W tym tygodniu</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => handleNavigate('moje-rezerwacje')}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-xl">📈</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg text-gray-900">
                <span className="font-semibold">{rezerwacje.length}</span>{' '}
                <span className="font-normal">
                  {rezerwacje.length === 1 ? 'rezerwacja' : 
                   rezerwacje.length >= 2 && rezerwacje.length <= 4 ? 'rezerwacje' : 
                   'rezerwacji'}
                </span>
              </h3>
              <p className="text-sm text-gray-500">Wszystkich</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ostatnie aktywności */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Ostatnie aktywności</h2>
            <button
              onClick={() => handleNavigate('moje-rezerwacje')}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Zobacz wszystkie →
            </button>
          </div>
          
          <div className="flex-1 space-y-3 overflow-hidden">
            {ostatnieAktywnosci.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Brak aktywności</p>
            ) : (
              currentAktywnosci.map((rezerwacja) => (
                <div key={rezerwacja.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        rezerwacja.status === 'zaakceptowano' ? 'bg-green-500' :
                        rezerwacja.status === 'oczekujące' ? 'bg-yellow-500' :
                        rezerwacja.status === 'odrzucono' ? 'bg-red-500' : 'bg-gray-500'
                      }`}></span>
                      <span className="font-medium text-gray-900">
                        Sala {rezerwacja.salaNumer}{rezerwacja.salaBudynek}
                        {rezerwacja.stanowiskoNazwa && ` - ${rezerwacja.stanowiskoNazwa}`}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(rezerwacja.dataStart).toLocaleDateString('pl-PL')} - {rezerwacja.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Kontrolki karuzeli na dole */}
          {aktywosciTotalPages > 1 && (
            <div className="flex justify-center items-center mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setAktywosciPage(prev => Math.max(prev - 1, 0))}
                  disabled={aktywosciPage === 0}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="text-xl font-bold">‹</span>
                </button>
                <span className="text-sm text-gray-600 font-medium min-w-[3rem] text-center">
                  {aktywosciPage + 1}/{aktywosciTotalPages}
                </span>
                <button
                  onClick={() => setAktywosciPage(prev => Math.min(prev + 1, aktywosciTotalPages - 1))}
                  disabled={aktywosciPage >= aktywosciTotalPages - 1}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="text-xl font-bold">›</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Nadchodzące rezerwacje */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Nadchodzące rezerwacje</h2>
            <button
              onClick={() => handleNavigate('moje-rezerwacje')}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Zobacz wszystkie →
            </button>
          </div>
          
          <div className="flex-1 space-y-3 overflow-hidden">
            {nadchodzaceRezerwacje.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Brak nadchodzących rezerwacji</p>
            ) : (
              currentNadchodzace.map((rezerwacja) => (
                <div key={rezerwacja.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        rezerwacja.status === 'zaakceptowano' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></span>
                      <span className="font-medium text-gray-900">
                        Sala {rezerwacja.salaNumer}{rezerwacja.salaBudynek}
                        {rezerwacja.stanowiskoNazwa && ` - ${rezerwacja.stanowiskoNazwa}`}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(rezerwacja.dataStart).toLocaleDateString('pl-PL')} {new Date(rezerwacja.dataStart).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                      {' - '}
                      {new Date(rezerwacja.dataKoniec).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Kontrolki karuzeli na dole */}
          {nadchodzaceTotalPages > 1 && (
            <div className="flex justify-center items-center mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setNadchodzacePage(prev => Math.max(prev - 1, 0))}
                  disabled={nadchodzacePage === 0}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="text-xl font-bold">‹</span>
                </button>
                <span className="text-sm text-gray-600 font-medium min-w-[3rem] text-center">
                  {nadchodzacePage + 1}/{nadchodzaceTotalPages}
                </span>
                <button
                  onClick={() => setNadchodzacePage(prev => Math.min(prev + 1, nadchodzaceTotalPages - 1))}
                  disabled={nadchodzacePage >= nadchodzaceTotalPages - 1}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="text-xl font-bold">›</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Kalendarzowy widok */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Kalendarz - {currentMonth.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="text-sm text-gray-500">
              {kalendarzRezerwacje.length} rezerwacji w tym miesiącu
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {getDaysInMonth().map((day, index) => {
            const dayReservations = getReservationsForDay(day.date);
            const isToday = day.date.toDateString() === today.toDateString();
            const isSelected = selectedDate?.toDateString() === day.date.toDateString();
            const hasReservations = dayReservations.length > 0;
            
            return (
              <div
                key={index}
                onClick={() => handleDateClick(day.date)}
                className={`
                  relative h-12 border border-gray-100 flex items-center justify-center text-sm transition-colors
                  ${day.isCurrentMonth ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-400'}
                  ${isToday ? 'bg-red-50 border-red-200 text-red-600 font-bold' : ''}
                  ${hasReservations ? 'bg-green-50 cursor-pointer hover:bg-green-100' : ''}
                  ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                `}
              >
                <span>{day.date.getDate()}</span>
                {hasReservations && (
                  <div className="absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-200 rounded"></div>
            <span className="text-gray-600">Dzisiaj</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-200 rounded"></div>
            <span className="text-gray-600">Masz rezerwację (kliknij, aby zobaczyć)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-200 rounded"></div>
            <span className="text-gray-600">Wybrany dzień</span>
          </div>
        </div>

        {/* Szczegóły wybranego dnia */}
        {selectedDate && selectedDateReservations.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Rezerwacje na {selectedDate.toLocaleDateString('pl-PL', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <div className="space-y-3">
              {selectedDateReservations.map((rezerwacja) => (
                <div key={rezerwacja.id} className="bg-white p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        Sala {rezerwacja.salaNumer}{rezerwacja.salaBudynek}
                        {rezerwacja.stanowiskoNazwa && ` - ${rezerwacja.stanowiskoNazwa}`}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(rezerwacja.dataStart).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        {new Date(rezerwacja.dataKoniec).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {rezerwacja.opis && (
                        <div className="text-sm text-gray-500 mt-1">
                          {rezerwacja.opis}
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rezerwacja.status === 'zaakceptowano' ? 'bg-green-100 text-green-800' :
                      rezerwacja.status === 'oczekujące' ? 'bg-yellow-100 text-yellow-800' :
                      rezerwacja.status === 'odrzucono' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {rezerwacja.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedDate(null)}
              className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Ukryj szczegóły
            </button>
          </div>
        )}
      </div>
    </div>
  );
}