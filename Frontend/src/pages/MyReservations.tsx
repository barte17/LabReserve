import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyReservations, cancelReservation } from '../services/rezerwacjaService';
import type { RezerwacjaDetailsDto } from '../services/rezerwacjaService';
import { LoadingTable } from '../components/LoadingStates';
import { useMinimumLoadingDelay } from '../hooks/useMinimumLoadingDelay';

export default function MyReservations() {
  const [reservations, setReservations] = useState<RezerwacjaDetailsDto[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<RezerwacjaDetailsDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Filtry i sortowanie
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'upcoming' | 'date-desc' | 'date-asc' | 'created-desc' | 'created-asc'>('upcoming');
  
  // Paginacja
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    document.title = "Moje Rezerwacje - System Rezerwacji";
    loadReservations();
  }, []);

  // Efekt do filtrowania i sortowania
  useEffect(() => {
    let filtered = [...reservations];

    // Wyszukiwanie
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(reservation => {
        const roomName = reservation.salaNumer ? `Sala ${reservation.salaNumer} (${reservation.salaBudynek})` : '';
        const stationName = reservation.stanowiskoNazwa || '';
        const description = reservation.opis || '';
        const reservationDate = new Date(reservation.dataStart).toLocaleDateString('pl-PL');
        const createdDate = new Date(reservation.dataUtworzenia).toLocaleDateString('pl-PL');
        
        return roomName.toLowerCase().includes(searchLower) ||
               stationName.toLowerCase().includes(searchLower) ||
               description.toLowerCase().includes(searchLower) ||
               reservationDate.includes(searchLower) ||
               createdDate.includes(searchLower);
      });
    }

    // Filtrowanie według statusu
    if (statusFilter !== 'all') {
      filtered = filtered.filter(reservation => reservation.status === statusFilter);
    }

    // Sortowanie
    const now = new Date();
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'upcoming':
          // Inteligentne sortowanie: przyszłe na górze (od najbliższych), potem przeszłe (od najnowszych)
          const aDate = new Date(a.dataStart);
          const bDate = new Date(b.dataStart);
          const aIsFuture = aDate > now;
          const bIsFuture = bDate > now;
          
          if (aIsFuture && bIsFuture) {
            // Oba w przyszłości - sortuj od najbliższych
            return aDate.getTime() - bDate.getTime();
          } else if (!aIsFuture && !bIsFuture) {
            // Oba w przeszłości - sortuj od najnowszych
            return bDate.getTime() - aDate.getTime();
          } else {
            // Przyszłe na górze
            return aIsFuture ? -1 : 1;
          }
        case 'date-desc':
          return new Date(b.dataStart).getTime() - new Date(a.dataStart).getTime();
        case 'date-asc':
          return new Date(a.dataStart).getTime() - new Date(b.dataStart).getTime();
        case 'created-desc':
          return new Date(b.dataUtworzenia).getTime() - new Date(a.dataUtworzenia).getTime();
        case 'created-asc':
          return new Date(a.dataUtworzenia).getTime() - new Date(b.dataUtworzenia).getTime();
        default:
          return 0;
      }
    });

    setFilteredReservations(filtered);
  }, [reservations, searchTerm, statusFilter, sortBy]);

  // Reset strony przy zmianie filtrów
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

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
              <>
                {/* Filtry i wyszukiwanie */}
                <div className="mb-6 space-y-4">
                  {/* Wyszukiwanie */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Szukaj po nazwie sali/stanowiska, opisie, dacie..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Filtry i sortowanie */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Filtr statusu */}
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">Wszystkie statusy</option>
                        <option value="oczekujące">Oczekujące</option>
                        <option value="zaakceptowano">Zaakceptowane</option>
                        <option value="odrzucono">Odrzucone</option>
                        <option value="anulowane">Anulowane</option>
                      </select>
                    </div>

                    {/* Sortowanie */}
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sortuj według</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="upcoming">Nadchodzące</option>
                        <option value="date-desc">Data rezerwacji (malejąco)</option>
                        <option value="date-asc">Data rezerwacji (rosnąco)</option>
                        <option value="created-desc">Data utworzenia (malejąco)</option>
                        <option value="created-asc">Data utworzenia (rosnąco)</option>
                      </select>
                    </div>

                    {/* Reset filtrów */}
                    {(searchTerm || statusFilter !== 'all' || sortBy !== 'upcoming') && (
                      <div className="flex items-end">
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('all');
                            setSortBy('upcoming');
                          }}
                          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Wyczyść filtry
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Licznik wyników */}
                  <div className="text-sm text-gray-600">
                    Znaleziono {filteredReservations.length} z {reservations.length} rezerwacji
                    {filteredReservations.length > itemsPerPage && (
                      <span className="ml-2">
                        (strona {currentPage} z {Math.ceil(filteredReservations.length / itemsPerPage)})
                      </span>
                    )}
                  </div>
                </div>

                {/* Lista rezerwacji */}
                <div className="space-y-4">
                  {filteredReservations.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-lg">Brak rezerwacji spełniających kryteria</p>
                      <p className="text-gray-400 mt-2">Spróbuj zmienić filtry lub wyszukiwanie</p>
                    </div>
                  ) : (
                    (() => {
                      // Paginacja - wyciągnij tylko rezerwacje dla aktualnej strony
                      const startIndex = (currentPage - 1) * itemsPerPage;
                      const endIndex = startIndex + itemsPerPage;
                      const paginatedReservations = filteredReservations.slice(startIndex, endIndex);
                      
                      return paginatedReservations.map((reservation) => (
                  <div key={reservation.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    {/* Header z tytułem, opisem i statusem */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 pr-3">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {reservation.salaNumer ? 
                            `Sala ${reservation.salaNumer} (${reservation.salaBudynek})` :
                            `Stanowisko: ${reservation.stanowiskoNazwa}`
                          }
                        </h3>
                        {reservation.opis && (
                          <p className="text-sm text-gray-600 mt-1 truncate" title={reservation.opis}>
                            {reservation.opis}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full flex-shrink-0 ${getStatusColor(reservation.status)}`}>
                        {reservation.status}
                      </span>
                    </div>

                    {/* Informacje i przycisk */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      {/* Informacje w kompaktowej formie */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">
                            {new Date(reservation.dataStart).toLocaleDateString('pl-PL')}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">
                            {new Date(reservation.dataStart).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })} - {' '}
                            {new Date(reservation.dataKoniec).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span>
                            {new Date(reservation.dataUtworzenia).toLocaleDateString('pl-PL')}
                          </span>
                        </div>
                      </div>

                      {/* Przycisk anulowania - tylko jeśli można anulować */}
                      {canCancel(reservation) && (
                        <button
                          onClick={() => handleCancel(reservation.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm self-start sm:self-auto"
                        >
                          Anuluj
                        </button>
                      )}
                    </div>
                  </div>
                      ));
                    })()
                  )}
                </div>

                {/* Paginacja */}
                {filteredReservations.length > itemsPerPage && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Pokazano {Math.min((currentPage - 1) * itemsPerPage + 1, filteredReservations.length)} - {Math.min(currentPage * itemsPerPage, filteredReservations.length)} z {filteredReservations.length} wyników
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Poprzednia strona */}
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          currentPage === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                      >
                        Poprzednia
                      </button>

                      {/* Numery stron */}
                      {(() => {
                        const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
                        const pages = [];
                        const maxVisiblePages = 5;
                        
                        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                        
                        if (endPage - startPage + 1 < maxVisiblePages) {
                          startPage = Math.max(1, endPage - maxVisiblePages + 1);
                        }

                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => setCurrentPage(i)}
                              className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                currentPage === i
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }
                        
                        return pages;
                      })()}

                      {/* Następna strona */}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredReservations.length / itemsPerPage)))}
                        disabled={currentPage === Math.ceil(filteredReservations.length / itemsPerPage)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          currentPage === Math.ceil(filteredReservations.length / itemsPerPage)
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                      >
                        Następna
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}