import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyReservations, deleteRezerwacja } from '../services/rezerwacjaService';
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

  const handleDelete = async (id: number) => {
    if (!confirm('Czy na pewno chcesz anulować tę rezerwację?')) return;
    
    try {
      await deleteRezerwacja(id);
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
    const startDate = new Date(reservation.dataStart);
    const now = new Date();
    return startDate > now && reservation.status !== 'anulowane';
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
                <Link 
                  to="/sale" 
                  className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Przeglądaj sale
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {reservations.map((reservation) => (
                  <div key={reservation.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {reservation.salaNumer ? 
                              `Sala ${reservation.salaNumer} (${reservation.salaBudynek})` :
                              `Stanowisko: ${reservation.stanowiskoNazwa}`
                            }
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reservation.status)}`}>
                            {reservation.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <strong>Data:</strong> {new Date(reservation.dataStart).toLocaleDateString('pl-PL')}
                          </div>
                          <div>
                            <strong>Godziny:</strong> {' '}
                            {new Date(reservation.dataStart).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })} - {' '}
                            {new Date(reservation.dataKoniec).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div>
                            <strong>Utworzono:</strong> {new Date(reservation.dataUtworzenia).toLocaleDateString('pl-PL')}
                          </div>
                        </div>
                        
                        {reservation.opis && (
                          <div className="mt-2 text-sm text-gray-600">
                            <strong>Opis:</strong> {reservation.opis}
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4">
                        {canCancel(reservation) && (
                          <button
                            onClick={() => handleDelete(reservation.id)}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Anuluj
                          </button>
                        )}
                      </div>
                    </div>
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