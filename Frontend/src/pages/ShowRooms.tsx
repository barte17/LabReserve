import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRooms } from "../services/api";
import { LazyImage } from "../components/LazyImage";
import { SkeletonGrid } from "../components/SkeletonLoading";

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
  imieOpiekuna: string | null;
  nazwiskoOpiekuna: string | null;
  pierwszeZdjecie: string | null;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Skeleton dla filtrów */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-12 bg-gray-200 rounded-xl"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-12 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
          
          {/* Skeleton dla kart sal */}
          <SkeletonGrid count={6} type="room" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        

        {/* Filtry */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Wyszukaj salę
              </label>
              <input
                type="text"
                placeholder="Numer sali lub budynek..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Budynek
              </label>
              <select
                value={filterBudynek}
                onChange={(e) => setFilterBudynek(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Wszystkie budynki</option>
                {uniqueBudynki.map(budynek => (
                  <option key={budynek} value={budynek}>{budynek}</option>
                ))}
              </select>
            </div>
          </div>
        </div>


        {/* Lista sal */}
        {filteredSale.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Brak sal do wyświetlenia</h3>
            <p className="text-gray-500">Spróbuj zmienić kryteria wyszukiwania lub filtry.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSale.map((sala) => (
              <div key={sala.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex flex-col">
                
                {/* Zdjęcie sali */}
                <div className="h-56 overflow-hidden relative">
                  <LazyImage
                    src={sala.pierwszeZdjecie}
                    alt={`Sala ${sala.numer}`}
                    className="w-full h-full transition-transform duration-300 hover:scale-110"
                    placeholder={
                      <div className="w-full h-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                        <div className="text-center text-red-600">
                          <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <div className="text-lg font-semibold">Sala {sala.numer}</div>
                          <div className="text-sm opacity-75">Budynek {sala.budynek}</div>
                        </div>
                      </div>
                    }
                  />
                  
                  {/* Badge z laboratoriami */}
                  {sala.maStanowiska && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                        Z laboratoriami
                      </span>
                    </div>
                  )}
                </div>

                {/* Treść karty */}
                <div className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        Sala {sala.numer}
                      </h3>
                      <p className="text-gray-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Budynek {sala.budynek}
                      </p>
                    </div>
                  </div>

                  {/* Informacje - flex-grow zapewnia wypełnienie przestrzeni */}
                  <div className="flex-grow">
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="font-medium">Pojemność:</span>
                        <span className="ml-2">{sala.maxOsob ? `${sala.maxOsob} osób` : "Nie określono"}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Godziny:</span>
                        <span className="ml-2">
                          {sala.czynnaOd && sala.czynnaDo 
                            ? `${sala.czynnaOd} - ${sala.czynnaDo}`
                            : "Brak danych"
                          }
                        </span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium">Opiekun:</span>
                        <span className="ml-2">
                          {sala.imieOpiekuna && sala.nazwiskoOpiekuna 
                            ? `${sala.imieOpiekuna} ${sala.nazwiskoOpiekuna}`
                            : "brak"
                          }
                        </span>
                      </div>
                    </div>

                    {/* Opis */}
                    {sala.opis && (
                      <div className="mb-2">
                        <p 
                          className="text-sm text-gray-700 bg-gray-50 rounded-lg p-2"
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
                          {sala.opis}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Przyciski - zawsze na dole */}
                  <div className="flex space-x-3 mt-auto">
                    <button 
                      onClick={() => navigate(`/reservation?salaId=${sala.id}&name=Sala ${sala.numer} (${sala.budynek})`)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Zarezerwuj
                    </button>
                    <button 
                      onClick={() => navigate(`/sala/${sala.id}`)}
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
