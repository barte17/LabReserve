import React, { useState, useEffect } from 'react';
import { fetchMojeRezerwacje, updateStatusRezerwacji } from '../../../../services/rezerwacjaService';
import { useToastContext } from '../../../ToastProvider';

interface Rezerwacja {
  id: number;
  dataStart: string;
  dataKoniec: string;
  opis: string;
  status: string;
  dataUtworzenia: string;
  uzytkownikEmail: string;
  uzytkownikImie: string;
  uzytkownikNazwisko: string;
  salaId?: number;
  salaNumer?: number;
  salaBudynek?: string;
  stanowiskoId?: number;
  stanowiskoNazwa?: string;
  stanowiskoSala?: string;
}

interface ZarzadzajRezerwacjeProps {
  autoFilter?: string;
  onAutoFilterProcessed?: () => void;
}

export default function ZarzadzajRezerwacje({ autoFilter, onAutoFilterProcessed }: ZarzadzajRezerwacjeProps) {
  const [rezerwacje, setRezerwacje] = useState<Rezerwacja[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('wszystkie');
  const [sortBy, setSortBy] = useState<string>('najnowsze');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { showSuccess, showError } = useToastContext();

  useEffect(() => {
    loadRezerwacje();
  }, []);

  // Obsłuż automatyczny filtr z zewnątrz
  useEffect(() => {
    if (autoFilter) {
      setFilter(autoFilter);
      // poinformuj parenta, że przetworzono
      onAutoFilterProcessed && onAutoFilterProcessed();
    }
  }, [autoFilter]);

  const loadRezerwacje = async () => {
    try {
      setLoading(true);
      const data = await fetchMojeRezerwacje();
      setRezerwacje(data);
    } catch (error) {
      console.error('Błąd pobierania rezerwacji:', error);
      showError('Błąd pobierania rezerwacji');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await updateStatusRezerwacji(id, newStatus);
      
      // Aktualizuj lokalnie
      setRezerwacje(prev => prev.map(r => 
        r.id === id ? { ...r, status: newStatus } : r
      ));
      
      showSuccess(`Status rezerwacji został zmieniony na: ${newStatus}`);
    } catch (error) {
      console.error('Błąd zmiany statusu:', error);
      showError('Błąd podczas zmiany statusu rezerwacji');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'oczekujące': return 'bg-yellow-100 text-yellow-800';
      case 'zaakceptowano': return 'bg-green-100 text-green-800';
      case 'odrzucono': return 'bg-red-100 text-red-800';
      case 'anulowane': return 'bg-gray-100 text-gray-800';
      case 'po terminie': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'oczekujące': return '⏳';
      case 'zaakceptowano': return '✅';
      case 'odrzucono': return '❌';
      case 'anulowane': return '🚫';
      case 'po terminie': return '⏰';
      default: return '❓';
    }
  };

  // Filtrowanie i sortowanie rezerwacji (podobne do RezerwacjeList)
  const filteredAndSortedRezerwacje = (() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // koniec dnia
    
    // 1. Filtrowanie
    let filtered = rezerwacje.filter(r => {
      // Filtr statusu
      const matchesStatus = filter === 'wszystkie' || r.status === filter;
      
      // Wyszukiwanie - dodane bezpieczne sprawdzenie
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm.trim() || (
        (r.uzytkownikImie && r.uzytkownikImie.toLowerCase().includes(searchLower)) ||
        (r.uzytkownikNazwisko && r.uzytkownikNazwisko.toLowerCase().includes(searchLower)) ||
        (r.uzytkownikEmail && r.uzytkownikEmail.toLowerCase().includes(searchLower)) ||
        (r.opis && r.opis.toLowerCase().includes(searchLower)) ||
        new Date(r.dataStart).toLocaleDateString('pl-PL').includes(searchTerm) ||
        new Date(r.dataKoniec).toLocaleDateString('pl-PL').includes(searchTerm) ||
        new Date(r.dataUtworzenia).toLocaleDateString('pl-PL').includes(searchTerm) ||
        (r.salaNumer && r.salaNumer.toString().includes(searchTerm)) ||
        (r.salaBudynek && r.salaBudynek.toLowerCase().includes(searchLower)) ||
        // Wyszukiwanie sali w różnych formatach
        (r.salaNumer && `sala ${r.salaNumer}`.toLowerCase().includes(searchLower)) ||
        (r.salaNumer && r.salaBudynek && `sala ${r.salaNumer}`.toLowerCase().includes(searchLower)) ||
        (r.salaNumer && r.salaBudynek && `${r.salaBudynek}${r.salaNumer}`.toLowerCase().includes(searchLower)) ||
        (r.salaNumer && r.salaBudynek && `${r.salaBudynek} ${r.salaNumer}`.toLowerCase().includes(searchLower)) ||
        (r.stanowiskoNazwa && r.stanowiskoNazwa.toLowerCase().includes(searchLower)) ||
        // Dodatkowe wyszukiwanie - pełne imię i nazwisko razem
        (r.uzytkownikImie && r.uzytkownikNazwisko && 
         `${r.uzytkownikImie} ${r.uzytkownikNazwisko}`.toLowerCase().includes(searchLower)) ||
        (r.uzytkownikImie && r.uzytkownikNazwisko && 
         `${r.uzytkownikNazwisko} ${r.uzytkownikImie}`.toLowerCase().includes(searchLower))
      );
      
      // Filtr zakończonych rezerwacji
      const isCompleted = new Date(r.dataKoniec) < today;
      const matchesCompleted = showCompleted || !isCompleted;
      
      return matchesStatus && matchesSearch && matchesCompleted;
    });

    // 2. Sortowanie
    switch (sortBy) {
      case 'najnowsze':
        return [...filtered].sort((a, b) => new Date(b.dataUtworzenia).getTime() - new Date(a.dataUtworzenia).getTime());
      case 'najstarsze':
        return [...filtered].sort((a, b) => new Date(a.dataUtworzenia).getTime() - new Date(b.dataUtworzenia).getTime());
      case 'data-rezerwacji':
        return [...filtered].sort((a, b) => new Date(a.dataStart).getTime() - new Date(b.dataStart).getTime());
      case 'nearest':
        return [...filtered]
          .filter(r => new Date(r.dataKoniec) >= today) // tylko aktywne
          .sort((a, b) => new Date(a.dataStart).getTime() - new Date(b.dataStart).getTime());
      default:
        return filtered;
    }
  })();

  // Paginacja
  const totalPages = Math.ceil(filteredAndSortedRezerwacje.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRezerwacje = filteredAndSortedRezerwacje.slice(startIndex, startIndex + itemsPerPage);

  // Reset strony gdy zmienia się filtr lub sortowanie
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter, showCompleted, sortBy]);

  const stats = {
    wszystkie: rezerwacje.length,
    oczekujace: rezerwacje.filter(r => r.status === 'oczekujące').length,
    zaakceptowane: rezerwacje.filter(r => r.status === 'zaakceptowano').length,
    odrzucone: rezerwacje.filter(r => r.status === 'odrzucono').length,
    poTerminie: rezerwacje.filter(r => r.status === 'po terminie').length
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

        {/* Wyszukiwanie */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Wyszukaj rezerwację</label>
          <input
            type="text"
            placeholder="Użytkownik, email, opis, sala, stanowisko, daty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
          />
        </div>

        {/* Kontrolki sortowania i filtrowania */}
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <span className="text-gray-700">Pokaż zakończone</span>
          </label>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Sortuj według:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-white"
            >
              <option value="najnowsze">Data utworzenia ↓</option>
              <option value="najstarsze">Data utworzenia ↑</option>
              <option value="data-rezerwacji">Data rezerwacji</option>
              <option value="nearest">Najbliższe rezerwacje</option>
            </select>
          </div>
        </div>

        {/* Kafelki filtrów statusów */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => setFilter('wszystkie')}
            className={`p-4 rounded-lg text-center border-2 transition-all ${
              filter === 'wszystkie'
                ? 'border-neutral-500 bg-neutral-500 text-white shadow-md'
                : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100'
            }`}
          >
            <div className="text-xl font-bold">{stats.wszystkie}</div>
            <div className="text-xs mt-1">Wszystkie</div>
          </button>
          
          <button
            onClick={() => setFilter('oczekujące')}
            className={`p-4 rounded-lg text-center border-2 transition-all ${
              filter === 'oczekujące'
                ? 'border-yellow-500 bg-yellow-500 text-white shadow-md'
                : 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:border-yellow-300 hover:bg-yellow-100'
            }`}
          >
            <div className="text-xl font-bold">{stats.oczekujace}</div>
            <div className="text-xs mt-1">Oczekujące</div>
          </button>
          
          <button
            onClick={() => setFilter('zaakceptowano')}
            className={`p-4 rounded-lg text-center border-2 transition-all ${
              filter === 'zaakceptowano'
                ? 'border-green-500 bg-green-500 text-white shadow-md'
                : 'border-green-200 bg-green-50 text-green-700 hover:border-green-300 hover:bg-green-100'
            }`}
          >
            <div className="text-xl font-bold">{stats.zaakceptowane}</div>
            <div className="text-xs mt-1">Zaakceptowane</div>
          </button>
          
          <button
            onClick={() => setFilter('odrzucono')}
            className={`p-4 rounded-lg text-center border-2 transition-all ${
              filter === 'odrzucono'
                ? 'border-red-500 bg-red-500 text-white shadow-md'
                : 'border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100'
            }`}
          >
            <div className="text-xl font-bold">{stats.odrzucone}</div>
            <div className="text-xs mt-1">Odrzucone</div>
          </button>

          <button
            onClick={() => setFilter('anulowane')}
            className={`p-4 rounded-lg text-center border-2 transition-all ${
              filter === 'anulowane'
                ? 'border-gray-500 bg-gray-500 text-white shadow-md'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-gray-100'
            }`}
          >
            <div className="text-xl font-bold">{rezerwacje.filter(r => r.status === 'anulowane').length}</div>
            <div className="text-xs mt-1">Anulowane</div>
          </button>

          <button
            onClick={() => {
              setFilter('po terminie');
              setShowCompleted(true);
            }}
            className={`p-4 rounded-lg text-center border-2 transition-all ${
              filter === 'po terminie'
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
              ? 'Nie ma jeszcze żadnych rezerwacji dla Twoich sal.'
              : 'Zmień kryteria wyszukiwania lub filtry aby zobaczyć rezerwacje.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedRezerwacje.map((rezerwacja) => (
            <div key={rezerwacja.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {rezerwacja.salaId 
                        ? `Sala ${rezerwacja.salaNumer} - ${rezerwacja.salaBudynek}`
                        : `${rezerwacja.stanowiskoNazwa} (${rezerwacja.stanowiskoSala})`
                      }
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(rezerwacja.status)}`}>
                      {getStatusIcon(rezerwacja.status)} {rezerwacja.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>👤 <strong>Użytkownik:</strong> {rezerwacja.uzytkownikImie} {rezerwacja.uzytkownikNazwisko} ({rezerwacja.uzytkownikEmail})</p>
                    <p>📅 <strong>Data:</strong> {new Date(rezerwacja.dataStart).toLocaleDateString('pl-PL')} 
                       {' '}({new Date(rezerwacja.dataStart).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })} - 
                       {new Date(rezerwacja.dataKoniec).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })})</p>
                    <p>🕒 <strong>Zgłoszono:</strong> {new Date(rezerwacja.dataUtworzenia).toLocaleString('pl-PL')}</p>
                    {rezerwacja.opis && <p>📝 <strong>Opis:</strong> {rezerwacja.opis}</p>}
                  </div>
                </div>
              </div>

              {rezerwacja.status === 'oczekujące' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleStatusChange(rezerwacja.id, 'zaakceptowano')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    ✅ Zatwierdź
                  </button>
                  <button
                    onClick={() => handleStatusChange(rezerwacja.id, 'odrzucono')}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    ❌ Odrzuć
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Paginacja */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
                    className={`px-3 py-1 border rounded text-sm ${
                      currentPage === pageNumber
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
  );
}