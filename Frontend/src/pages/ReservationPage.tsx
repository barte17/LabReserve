import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createReservation, getAvailableHours, getAvailableDays } from '../services/rezerwacjaService';
import type { AvailableDayDto } from '../services/rezerwacjaService';
import { getUserFromToken } from '../services/authService';

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
  
  const salaId = searchParams.get('salaId') ? parseInt(searchParams.get('salaId')!) : undefined;
  const stanowiskoId = searchParams.get('stanowiskoId') ? parseInt(searchParams.get('stanowiskoId')!) : undefined;
  const resourceName = searchParams.get('name') || '';
  
  const [isLogged, setIsLogged] = useState(false);
  
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
  }, [salaId, stanowiskoId, navigate]);

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

  const fetchAvailableHours = async () => {
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
  };

  const fetchAvailableDays = async () => {
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
      console.error('Błąd podczas pobierania dostępnych dni:', err);
      if (err.message?.includes('401')) {
        setError('Musisz być zalogowany, aby zobaczyć dostępne terminy');
      } else {
        setError('Błąd podczas ładowania kalendarza');
      }
    } finally {
      setCalendarLoading(false);
    }
  };

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
    
    // Sprawdź kolejne godziny po godzinie rozpoczęcia
    // Uwzględnij wszystkie godziny z availableHours (włącznie z godziną zamknięcia)
    for (let hour = startHourNum + 1; hour <= 20; hour++) {
      const hourStr = `${hour.toString().padStart(2, '0')}:00`;
      
      // Sprawdź czy ta godzina istnieje w availableHours
      const availableHour = availableHours.find(h => formatHour(h.godzina) === hourStr);
      
      if (availableHour) {
        // Jeśli godzina istnieje w availableHours, dodaj ją (niezależnie od dostępności)
        // Godzina zakończenia nie musi być "dostępna" - to tylko punkt końcowy
        endHours.push(hourStr);
      } else {
        // Jeśli godzina nie istnieje w availableHours, przerwij
        break;
      }
    }
    
    return endHours;
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
      
      // Przekieruj po 2 sekundach
      setTimeout(() => {
        navigate('/my-reservations');
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Rezerwacja: {resourceName}
          </h1>
          

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Kalendarz */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Wybierz datę rezerwacji *
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
                          p-2 text-sm rounded-md transition-colors relative
                          ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                          ${day.isToday ? 'bg-blue-100 text-blue-600 font-semibold' : ''}
                          ${day.isSelected ? 'bg-blue-600 text-white' : ''}
                          ${day.isDisabled 
                            ? 'cursor-not-allowed opacity-50 bg-gray-100' 
                            : day.hasAvailableHours 
                              ? 'hover:bg-blue-50 cursor-pointer bg-green-50 border border-green-200' 
                              : 'hover:bg-gray-50 cursor-pointer bg-red-50 border border-red-200'
                          }
                        `}
                      >
                        {day.date.getDate()}
                        {day.isCurrentMonth && !day.isDisabled && (
                          <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${
                            day.hasAvailableHours ? 'bg-green-400' : 'bg-red-400'
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
                    <span>Dostępne terminy</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
                    <span>Brak dostępnych terminów</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gray-100 rounded"></div>
                    <span>Niedostępne (przeszłość)</span>
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
                        className={`p-2 text-sm rounded border transition-colors ${
                          !hour.dostepna
                            ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                            : selectedStartHour === formatHour(hour.godzina)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className="text-center">
                          {formatHour(hour.godzina)}
                          {!hour.dostepna && (
                            <div className="text-xs text-gray-400 mt-1">zajęte</div>
                          )}
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
                      className={`p-2 text-sm rounded border ${
                        selectedEndHour === hour
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
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dodatkowe informacje o rezerwacji..."
              />
              <p className="mt-1 text-sm text-gray-500">
                {description.length}/500 znaków
              </p>
            </div>

            {/* Podsumowanie */}
            {selectedDate && selectedStartHour && selectedEndHour && (
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-medium text-blue-900 mb-2">Podsumowanie rezerwacji:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li><strong>Zasób:</strong> {resourceName}</li>
                  <li><strong>Data:</strong> {selectedDate.toLocaleDateString('pl-PL')}</li>
                  <li><strong>Godziny:</strong> {selectedStartHour} - {selectedEndHour}</li>
                  {description && <li><strong>Opis:</strong> {description}</li>}
                </ul>
              </div>
            )}

            {/* Przyciski */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={loading || !selectedDate || !selectedStartHour || !selectedEndHour}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Tworzenie...' : 'Utwórz rezerwację'}
              </button>
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
        </div>
      </div>
    </div>
  );
}