import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStations } from "../services/api";
import { LoadingStationCard } from "../components/LoadingStates";
import { useMinimumLoadingDelay } from "../hooks/useMinimumLoadingDelay";
import { LazyImage } from "../components/LazyImage";

type Stanowisko = {
  id: number;
  salaId: number;
  nazwa: string;
  typ: string | null;
  opis: string | null;
  salaNumer: number;
  salaBudynek: string;
  pierwszeZdjecie: string | null;
};

export default function Stanowiska() {
  const navigate = useNavigate();
  const [stanowiska, setStanowiska] = useState<Stanowisko[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTyp, setFilterTyp] = useState("");
  const [availabilityDate, setAvailabilityDate] = useState("");
  const [availabilityTimeFrom, setAvailabilityTimeFrom] = useState("");
  const [availabilityTimeTo, setAvailabilityTimeTo] = useState("");

  useEffect(() => {
    document.title = "Stanowiska - System Rezerwacji";
    getStations()
      .then(setStanowiska)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Sprawdzanie dostępności (placeholder - w przyszłości API call)
  const isAvailableInTimeSlot = (stanowisko: Stanowisko) => {
    // Jeśli nie ma filtrów czasowych, pokaż wszystkie
    if (!availabilityDate || !availabilityTimeFrom || !availabilityTimeTo) {
      return true;
    }
    
    // TODO: Tutaj będzie wywołanie API do sprawdzenia dostępności
    // return await checkAvailability(stanowisko.id, availabilityDate, availabilityTimeFrom, availabilityTimeTo);
    
    // Tymczasowo zwracam true - w przyszłości prawdziwe sprawdzanie
    return true;
  };

  // Filtrowanie stanowisk
  const filteredStanowiska = stanowiska.filter(stanowisko => {
    const matchesSearch = stanowisko.nazwa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stanowisko.id.toString().includes(searchTerm);
    const matchesTyp = filterTyp === "" || stanowisko.typ === filterTyp;
    const matchesAvailability = isAvailableInTimeSlot(stanowisko);
    
    return matchesSearch && matchesTyp && matchesAvailability;
  });

  // Unikalne typy do filtra
  const uniqueTypy = [...new Set(stanowiska.map(s => s.typ).filter(Boolean))];

  const shouldShowLoading = useMinimumLoadingDelay(loading, {
    minimumDelay: 200,
    minimumDuration: 600
  });

  if (shouldShowLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-300 rounded w-52 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>

          {/* Filtry skeleton */}
          <div className="filters-panel mb-8">
            <div className="filters-grid">
              <div className="form-group">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="form-group">
                <div className="h-4 bg-gray-200 rounded w-28 mb-2 animate-pulse"></div>
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
                  <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Karty stanowisk skeleton */}
          <LoadingStationCard count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        

        {/* Filtry */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Wyszukaj stanowisko
              </label>
              <input
                type="text"
                placeholder="Nazwa stanowiska lub ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Typ stanowiska
              </label>
              <select
                value={filterTyp}
                onChange={(e) => setFilterTyp(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Wszystkie typy</option>
                {uniqueTypy.map(typ => (
                  <option key={typ} value={typ}>{typ}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Filtry dostępności */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Sprawdź dostępność w terminie
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Data</label>
                <input
                  type="date"
                  value={availabilityDate}
                  onChange={(e) => setAvailabilityDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Od godziny</label>
                <input
                  type="time"
                  value={availabilityTimeFrom}
                  onChange={(e) => setAvailabilityTimeFrom(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Do godziny</label>
                <input
                  type="time"
                  value={availabilityTimeTo}
                  onChange={(e) => setAvailabilityTimeTo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            {availabilityDate && availabilityTimeFrom && availabilityTimeTo && (
              <div className="mt-3 text-sm text-green-600 bg-green-50 rounded-lg p-3">
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Filtrowanie stanowisk dostępnych {availabilityDate} od {availabilityTimeFrom} do {availabilityTimeTo}
              </div>
            )}
          </div>
        </div>


        {/* Lista stanowisk */}
        {filteredStanowiska.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Brak stanowisk do wyświetlenia</h3>
            <p className="text-gray-500">Spróbuj zmienić kryteria wyszukiwania lub filtry.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStanowiska.map((stanowisko) => (
              <div key={stanowisko.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex flex-col">
                
                {/* Zdjęcie stanowiska */}
                <div className="h-56 overflow-hidden relative">
                  <LazyImage
                    src={stanowisko.pierwszeZdjecie}
                    alt={stanowisko.nazwa}
                    className="w-full h-full transition-transform duration-300 hover:scale-110"
                    placeholder={
                      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                        <div className="text-center text-blue-600">
                          <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                          <div className="text-lg font-semibold">{stanowisko.nazwa}</div>
                          <div className="text-sm opacity-75">Typ: {stanowisko.typ || 'Ogólne'}</div>
                        </div>
                      </div>
                    }
                  />
                  
                  {/* Badge z typem */}
                  {stanowisko.typ && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                        {stanowisko.typ}
                      </span>
                    </div>
                  )}
                </div>

                {/* Treść karty */}
                <div className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {stanowisko.nazwa}
                      </h3>
                      <p className="text-gray-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Sala {stanowisko.salaNumer} • {stanowisko.salaBudynek}
                      </p>
                    </div>
                  </div>

                  {/* Informacje - flex-grow zapewnia wypełnienie przestrzeni */}
                  <div className="flex-grow">
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span className="font-medium">Typ:</span>
                        <span className="ml-2">{stanowisko.typ || "Ogólne"}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                        <span className="font-medium">ID stanowiska:</span>
                        <span className="ml-2">#{stanowisko.id}</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">Lokalizacja:</span>
                        <span className="ml-2">Sala {stanowisko.salaNumer}, {stanowisko.salaBudynek}</span>
                      </div>
                    </div>

                    {/* Opis */}
                    {stanowisko.opis && (
                      <div className="mb-6">
                        <p 
                          className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: '1.4',
                            maxHeight: 'calc(1.4em * 3)'
                          }}
                        >
                          {stanowisko.opis}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Przyciski - zawsze na dole */}
                  <div className="flex space-x-3 mt-auto">
                    <button 
                      onClick={() => navigate(`/reservation?stanowiskoId=${stanowisko.id}&name=${stanowisko.nazwa}`)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Zarezerwuj
                    </button>
                    <button 
                      onClick={() => navigate(`/stanowisko/${stanowisko.id}`)}
                      className="px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Szczegóły
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
