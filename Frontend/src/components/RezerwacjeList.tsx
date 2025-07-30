import { useEffect, useState } from "react";
import { fetchRezerwacje, updateStatus, deleteRezerwacja } from "../services/rezerwacjaService";

type Rezerwacja = {
  id: number;
  salaId: number | null;
  stanowiskoId: number | null;
  uzytkownikId: string;
  dataStart: string;
  dataKoniec: string;
  dataUtworzenia: string;
  opis?: string;
  status: string;
};

export default function RezerwacjeList() {
  const [rezerwacje, setRezerwacje] = useState<Rezerwacja[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchRezerwacje()
      .then(setRezerwacje)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await updateStatus(id, newStatus);
      setRezerwacje(prev => 
        prev.map(rez => rez.id === id ? { ...rez, status: newStatus } : rez)
      );
    } catch (error) {
      console.error("Błąd podczas zmiany statusu:", error);
      alert("Nie udało się zmienić statusu rezerwacji");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Czy na pewno chcesz usunąć tę rezerwację?")) return;
    
    try {
      await deleteRezerwacja(id);
      setRezerwacje(prev => prev.filter(rez => rez.id !== id));
    } catch (error) {
      console.error("Błąd podczas usuwania:", error);
      alert("Nie udało się usunąć rezerwacji");
    }
  };

  // Filtrowanie rezerwacji
  const filteredRezerwacje = rezerwacje.filter(rez => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      rez.id.toString().includes(searchTerm) ||
      rez.uzytkownikId.toLowerCase().includes(searchLower) ||
      rez.status.toLowerCase().includes(searchLower) ||
      (rez.opis && rez.opis.toLowerCase().includes(searchLower));
    
    const matchesStatus = statusFilter === "" || rez.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-neutral-600">Ładowanie rezerwacji...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-neutral-900 mb-2">
          Rezerwacje Sal i Laboratoriów
        </h3>
        <p className="text-neutral-600">
          Zarządzaj wszystkimi rezerwacjami w systemie
        </p>
      </div>

      {/* Filtry */}
      <div className="filters-panel mb-6">
        <div className="form-group">
          <label className="form-label">Wyszukaj rezerwację</label>
          <input
            type="text"
            placeholder="ID, użytkownik, status, opis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      {/* Interaktywne filtry statusów */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
              Wszystkie rezerwacje
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
      </div>

      {/* Lista rezerwacji */}
      {filteredRezerwacje.length === 0 ? (
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
          {filteredRezerwacje.map((rez) => (
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
                <div className="flex items-center space-x-2">
                  <select
                    value={rez.status}
                    onChange={(e) => handleStatusChange(rez.id, e.target.value)}
                    className="form-input text-sm"
                  >
                    <option value="oczekujące">Oczekujące</option>
                    <option value="zaakceptowano">Zaakceptowano</option>
                    <option value="odrzucono">Odrzucono</option>
                  </select>
                  <button
                    onClick={() => handleDelete(rez.id)}
                    className="btn btn-danger btn-sm"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Usuń
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}