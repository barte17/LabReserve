import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRooms } from "../services/api";
import { LoadingRoomCard } from "../components/LoadingStates";
import { useMinimumLoadingDelay } from "../hooks/useMinimumLoadingDelay";

type Sala = {
  id: number;
  numer: number;
  budynek: string;
  maxOsob: number | null;
  maStanowiska: boolean | null;
  czynnaOd: string | null; 
  czynnaDo: string | null;
  opis: string | null;
  idOpiekuna: string | null;
};

export default function Sale() {
  const navigate = useNavigate();
  const [sale, setSale] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBudynek, setFilterBudynek] = useState("");

  useEffect(() => {
    document.title = "Sale - System Rezerwacji";
    getRooms()
      .then(setSale)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Filtrowanie sal
  const filteredSale = sale.filter(sala => {
    const matchesSearch = sala.numer.toString().includes(searchTerm) || 
                         sala.budynek.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBudynek = filterBudynek === "" || sala.budynek === filterBudynek;
    return matchesSearch && matchesBudynek;
  });

  // Unikalne budynki do filtra
  const uniqueBudynki = [...new Set(sale.map(sala => sala.budynek))];

  const shouldShowLoading = useMinimumLoadingDelay(loading, {
    minimumDelay: 200, // Pokaż loading tylko jeśli ładowanie trwa dłużej niż 200ms
    minimumDuration: 600 // Jeśli już się pokazał, trzymaj minimum 600ms
  });

  if (shouldShowLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-300 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-80 animate-pulse"></div>
          </div>

          {/* Filtry skeleton */}
          <div className="filters-panel mb-8">
            <div className="filters-grid">
              <div className="form-group">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="form-group">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Statystyki skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="card-body text-center">
                  <div className="h-8 bg-gray-300 rounded w-12 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Karty sal skeleton */}
          <LoadingRoomCard count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Filtry */}
        <div className="filters-panel mb-8">
          <div className="filters-grid">
            <div className="form-group">
              <label className="form-label">Wyszukaj salę</label>
              <input
                type="text"
                placeholder="Numer sali lub nazwa budynku..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Filtruj po budynku</label>
              <select
                value={filterBudynek}
                onChange={(e) => setFilterBudynek(e.target.value)}
                className="form-input"
              >
                <option value="">Wszystkie budynki</option>
                {uniqueBudynki.map(budynek => (
                  <option key={budynek} value={budynek}>{budynek}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Statystyki */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <div className="card-body text-center">
              <div className="text-2xl font-bold text-primary-600 mb-1">
                {filteredSale.length}
              </div>
              <div className="text-sm text-neutral-600">
                Liczba sal
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {filteredSale.filter(s => s.maStanowiska).length}
              </div>
              <div className="text-sm text-neutral-600">
                Liczba sal z stanowiskami
              </div>
            </div>
          </div>
        </div>

        {/* Lista sal */}
        {filteredSale.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <svg className="h-16 w-16 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                Brak sal do wyświetlenia
              </h3>
              <p className="text-neutral-600">
                Spróbuj zmienić kryteria wyszukiwania lub filtry.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSale.map((sala) => (
              <div key={sala.id} className="list-item animate-in">
                {/* Zdjęcie sali */}
                <div className="mb-4">
                  <div className="w-full h-48 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <div className="text-center text-primary-600">
                      <svg className="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <p className="text-sm font-medium">Sala: {sala.numer}</p>
                      <p className="text-xs opacity-75">Budynek {sala.budynek}</p>
                    </div>
                  </div>
                </div>

                <div className="list-item-header">
                  <div>
                    <h3 className="list-item-title">
                      Sala {sala.numer}
                    </h3>
                    <p className="list-item-subtitle">
                      Budynek: {sala.budynek}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {sala.maStanowiska && (
                      <span className="badge badge-info">
                        Z laboratoriami
                      </span>
                    )}
                  </div>
                </div>

                <div className="list-item-content">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-neutral-700">Pojemność:</span>
                      <span className="text-neutral-600 ml-2">
                        {sala.maxOsob ? `${sala.maxOsob} osób` : "Brak danych"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-neutral-700">Godziny:</span>
                      <span className="text-neutral-600 ml-2">
                        {sala.czynnaOd && sala.czynnaDo 
                          ? `${sala.czynnaOd} - ${sala.czynnaDo}`
                          : "Brak danych"
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <span className="font-medium text-neutral-700">Opis:</span>
                    <p className="text-neutral-600 mt-1">
                      {sala.opis || "brak"}
                    </p>
                  </div>
                </div>

                <div className="list-item-actions">
                  <button 
                    onClick={() => navigate(`/reservation?salaId=${sala.id}&name=Sala ${sala.numer} (${sala.budynek})`)}
                    className="btn btn-primary btn-sm"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Zarezerwuj
                  </button>
                  <button 
                    onClick={() => navigate(`/sala/${sala.id}`)}
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
