import { useEffect, useState } from "react";
import { fetchRezerwacje, updateStatus, deleteRezerwacja, cancelReservation, type RezerwacjaDetailsDto } from "../services/rezerwacjaService";
import { LoadingTable } from "./LoadingStates";
import { useMinimumLoadingDelay } from "../hooks/useMinimumLoadingDelay";

interface RezerwacjeListProps {
  autoFilter?: string;
  onAutoFilterProcessed?: () => void;
}

export default function RezerwacjeList({ autoFilter, onAutoFilterProcessed }: RezerwacjeListProps = {}) {
  const [rezerwacje, setRezerwacje] = useState<RezerwacjaDetailsDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchRezerwacje()
      .then(setRezerwacje)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Obsłuż automatyczny filtr z zewnątrz
  useEffect(() => {
    if (autoFilter) {
      setStatusFilter(autoFilter);
      // poinformuj parenta, że przetworzono
      onAutoFilterProcessed && onAutoFilterProcessed();
    }
  }, [autoFilter]);

  const [error, setError] = useState<string>("");

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await updateStatus(id, newStatus);
      setRezerwacje(prev => 
        prev.map(rez => rez.id === id ? { ...rez, status: newStatus } : rez)
      );
      setError("");
    } catch (error) {
      console.error("Błąd podczas zmiany statusu:", error);
      setError("Nie udało się zmienić statusu rezerwacji");
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm("Czy na pewno chcesz anulować tę rezerwację?")) return;
    
    try {
      await cancelReservation(id);
      setRezerwacje(prev => 
        prev.map(rez => rez.id === id ? { ...rez, status: "anulowane" } : rez)
      );
      setError("");
    } catch (error) {
      console.error("Błąd podczas anulowania:", error);
      setError("Nie udało się anulować rezerwacji");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Czy na pewno chcesz PERMANENTNIE usunąć tę rezerwację? Ta operacja jest nieodwracalna!")) return;
    
    try {
      await deleteRezerwacja(id);
      setRezerwacje(prev => prev.filter(rez => rez.id !== id));
      setError("");
    } catch (error) {
      console.error("Błąd podczas usuwania:", error);
      setError("Nie udało się usunąć rezerwacji");
    }
  };

  // Filtrowanie i sortowanie rezerwacji
  const filteredAndSortedRezerwacje = (() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // koniec dnia
    
    // 1. Filtrowanie
    let filtered = rezerwacje.filter(rez => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        rez.id.toString().includes(searchTerm) ||
        rez.uzytkownikId.toLowerCase().includes(searchLower) ||
        rez.status.toLowerCase().includes(searchLower) ||
        (rez.opis && rez.opis.toLowerCase().includes(searchLower)) ||
        new Date(rez.dataStart).toLocaleDateString('pl-PL').includes(searchTerm) ||
        new Date(rez.dataKoniec).toLocaleDateString('pl-PL').includes(searchTerm) ||
        new Date(rez.dataUtworzenia).toLocaleDateString('pl-PL').includes(searchTerm);
      
      const matchesStatus = statusFilter === "" || rez.status === statusFilter;
      
      // Filtr zakończonych rezerwacji
      const isCompleted = new Date(rez.dataKoniec) < today;
      const matchesCompleted = showCompleted || !isCompleted;
      
      return matchesSearch && matchesStatus && matchesCompleted;
    });

    // 2. Sortowanie
    switch (sortBy) {
      case 'created-desc':
        return [...filtered].sort((a, b) => new Date(b.dataUtworzenia).getTime() - new Date(a.dataUtworzenia).getTime());
      case 'created-asc':
        return [...filtered].sort((a, b) => new Date(a.dataUtworzenia).getTime() - new Date(b.dataUtworzenia).getTime());
      case 'nearest':
        return [...filtered]
          .filter(rez => new Date(rez.dataKoniec) >= today) // tylko aktywne
          .sort((a, b) => new Date(a.dataStart).getTime() - new Date(b.dataStart).getTime());
      default:
        return filtered; // domyślna kolejność z API
    }
  })();

  // Paginacja
  const totalPages = Math.ceil(filteredAndSortedRezerwacje.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRezerwacje = filteredAndSortedRezerwacje.slice(startIndex, startIndex + itemsPerPage);

  // Reset strony gdy zmienia się filtr lub sortowanie
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, showCompleted, sortBy]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'zaakceptowano':
        return 'badge badge-success';
      case 'oczekujące':
        return 'badge badge-warning';
      case 'odrzucono':
        return 'badge badge-danger';
      default:
        return 'badge badge-neutral';
    }
  };

  const shouldShowLoading = useMinimumLoadingDelay(loading, {
    minimumDelay: 200,
    minimumDuration: 500
  });

  if (shouldShowLoading) {
    return <LoadingTable rows={6} columns={5} className="mt-6" />;
  }

  return (
    <div>

      {/* Wyszukiwanie */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Wyszukaj rezerwację</label>
        <input
          type="text"
          placeholder="ID, użytkownik, status, opis, daty..."
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
            <option value="default">Domyślnie</option>
            <option value="created-desc">Data utworzenia ↓</option>
            <option value="created-asc">Data utworzenia ↑</option>
            <option value="nearest">Najbliższe rezerwacje</option>
          </select>
        </div>
      </div>

      {/* Interaktywne filtry statusów */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <button
          onClick={() => setStatusFilter("")}
          className={`card transition-all duration-200 hover:shadow-lg ${
            statusFilter === "" ? "ring-2 ring-primary-500 bg-primary-50" : "hover:bg-neutral-50"
          }`}
        >
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {rezerwacje.length}
            </div>
            <div className="text-sm text-neutral-600">
              Wszystkie
            </div>
          </div>
        </button>
        
        <button
          onClick={() => setStatusFilter("oczekujące")}
          className={`card transition-all duration-200 hover:shadow-lg ${
            statusFilter === "oczekujące" ? "ring-2 ring-yellow-500 bg-yellow-50" : "hover:bg-neutral-50"
          }`}
        >
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {rezerwacje.filter(r => r.status === 'oczekujące').length}
            </div>
            <div className="text-sm text-neutral-600">
              Oczekujące
            </div>
          </div>
        </button>
        
        <button
          onClick={() => setStatusFilter("zaakceptowano")}
          className={`card transition-all duration-200 hover:shadow-lg ${
            statusFilter === "zaakceptowano" ? "ring-2 ring-green-500 bg-green-50" : "hover:bg-neutral-50"
          }`}
        >
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {rezerwacje.filter(r => r.status === 'zaakceptowano').length}
            </div>
            <div className="text-sm text-neutral-600">
              Zaakceptowane
            </div>
          </div>
        </button>
        
        <button
          onClick={() => setStatusFilter("odrzucono")}
          className={`card transition-all duration-200 hover:shadow-lg ${
            statusFilter === "odrzucono" ? "ring-2 ring-red-500 bg-red-50" : "hover:bg-neutral-50"
          }`}
        >
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {rezerwacje.filter(r => r.status === 'odrzucono').length}
            </div>
            <div className="text-sm text-neutral-600">
              Odrzucone
            </div>
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("anulowane")}
          className={`card transition-all duration-200 hover:shadow-lg ${
            statusFilter === "anulowane" ? "ring-2 ring-gray-500 bg-gray-50" : "hover:bg-neutral-50"
          }`}
        >
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-gray-600 mb-1">
              {rezerwacje.filter(r => r.status === 'anulowane').length}
            </div>
            <div className="text-sm text-neutral-600">
              Anulowane
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            setStatusFilter("po terminie");
            setShowCompleted(true);
          }}
          className={`card transition-all duration-200 hover:shadow-lg ${
            statusFilter === "po terminie" ? "ring-2 ring-orange-500 bg-orange-50" : "hover:bg-neutral-50"
          }`}
        >
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {rezerwacje.filter(r => r.status === 'po terminie').length}
            </div>
            <div className="text-sm text-neutral-600">
              Po terminie
            </div>
          </div>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Lista rezerwacji */}
      {filteredAndSortedRezerwacje.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <svg className="h-16 w-16 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              Brak rezerwacji do wyświetlenia
            </h3>
            <p className="text-neutral-600">
              Spróbuj zmienić kryteria wyszukiwania.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedRezerwacje.map((rez) => (
            <div key={rez.id} className="list-item animate-in">
              <div className="list-item-header">
                <div>
                  <h4 className="list-item-title">
                    Rezerwacja #{rez.id}
                  </h4>
                  <p className="list-item-subtitle">
                    Użytkownik: {rez.uzytkownikId}
                  </p>
                </div>
                <span className={getStatusBadge(rez.status)}>
                  {rez.status}
                </span>
              </div>

              <div className="list-item-content">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-neutral-700">Zasób:</span>
                    <span className="text-neutral-600 ml-2">
                      {rez.salaId ? `Sala ID: ${rez.salaId}` : `Laboratorium ID: ${rez.stanowiskoId}`}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-neutral-700">Data utworzenia:</span>
                    <span className="text-neutral-600 ml-2">
                      {new Date(rez.dataUtworzenia).toLocaleDateString('pl-PL')}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-neutral-700">Od:</span>
                    <span className="text-neutral-600 ml-2">
                      {new Date(rez.dataStart).toLocaleString('pl-PL')}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-neutral-700">Do:</span>
                    <span className="text-neutral-600 ml-2">
                      {new Date(rez.dataKoniec).toLocaleString('pl-PL')}
                    </span>
                  </div>
                </div>
                
                {rez.opis && (
                  <div className="mt-3">
                    <span className="font-medium text-neutral-700">Opis:</span>
                    <p className="text-neutral-600 mt-1">{rez.opis}</p>
                  </div>
                )}
              </div>

              <div className="list-item-actions">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    
                    {/* Anuluj - po lewej stronie, dostępne dla wszystkich */}
                    {rez.status !== 'anulowane' && (
                      <button
                        onClick={() => handleCancel(rez.id)}
                        className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-700 hover:shadow-md border border-gray-200"
                      >
                        🚫 Anuluj
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleStatusChange(rez.id, 'oczekujące')}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                        rez.status === 'oczekujące' 
                          ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-300 shadow-sm' 
                          : 'bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-700 hover:shadow-md border border-gray-200'
                      }`}
                    >
                      ⏳ Oczekujące
                    </button>
                    
                    <button
                      onClick={() => handleStatusChange(rez.id, 'zaakceptowano')}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                        rez.status === 'zaakceptowano' 
                          ? 'bg-green-100 text-green-800 ring-2 ring-green-300 shadow-sm' 
                          : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700 hover:shadow-md border border-gray-200'
                      }`}
                    >
                      ✅ Zaakceptuj
                    </button>
                    
                    <button
                      onClick={() => handleStatusChange(rez.id, 'odrzucono')}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                        rez.status === 'odrzucono' 
                          ? 'bg-red-100 text-red-800 ring-2 ring-red-300 shadow-sm' 
                          : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700 hover:shadow-md border border-gray-200'
                      }`}
                    >
                      ❌ Odrzuć
                    </button>
                  </div>
                  
                  {/* Usuń TYLKO anulowane rezerwacje - w sekcji statusów */}
                  {rez.status === 'anulowane' && (
                    <button
                      onClick={() => handleDelete(rez.id)}
                      className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800 hover:shadow-md border border-red-200 ml-3"
                      title="Usuń permanentnie (tylko anulowane rezerwacje)"
                    >
                      🗑️ Usuń
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginacja */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-neutral-600">
            Wyświetlanie {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedRezerwacje.length)} z {filteredAndSortedRezerwacje.length} rezerwacji
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Poprzednia
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`btn btn-sm ${
                  currentPage === page 
                    ? 'btn-primary' 
                    : 'btn-secondary'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Następna
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
