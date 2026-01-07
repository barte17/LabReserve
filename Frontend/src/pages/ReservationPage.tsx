import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createReservation, getAvailableHours, getAvailableDays } from '../services/rezerwacjaService';
import type { AvailableDayDto } from '../services/rezerwacjaService';
import { getUserFromToken } from '../services/authService';
import { FormErrorBoundary } from '../components/ErrorBoundary';
import { useRealtimeCalendar } from '../hooks/useRealtimeCalendar';
import { useAuth } from '../contexts/AuthContext';
import UnauthorizedMessage from '../components/UnauthorizedMessage';
import { LoadingButton } from '../components/LoadingStates';

interface AvailableHour {
  godzina: string;
  dostepna: boolean;
}

interface ReservationData {
  salaId?: number;
  stanowiskoId?: number;
  dataStart: string;
  dataKoniec: string;
  opis?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  hasAvailableHours: boolean;
}

export default function ReservationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { canReserveSale, canReserveStanowiska } = useAuth();

  const salaId = searchParams.get('salaId') ? parseInt(searchParams.get('salaId')!) : undefined;
  const stanowiskoId = searchParams.get('stanowiskoId') ? parseInt(searchParams.get('stanowiskoId')!) : undefined;
  const resourceName = searchParams.get('name') || '';

  const [isLogged, setIsLogged] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [availableHours, setAvailableHours] = useState<AvailableHour[]>([]);
  const [availableDays, setAvailableDays] = useState<AvailableDayDto[]>([]);
  const [selectedStartHour, setSelectedStartHour] = useState<string>('');
  const [selectedEndHour, setSelectedEndHour] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [showUpdateIndicator, setShowUpdateIndicator] = useState(false);

  // Ustaw minimalną datę na dzisiaj
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Maksymalna data - 3 miesiące w przód
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);

  useEffect(() => {
    // Sprawdź autoryzację
    const user = getUserFromToken();
    setIsLogged(!!user);

    if (!salaId && !stanowiskoId) {
      navigate('/');
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    // Sprawdź uprawnienia do konkretnego typu rezerwacji
    if (salaId && !canReserveSale()) {
      // Student próbuje zarezerwować salę
      setPermissionError("Nie masz uprawnień do rezerwacji sal. Tylko nauczyciele, opiekunowie i administratorzy mogą rezerwować sale.");
      return;
    }

    if (stanowiskoId && !canReserveStanowiska()) {
      // Użytkownik bez ról biznesowych próbuje zarezerwować stanowisko
      setPermissionError("Nie masz uprawnień do rezerwacji stanowisk. Skontaktuj się z administratorem aby aktywować swoje konto.");
      return;
    }

    // Jeśli dotarliśmy tutaj, użytkownik ma uprawnienia
    setPermissionError(null);
  }, [salaId, stanowiskoId, navigate, canReserveSale, canReserveStanowiska]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableHours();
    }
  }, [selectedDate]);

  useEffect(() => {
    const user = getUserFromToken();
    if (user && (salaId || stanowiskoId)) {
      fetchAvailableDays();
    }
  }, [currentMonth, salaId, stanowiskoId]);

  const fetchAvailableHours = useCallback(async () => {
    if (!selectedDate) return;

    try {
      setLoading(true);

      // Formatuj datę bez konwersji na UTC
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;


      const hours = await getAvailableHours({
        salaId,
        stanowiskoId,
        data: formattedDate
      });

      setAvailableHours(hours);
      setSelectedStartHour('');
      setSelectedEndHour('');
    } catch (err) {
      setError('Błąd podczas pobierania dostępnych godzin');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, salaId, stanowiskoId]);

  const fetchAvailableDays = useCallback(async () => {
    try {
      setCalendarLoading(true);
      const days = await getAvailableDays({
        salaId,
        stanowiskoId,
        year: currentMonth.getFullYear(),
        month: currentMonth.getMonth() + 1
      });

      setAvailableDays(days);
    } catch (err) {
      if (err.message?.includes('401')) {
        setError('Musisz być zalogowany, aby zobaczyć dostępne terminy');
      } else {
        setError('Błąd podczas ładowania kalendarza');
      }
    } finally {
      setCalendarLoading(false);
    }
  }, [salaId, stanowiskoId, currentMonth]);

  // Enhanced real-time calendar handlers with smart refresh
  const handleAvailabilityChanged = useCallback(async (data: any) => {
    setLastUpdate(new Date());

    // Smart refresh strategy
    let shouldRefreshHours = false;
    let shouldRefreshDays = false;

    // Always refresh hours if selected date matches changed date
    if (selectedDate) {
      // Use the same date formatting logic as fetchAvailableHours
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const selectedDateStr = `${year}-${month}-${day}`;

      if (selectedDateStr === data.changedDate) {
        shouldRefreshHours = true;
      }
    }

    // Smart days refresh - only when status changes might affect day availability
    const statusChangesAvailability =
      data.newStatus === 'odrzucono' ||
      data.newStatus === 'anulowane' ||
      data.newStatus === 'oczekujące' ||
      data.newStatus === 'zaakceptowano' ||
      data.newStatus === 'backup-refresh'; // Special case for connection resilience

    if (statusChangesAvailability) {
      shouldRefreshDays = true;
    }

    // Execute smart refreshes
    const refreshPromises = [];

    if (shouldRefreshHours) {
      refreshPromises.push(fetchAvailableHours());
    }

    if (shouldRefreshDays) {
      refreshPromises.push(fetchAvailableDays());
    }

    // Execute in parallel for better performance
    if (refreshPromises.length > 0) {
      // Show update indicator
      setShowUpdateIndicator(true);

      await Promise.all(refreshPromises);

      // Hide indicator after 3 seconds
      setTimeout(() => {
        setShowUpdateIndicator(false);
      }, 3000);
    }
  }, [selectedDate, fetchAvailableHours, fetchAvailableDays]);

  const handleConnectionStateChanged = useCallback((isConnected: boolean) => {
    setIsRealtimeConnected(isConnected);
  }, []);

  // Funkcje kalendarza
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days: CalendarDay[] = [];

    // Dodaj dni z poprzedniego miesiąca
    const prevMonth = new Date(year, month - 1, 0);
    const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Niedziela = 6, Poniedziałek = 0, inaczej niedziela jest pierwsza
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
        isDisabled: true,
        hasAvailableHours: false
      });
    }

    // Dodaj dni z bieżącego miesiąca
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isDisabled = date < today || date > maxDate;

      // Znajdź dostępność dla tego dnia
      const dayAvailability = availableDays.find(d =>
        isSameDay(new Date(d.data), date)
      );

      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
        isDisabled: isDisabled || !dayAvailability?.maDostepneGodziny,
        hasAvailableHours: dayAvailability?.maDostepneGodziny || false
      });
    }

    // Dodaj dni z następnego miesiąca aby wypełnić siatkę
    const remainingDays = 42 - days.length; // 6 tygodni * 7 dni
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
        isDisabled: true,
        hasAvailableHours: false
      });
    }

    return days;
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  };

  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const handleDateSelect = (day: CalendarDay) => {
    if (day.isDisabled) return;
    setSelectedDate(day.date);
    setError('');
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const monthNames = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
  ];

  const dayNames = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];

  const handleStartHourChange = (hour: string) => {
    setSelectedStartHour(hour);
    setSelectedEndHour('');
  };

  // Funkcja do generowania dostępnych godzin zakończenia
  const getAvailableEndHours = () => {
    if (!selectedStartHour) return [];

    const startHourNum = parseInt(selectedStartHour.split(':')[0]);
    const endHours = [];

    // Oblicz maksymalną godzinę zakończenia na podstawie dostępnych godzin
    // Maksymalna godzina końca to ostatnia dostępna godzina + 1
    const maxEndHour = availableHours.length > 0
      ? Math.max(...availableHours.map(h => parseInt(h.godzina.split(':')[0]))) + 1
      : 20; // fallback do 20 jeśli brak danych

    // Sprawdź kolejne godziny po godzinie rozpoczęcia
    for (let hour = startHourNum + 1; hour <= maxEndHour; hour++) {
      const hourStr = `${hour.toString().padStart(2, '0')}:00`;

      // Sprawdź czy wszystkie godziny od startu do tej godziny są dostępne
      let allHoursAvailable = true;

      for (let checkHour = startHourNum; checkHour < hour; checkHour++) {
        const checkHourStr = `${checkHour.toString().padStart(2, '0')}:00`;
        const availableHour = availableHours.find(h => formatHour(h.godzina) === checkHourStr);

        if (!availableHour || !availableHour.dostepna) {
          allHoursAvailable = false;
          break;
        }
      }

      // Godzina zakończenia nie musi być w availableHours (to są godziny rozpoczęcia)
      // Wystarczy sprawdzić czy wszystkie godziny w przedziale są dostępne
      if (allHoursAvailable) {
        endHours.push(hourStr);
      } else {
        // Jeśli jakaś godzina w przedziale jest niedostępna, przerwij
        break;
      }
    }

    return endHours;
  };

  // Reset formularza po błędzie
  const resetForm = () => {
    setSelectedDate(null);
    setSelectedStartHour('');
    setSelectedEndHour('');
    setDescription('');
    setAvailableHours([]);
    setLoading(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedStartHour || !selectedEndHour) {
      setError('Proszę wypełnić wszystkie wymagane pola');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Twórz daty w czasie lokalnym (bez konwersji na UTC)
      const startDateTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(),
        parseInt(selectedStartHour.split(':')[0]), 0, 0, 0);

      const endDateTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(),
        parseInt(selectedEndHour.split(':')[0]), 0, 0, 0);

      // Formatuj daty bez konwersji na UTC
      const formatDateTimeLocal = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      };


      const reservationData: ReservationData = {
        salaId,
        stanowiskoId,
        dataStart: formatDateTimeLocal(startDateTime),
        dataKoniec: formatDateTimeLocal(endDateTime),
        opis: description || undefined
      };

      await createReservation(reservationData);
      setSuccess('Rezerwacja została złożona pomyślnie!');

      // Odśwież dostępność po utworzeniu rezerwacji
      setLastUpdate(new Date());
      await fetchAvailableDays();
      if (selectedDate) {
        await fetchAvailableHours();
      }

      // Przekieruj po 2 sekundach
      setTimeout(() => {
        navigate('/panel?view=user&section=moje-rezerwacje');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Błąd podczas tworzenia rezerwacji');
    } finally {
      setLoading(false);
    }
  };

  const formatHour = (timeSpan: string) => {
    const hours = timeSpan.split(':')[0].padStart(2, '0');
    return `${hours}:00`;
  };

  // Setup real-time calendar (na końcu po zdefiniowaniu wszystkich funkcji)
  useRealtimeCalendar({
    salaId,
    stanowiskoId,
    onAvailabilityChanged: handleAvailabilityChanged,
    onConnectionStateChanged: handleConnectionStateChanged
  });

  // Jeśli użytkownik nie ma uprawnień, pokaż komunikat
  if (permissionError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-4">Brak uprawnień</h1>
            <p className="text-gray-600 mb-6">{permissionError}</p>
            <div className="flex gap-4">
              <button
                onClick={() => window.history.back()}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                ← Wstecz
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                🏠 Strona główna
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
        .animate-pulse-once {
          animation: pulse-subtle 0.6s ease-in-out;
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(-8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Rezerwacja: {resourceName}
            </h1>

            <div className="flex items-center gap-4">
              {/* Subtle update indicator */}
              {showUpdateIndicator && (
                <div className="flex items-center gap-2 text-sm bg-blue-50 border border-blue-200 rounded-full px-3 py-1 animate-fade-in">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                  <span className="text-blue-700 font-medium">Zaktualizowano</span>
                </div>
              )}

              {/* Real-time status indicator */}
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                <span className={isRealtimeConnected ? 'text-green-600' : 'text-gray-500'}>
                  {isRealtimeConnected ? 'Na żywo' : 'Offline'}
                </span>
                {lastUpdate && (
                  <span className="text-xs text-gray-400 ml-2">
                    Aktualizacja: {lastUpdate.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          </div>


          <FormErrorBoundary
            onError={resetForm}
            fallbackMessage="Wystąpił błąd w formularzu rezerwacji. Formularz został zresetowany."
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Kalendarz */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Wybierz datę rezerwacji
                </label>

                {!isLogged && (
                  <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                    Musisz być zalogowany, aby zobaczyć dostępne terminy.
                  </div>
                )}

                {/* Nagłówek kalendarza */}
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={() => navigateMonth('prev')}
                      className="p-2 hover:bg-gray-100 rounded-md"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <h3 className="text-lg font-semibold text-gray-900">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h3>

                    <button
                      type="button"
                      onClick={() => navigateMonth('next')}
                      className="p-2 hover:bg-gray-100 rounded-md"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Dni tygodnia */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map(day => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Dni miesiąca */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarLoading ? (
                      // Skeleton loading dla kalendarza
                      Array.from({ length: 42 }).map((_, index) => (
                        <div key={index} className="p-2 h-8 bg-gray-200 animate-pulse rounded-md"></div>
                      ))
                    ) : (
                      generateCalendarDays().map((day, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleDateSelect(day)}
                          disabled={day.isDisabled}
                          className={`
                          p-2 text-sm rounded-md transition-all duration-200 relative
                          ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                          ${day.isToday && !day.isSelected ? 'bg-blue-100 text-blue-600 font-semibold' : ''}
                          ${day.isSelected
                              ? 'bg-blue-600 text-white font-bold border-4 border-blue-800 shadow-lg transform scale-105'
                              : day.isDisabled
                                ? 'cursor-not-allowed opacity-50 bg-gray-100 border border-gray-200'
                                : day.hasAvailableHours
                                  ? 'hover:bg-blue-50 cursor-pointer bg-green-50 border border-green-200 hover:border-green-300'
                                  : 'hover:bg-gray-50 cursor-pointer bg-red-50 border border-red-200 hover:border-red-300'
                            }
                        `}
                        >
                          {day.date.getDate()}
                          {day.isCurrentMonth && !day.isDisabled && (
                            <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${day.hasAvailableHours ? 'bg-green-400' : 'bg-red-400'
                              }`}></div>
                          )}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Legenda */}
                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
                      <span>Dostępne dni</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-gray-100 rounded"></div>
                      <span>Niedostępne dni</span>
                    </div>
                  </div>

                  {selectedDate && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>Wybrana data:</strong> {selectedDate.toLocaleDateString('pl-PL', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Dostępne godziny rozpoczęcia */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Godzina rozpoczęcia *
                  </label>
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <p className="mt-2 text-sm text-gray-600">Ładowanie dostępnych godzin...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {availableHours.map((hour) => (
                        <button
                          key={hour.godzina}
                          type="button"
                          onClick={() => hour.dostepna ? handleStartHourChange(formatHour(hour.godzina)) : null}
                          disabled={!hour.dostepna}
                          className={`p-2 text-sm rounded border transition-all duration-300 ${!hour.dostepna
                            ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                            : selectedStartHour === formatHour(hour.godzina)
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-200'
                            } ${lastUpdate && 'animate-pulse-once'}`}
                          style={{
                            animation: lastUpdate ? 'pulse-subtle 0.6s ease-in-out' : undefined
                          }}
                        >
                          <div className="text-center">
                            {formatHour(hour.godzina)}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Dostępne godziny zakończenia */}
              {selectedStartHour && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Godzina zakończenia *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {getAvailableEndHours().map((hour) => (
                      <button
                        key={hour}
                        type="button"
                        onClick={() => setSelectedEndHour(hour)}
                        className={`p-2 text-sm rounded border ${selectedEndHour === hour
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                          }`}
                      >
                        {hour}
                      </button>
                    ))}
                  </div>
                  {getAvailableEndHours().length === 0 && (
                    <p className="mt-2 text-sm text-red-600">
                      Brak dostępnych godzin zakończenia dla wybranej godziny rozpoczęcia
                    </p>
                  )}
                </div>
              )}

              {/* Opis */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Opis (opcjonalnie)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  maxLength={60}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Dodatkowe informacje o rezerwacji..."
                />
                <p className="mt-1 text-sm text-gray-500">
                  {description.length}/60 znaków
                </p>
              </div>

              {/* Podsumowanie */}
              {selectedDate && selectedStartHour && selectedEndHour && (
                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="font-medium text-blue-900 mb-2">Podsumowanie rezerwacji:</h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <div><strong>Zasób:</strong> <span className="break-words">{resourceName}</span></div>
                    <div><strong>Data:</strong> {selectedDate.toLocaleDateString('pl-PL')}</div>
                    <div><strong>Godziny:</strong> {selectedStartHour} - {selectedEndHour}</div>
                    {description && (
                      <div className="flex flex-col sm:flex-row sm:items-start gap-1">
                        <strong className="flex-shrink-0">Opis:</strong>
                        <span className="break-words break-all">{description}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Przyciski */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anuluj
                </button>
                <LoadingButton
                  type="submit"
                  loading={loading}
                  loadingText="Tworzenie rezerwacji..."
                  disabled={!selectedDate || !selectedStartHour || !selectedEndHour}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Utwórz rezerwację
                </LoadingButton>
              </div>

              {/* Błędy i komunikaty pod przyciskami */}
              {error && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                  {success}
                </div>
              )}
            </form>
          </FormErrorBoundary>
        </div>
      </div>
    </div>
  );
}