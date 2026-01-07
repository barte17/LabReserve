import React, { useState, useEffect } from 'react';
import { fetchMyReservations, cancelReservation } from '../../../../services/rezerwacjaService';
import { useToastContext } from '../../../ToastProvider';
import { useMinimumLoadingDelay } from '../../../../hooks/useMinimumLoadingDelay';

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

export default function MojeRezerwacje() {
  const [rezerwacje, setRezerwacje] = useState<Rezerwacja[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState(''); // 'sala', 'stanowisko', ''
  const [showCompleted, setShowCompleted] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { showSuccess, showError } = useToastContext();

  useEffect(() => {
    loadRezerwacje();
  }, []);

  const loadRezerwacje = async () => {
    try {
      const data = await fetchMyReservations();
      setRezerwacje(data);
    } catch (error) {
      console.error('Błąd pobierania rezerwacji:', error);
      showError('Błąd podczas pobierania rezerwacji');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (id: number) => {
    if (!window.confirm('Czy na pewno chcesz anulować tę rezerwację?')) {
      return;
    }

    try {
      await cancelReservation(id);
      showSuccess('Rezerwacja została anulowana');
      // Odświeżamy listę rezerwacji
      await loadRezerwacje();
    } catch (error) {
      console.error('Błąd anulowania rezerwacji:', error);
      showError('Błąd podczas anulowania rezerwacji');
    }
  };

  // Filtrowanie i sortowanie
  const filteredAndSortedRezerwacje = (() => {
    const now = new Date(); // Aktualny czas

    let filtered = rezerwacje.filter(r => {
      // Wyszukiwanie
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm.trim() || (
        (r.salaNumer && r.salaNumer.toString().includes(searchTerm)) ||
        (r.salaBudynek && r.salaBudynek.toLowerCase().includes(searchLower)) ||
        (r.stanowiskoNazwa && r.stanowiskoNazwa.toLowerCase().includes(searchLower)) ||
        (r.opis && r.opis.toLowerCase().includes(searchLower)) ||
        new Date(r.dataStart).toLocaleDateString('pl-PL').includes(searchTerm) ||
        new Date(r.dataKoniec).toLocaleDateString('pl-PL').includes(searchTerm) ||
        // Formaty sal
        (r.salaNumer && `sala ${r.salaNumer}`.toLowerCase().includes(searchLower)) ||
        (r.salaNumer && r.salaBudynek && `${r.salaBudynek}${r.salaNumer}`.toLowerCase().includes(searchLower)) ||
        (r.salaNumer && r.salaBudynek && `${r.salaBudynek} ${r.salaNumer}`.toLowerCase().includes(searchLower))
      );

      // Filtr statusu
      const matchesStatus = statusFilter === '' || r.status === statusFilter;

      // Filtr typu (sala/stanowisko)
      const matchesType = typeFilter === '' ||
        (typeFilter === 'sala' && !r.stanowiskoNazwa) ||
        (typeFilter === 'stanowisko' && r.stanowiskoNazwa);

      // Filtr zakończonych - porównaj z aktualnym czasem, nie z końcem dnia
      const isCompleted = new Date(r.dataKoniec) < now;
      const matchesCompleted = showCompleted || !isCompleted;

      return matchesSearch && matchesStatus && matchesType && matchesCompleted;
    });

    // Sortowanie
    switch (sortBy) {
      case 'newest':
        return [...filtered].sort((a, b) => new Date(b.dataUtworzenia).getTime() - new Date(a.dataUtworzenia).getTime());
      case 'oldest':
        return [...filtered].sort((a, b) => new Date(a.dataUtworzenia).getTime() - new Date(b.dataUtworzenia).getTime());
      case 'date-asc':
        return [...filtered].sort((a, b) => new Date(a.dataStart).getTime() - new Date(b.dataStart).getTime());
      case 'date-desc':
        return [...filtered].sort((a, b) => new Date(b.dataStart).getTime() - new Date(a.dataStart).getTime());
      default:
        return filtered;
    }
  })();

  // Paginacja
  const totalPages = Math.ceil(filteredAndSortedRezerwacje.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRezerwacje = filteredAndSortedRezerwacje.slice(startIndex, startIndex + itemsPerPage);

  // Reset strony przy zmianie filtrów
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, showCompleted, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'zaakceptowano': return 'bg-green-100 text-green-800';
      case 'oczekujące': return 'bg-yellow-100 text-yellow-800';
      case 'odrzucono': return 'bg-red-100 text-red-800';
      case 'anulowane': return 'bg-gray-100 text-gray-800';
      case 'po terminie': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'zaakceptowano': return '✅';
      case 'oczekujące': return '⏳';
      case 'odrzucono': return '❌';
      case 'anulowane': return '🚫';
      case 'po terminie': return '⏰';
      default: return '❓';
    }
  };

  const stats = {
    wszystkie: rezerwacje.length,
    oczekujace: rezerwacje.filter(r => r.status === 'oczekujące').length,
    zaakceptowane: rezerwacje.filter(r => r.status === 'zaakceptowano').length,
    odrzucone: rezerwacje.filter(r => r.status === 'odrzucono').length,
    anulowane: rezerwacje.filter(r => r.status === 'anulowane').length,
    poTerminie: rezerwacje.filter(r => r.status === 'po terminie').length
  };

  const shouldShowLoading = useMinimumLoadingDelay(loading, {
    minimumDelay: 300,
    minimumDuration: 500
  });

  if (shouldShowLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Wyszukiwanie */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Wyszukaj rezerwację</label>
          <input
            type="text"
            placeholder="Sala, stanowisko, opis, daty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
          />
        </div>

        {/* Kontrolki sortowania i filtrowania */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Lewy róg - Typ */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Typ:</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-white"
            >
              <option value="">📋 Wszystkie</option>
              <option value="sala">🏢 Sale</option>
              <option value="stanowisko">🖥️ Stanowiska</option>
            </select>
          </div>

          {/* Środek - Pokaż zakończone */}
          <div className="flex justify-center">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="text-gray-700">Pokaż zakończone</span>
            </label>
          </div>

          {/* Prawy róg - Sortuj według */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Sortuj według:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-white"
            >
              <option value="newest">Data utworzenia ↓</option>
              <option value="oldest">Data utworzenia ↑</option>
              <option value="date-desc">Data rezerwacji ↓</option>
              <option value="date-asc">Data rezerwacji ↑</option>
            </select>
          </div>
        </div>

        {/* Kafelki filtrów statusów */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => setStatusFilter('')}
            className={`p-4 rounded-lg text-center border-2 transition-all ${statusFilter === ''
              ? 'border-neutral-500 bg-neutral-500 text-white shadow-md'
              : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100'
              }`}
          >
            <div className="text-xl font-bold">{stats.wszystkie}</div>
            <div className="text-xs mt-1">Wszystkie</div>
          </button>

          <button
            onClick={() => setStatusFilter('oczekujące')}
            className={`p-4 rounded-lg text-center border-2 transition-all ${statusFilter === 'oczekujące'
              ? 'border-yellow-500 bg-yellow-500 text-white shadow-md'
              : 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:border-yellow-300 hover:bg-yellow-100'
              }`}
          >
            <div className="text-xl font-bold">{stats.oczekujace}</div>
            <div className="text-xs mt-1">Oczekujące</div>
          </button>

          <button
            onClick={() => setStatusFilter('zaakceptowano')}
            className={`p-4 rounded-lg text-center border-2 transition-all ${statusFilter === 'zaakceptowano'
              ? 'border-green-500 bg-green-500 text-white shadow-md'
              : 'border-green-200 bg-green-50 text-green-700 hover:border-green-300 hover:bg-green-100'
              }`}
          >
            <div className="text-xl font-bold">{stats.zaakceptowane}</div>
            <div className="text-xs mt-1">Zaakceptowane</div>
          </button>

          <button
            onClick={() => setStatusFilter('odrzucono')}
            className={`p-4 rounded-lg text-center border-2 transition-all ${statusFilter === 'odrzucono'
              ? 'border-red-500 bg-red-500 text-white shadow-md'
              : 'border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100'
              }`}
          >
            <div className="text-xl font-bold">{stats.odrzucone}</div>
            <div className="text-xs mt-1">Odrzucone</div>
          </button>

          <button
            onClick={() => setStatusFilter('anulowane')}
            className={`p-4 rounded-lg text-center border-2 transition-all ${statusFilter === 'anulowane'
              ? 'border-gray-500 bg-gray-500 text-white shadow-md'
              : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-gray-100'
              }`}
          >
            <div className="text-xl font-bold">{stats.anulowane}</div>
            <div className="text-xs mt-1">Anulowane</div>
          </button>

          <button
            onClick={() => {
              setStatusFilter('po terminie');
              setShowCompleted(true);
            }}
            className={`p-4 rounded-lg text-center border-2 transition-all ${statusFilter === 'po terminie'
              ? 'border-orange-500 bg-orange-500 text-white shadow-md'
              : 'border-orange-200 bg-orange-50 text-orange-700 hover:border-orange-300 hover:bg-orange-100'
              }`}
          >
            <div className="text-xl font-bold">{stats.poTerminie}</div>
            <div className="text-xs mt-1">Po terminie</div>
          </button>
        </div>
      </div>

      {/* Lista rezerwacji */}
      {filteredAndSortedRezerwacje.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {rezerwacje.length === 0 ? 'Brak rezerwacji' : 'Brak wyników'}
          </h2>
          <p className="text-gray-600">
            {rezerwacje.length === 0
              ? 'Nie masz jeszcze żadnych rezerwacji w systemie.'
              : 'Zmień kryteria wyszukiwania lub filtry aby zobaczyć rezerwacje.'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="space-y-4">
              {paginatedRezerwacje.map((rezerwacja) => (
                <div key={rezerwacja.id} className={`border rounded-lg p-3 sm:p-4 hover:shadow-sm transition-shadow ${rezerwacja.stanowiskoId
                  ? 'border-blue-200 bg-blue-50/30' // Stanowisko - niebieskie tło
                  : 'border-green-200 bg-green-50/30' // Sala - zielone tło
                  }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header - różny layout dla mobile i desktop */}
                      <div className="mb-4">
                        {/* Mobile Layout */}
                        <div className="block sm:hidden">
                          <div className="text-center mb-3">
                            <span className="text-2xl mb-2 block">
                              {getStatusIcon(rezerwacja.status)}
                            </span>
                            {rezerwacja.stanowiskoId ? (
                              <div className="space-y-1">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                  🖥️ STANOWISKO
                                </span>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {rezerwacja.stanowiskoNazwa}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  sala {rezerwacja.salaNumer} - {rezerwacja.salaBudynek}
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                  🏢 SALA
                                </span>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  Sala {rezerwacja.salaNumer} - {rezerwacja.salaBudynek}
                                </h3>
                              </div>
                            )}
                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(rezerwacja.status)}`}>
                              {rezerwacja.status}
                            </span>
                          </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden sm:flex sm:justify-between sm:items-start">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">
                              {getStatusIcon(rezerwacja.status)}
                            </span>
                            {rezerwacja.stanowiskoId ? (
                              <div className="flex items-center space-x-2">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
                                  🖥️ STANOWISKO
                                </span>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {rezerwacja.stanowiskoNazwa}
                                </h3>
                                <span className="text-sm text-gray-600">
                                  (sala {rezerwacja.salaNumer} - {rezerwacja.salaBudynek})
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium">
                                  🏢 SALA
                                </span>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  Sala {rezerwacja.salaNumer} - {rezerwacja.salaBudynek}
                                </h3>
                              </div>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(rezerwacja.status)}`}>
                            {rezerwacja.status}
                          </span>
                        </div>
                      </div>

                      {/* Details - różny layout dla mobile i desktop */}
                      <div className="mb-3">
                        {/* Mobile Layout - wyśrodkowane karty */}
                        <div className="block sm:hidden space-y-3">
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Data</div>
                            <div className="font-semibold text-gray-900">
                              {new Date(rezerwacja.dataStart).toLocaleDateString('pl-PL')}
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Godziny</div>
                            <div className="font-semibold text-gray-900">
                              {new Date(rezerwacja.dataStart).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })} - {new Date(rezerwacja.dataKoniec).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Utworzono</div>
                            <div className="font-semibold text-gray-900">
                              {new Date(rezerwacja.dataUtworzenia).toLocaleDateString('pl-PL')}
                            </div>
                          </div>
                          {/* Przycisk anulowania na mobile */}
                          {(rezerwacja.status === 'oczekujące' || rezerwacja.status === 'zaakceptowano') && (
                            <div className="text-center pt-2">
                              <button
                                onClick={() => handleCancelReservation(rezerwacja.id)}
                                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                              >
                                🗑️ Anuluj rezerwację
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Desktop Layout - grid */}
                        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 items-center">
                          <div>
                            <span className="font-medium">Data:</span> {new Date(rezerwacja.dataStart).toLocaleDateString('pl-PL')}
                          </div>
                          <div>
                            <span className="font-medium">Godziny:</span> {new Date(rezerwacja.dataStart).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })} - {new Date(rezerwacja.dataKoniec).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div>
                            <span className="font-medium">Utworzono:</span> {new Date(rezerwacja.dataUtworzenia).toLocaleDateString('pl-PL')}
                          </div>
                          <div className="flex justify-end">
                            {(rezerwacja.status === 'oczekujące' || rezerwacja.status === 'zaakceptowano') ? (
                              <button
                                onClick={() => handleCancelReservation(rezerwacja.id)}
                                className="px-3 py-2 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                              >
                                🗑️ Anuluj
                              </button>
                            ) : (
                              <div></div>
                            )}
                          </div>
                        </div>
                      </div>

                      {rezerwacja.opis && (
                        <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                          <span className="font-medium">Opis:</span> {rezerwacja.opis}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Paginacja */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-neutral-600">
                  Wyświetlanie {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedRezerwacje.length)} z {filteredAndSortedRezerwacje.length} rezerwacji
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-neutral-300 rounded text-sm bg-white hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Poprzednia
                  </button>

                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 7) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 4) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNumber = totalPages - 6 + i;
                    } else {
                      pageNumber = currentPage - 3 + i;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-3 py-1 border rounded text-sm ${currentPage === pageNumber
                          ? 'border-red-500 bg-red-500 text-white'
                          : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
                          }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-neutral-300 rounded text-sm bg-white hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Następna
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}