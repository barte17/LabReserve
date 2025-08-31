import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyReservations, cancelReservation } from '../services/rezerwacjaService';
import type { RezerwacjaDetailsDto } from '../services/rezerwacjaService';

export default function MyReservations() {
  const [reservations, setReservations] = useState<RezerwacjaDetailsDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    document.title = "Moje Rezerwacje - System Rezerwacji";
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await fetchMyReservations();
      setReservations(data);
    } catch (err: any) {
      setError(err.message || 'Błąd podczas ładowania rezerwacji');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Czy na pewno chcesz anulować tę rezerwację?')) return;
    
    try {
      await cancelReservation(id);
      await loadReservations(); // Odśwież listę
    } catch (err: any) {
      setError(err.message || 'Błąd podczas anulowania rezerwacji');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'zaakceptowano': return 'bg-green-100 text-green-800';
      case 'oczekujące': return 'bg-yellow-100 text-yellow-800';
      case 'odrzucono': return 'bg-red-100 text-red-800';
      case 'anulowane': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canCancel = (reservation: RezerwacjaDetailsDto) => {
    // Nie można anulować już anulowanych rezerwacji
    if (reservation.status === 'anulowane') {
      return false;
    }
    
    // Sprawdź czy rezerwacja jeszcze się nie rozpoczęła
    const startDate = new Date(reservation.dataStart);
    const now = new Date();
    
    // Można anulować jeśli data rozpoczęcia jest w przyszłości
    // Przykład: dziś 31.08.2025 12:00 - można anulować rezerwację z 31.08.2025 13:00
    return startDate > now;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Ładowanie rezerwacji...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Moje Rezerwacje</h1>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="p-6">
            {reservations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">Nie masz jeszcze żadnych rezerwacji</p>
                <div className="mt-4 flex gap-4 justify-center">
                  <Link 
                    to="/sale" 
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Przeglądaj sale
                  </Link>
                  <Link 
                    to="/stanowiska" 
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Przeglądaj stanowiska
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {reservations.map((reservation) => (
                  <div key={reservation.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {reservation.salaNumer ? 
                          `Sala ${reservation.salaNumer} (${reservation.salaBudynek})` :
                          `Stanowisko: ${reservation.stanowiskoNazwa}`
                        }
                      </h3>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full self-start ${getStatusColor(reservation.status)}`}>
                        {reservation.status}
                      </span>
                    </div>

                    {/* Główna zawartość */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Informacje */}
                      <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">Data</div>
                            <div className="text-sm text-gray-900 font-medium">
                              {new Date(reservation.dataStart).toLocaleDateString('pl-PL')}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">Godziny</div>
                            <div className="text-sm text-gray-900 font-medium">
                              {new Date(reservation.dataStart).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })} - {' '}
                              {new Date(reservation.dataKoniec).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">Utworzono</div>
                            <div className="text-sm text-gray-900 font-medium">
                              {new Date(reservation.dataUtworzenia).toLocaleDateString('pl-PL')}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Przycisk/Status */}
                      <div className="flex justify-start lg:justify-end">
                        {canCancel(reservation) ? (
                          <button
                            onClick={() => handleCancel(reservation.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                          >
                            Anuluj
                          </button>
                        ) : (
                          <span className={`px-3 py-2 rounded-lg text-sm font-medium ${
                            reservation.status === 'anulowane' 
                              ? 'bg-red-50 text-red-700 border border-red-200' 
                              : 'bg-gray-50 text-gray-600 border border-gray-200'
                          }`}>
                            {reservation.status === 'anulowane' ? 'Anulowano rezerwację' : 'Nie można anulować'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Opis */}
                    {reservation.opis && (
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-500 font-medium mb-1">Opis</div>
                        <p className="text-sm text-gray-700">{reservation.opis}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}