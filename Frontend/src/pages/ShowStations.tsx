import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStations } from "../services/api";

type Stanowisko = {
  id: number;
  salaId: number;
  nazwa: string;
  typ: string | null;
  opis: string | null;
};

export default function Stanowiska() {
  const navigate = useNavigate();
  const [stanowiska, setStanowiska] = useState<Stanowisko[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTyp, setFilterTyp] = useState("");

  useEffect(() => {
    document.title = "Stanowiska - System Rezerwacji";
    getStations()
      .then(setStanowiska)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Filtrowanie stanowisk
  const filteredStanowiska = stanowiska.filter(stanowisko => {
    const matchesSearch = stanowisko.nazwa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stanowisko.id.toString().includes(searchTerm);
    const matchesTyp = filterTyp === "" || stanowisko.typ === filterTyp;
    return matchesSearch && matchesTyp;
  });

  // Unikalne typy do filtra
  const uniqueTypy = [...new Set(stanowiska.map(s => s.typ).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-neutral-600">Ładowanie stanowisk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Stanowiska laboratoryjne uczelni
          </h1>
          <p className="text-neutral-600">
            Przeglądaj dostępne wyposażenie sal
          </p>
        </div>

        {/* Filtry */}
        <div className="filters-panel mb-8">
          <div className="filters-grid">
            <div className="form-group">
              <label className="form-label">Wyszukaj stanowisko</label>
              <input
                type="text"
                placeholder="Nazwa lub ID laboratorium..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Filtruj po typie</label>
              <select
                value={filterTyp}
                onChange={(e) => setFilterTyp(e.target.value)}
                className="form-input"
              >
                <option value="">Wszystkie typy</option>
                {uniqueTypy.map(typ => (
                  <option key={typ} value={typ}>{typ}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Statystyki */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="card-body text-center">
              <div className="text-2xl font-bold text-primary-600 mb-1">
                {filteredStanowiska.length}
              </div>
              <div className="text-sm text-neutral-600">
                {filteredStanowiska.length === 1 ? 'Stanowisko' : 'Stanowisk'}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {uniqueTypy.length}
              </div>
              <div className="text-sm text-neutral-600">
                {uniqueTypy.length === 1 ? 'Typ' : 'Typów'}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {[...new Set(stanowiska.map(s => s.salaId))].length}
              </div>
              <div className="text-sm text-neutral-600">
                Sal z stanowiskami
              </div>
            </div>
          </div>
        </div>

        {/* Lista stanowisk */}
        {filteredStanowiska.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <svg className="h-16 w-16 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                Brak laboratoriów do wyświetlenia
              </h3>
              <p className="text-neutral-600">
                Spróbuj zmienić kryteria wyszukiwania lub filtry.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredStanowiska.map((stanowisko) => (
              <div key={stanowisko.id} className="list-item animate-in">
                {/* Zdjęcie stanowiska */}
                <div className="mb-4">
                  <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <div className="text-center text-blue-600">
                      <svg className="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      <p className="text-sm font-medium">Stanowisko: {stanowisko.nazwa}</p>
                      <p className="text-xs opacity-75">Typ: {stanowisko.typ || 'Ogólne'}</p>
                    </div>
                  </div>
                </div>

                <div className="list-item-header">
                  <div>
                    <h3 className="list-item-title">
                      {stanowisko.nazwa}
                    </h3>
                    <p className="list-item-subtitle">
                      ID: {stanowisko.id} • Sala: {stanowisko.salaId}
                    </p>
                  </div>
                  {stanowisko.typ && (
                    <span className="badge badge-info">
                      {stanowisko.typ}
                    </span>
                  )}
                </div>

                <div className="list-item-content">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-neutral-700">Typ:</span>
                      <span className="text-neutral-600 ml-2">
                        {stanowisko.typ || "Nie określono"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-neutral-700">Sala:</span>
                      <span className="text-neutral-600 ml-2">
                        ID {stanowisko.salaId}
                      </span>
                    </div>
                  </div>
                  
                  {stanowisko.opis && (
                    <div className="mt-3">
                      <span className="font-medium text-neutral-700">Opis:</span>
                      <p className="text-neutral-600 mt-1">{stanowisko.opis}</p>
                    </div>
                  )}
                </div>

                <div className="list-item-actions">
                  <button 
                    onClick={() => navigate(`/reservation?stanowiskoId=${stanowisko.id}&name=${stanowisko.nazwa}`)}
                    className="btn btn-primary btn-sm"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Zarezerwuj
                  </button>
                  <button 
                    onClick={() => navigate(`/stanowisko/${stanowisko.id}`)}
                    className="btn btn-secondary btn-sm"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Szczegóły
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
