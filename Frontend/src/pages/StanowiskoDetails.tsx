import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchStanowiskoById } from "../services/stanowiskoService";
import ImageGallery from "../components/ImageGallery";
import { LoadingCard } from "../components/LoadingStates";
import { useMinimumLoadingDelay } from "../hooks/useMinimumLoadingDelay";

type StanowiskoDetails = {
  id: number;
  salaId: number;
  nazwa: string;
  typ: string | null;
  opis: string | null;
  sala?: {
    id: number;
    numer: number;
    budynek: string;
  };
  zdjecia?: Array<{
    id: number;
    url: string;
  }>;
};

export default function StanowiskoDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [stanowisko, setStanowisko] = useState<StanowiskoDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Nieprawidłowy identyfikator stanowiska");
      setLoading(false);
      return;
    }

    document.title = "Szczegóły stanowiska - System Rezerwacji";
    
    fetchStanowiskoById(parseInt(id))
      .then((data) => {
        setStanowisko(data);
        document.title = `${data.nazwa} - Szczegóły`;
      })
      .catch((err) => {
        console.error(err);
        setError("Błąd podczas pobierania szczegółów stanowiska");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const shouldShowLoading = useMinimumLoadingDelay(loading, {
    minimumDelay: 150,
    minimumDuration: 400
  });

  if (shouldShowLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <LoadingCard count={1} className="max-w-4xl mx-auto" />
      </div>
    );
  }

  // Nie pokazuj błędu jeśli nadal trwa ładowanie lub skeleton jest widoczny
  if ((error || !stanowisko) && !loading && !shouldShowLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="h-16 w-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Błąd</h2>
          <p className="text-neutral-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/stanowiska')}
            className="btn btn-primary"
          >
            Powrót do listy stanowisk
          </button>
        </div>
      </div>
    );
  }

  // Dodatkowy guard - nie renderuj jeśli stanowisko jest null
  if (!stanowisko) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:items-stretch">
          {/* Zdjęcia */}
          <div className="lg:col-span-3">
            <div className="card mb-6 h-full flex flex-col">
              <div className="card-header flex items-center justify-between bg-gradient-to-br from-primary-50 to-white border-b border-primary-200">
                <h2 className="text-xl font-semibold">{stanowisko.nazwa}</h2>
                <div className="flex space-x-2">
                  {stanowisko.typ && (
                    <span className="badge badge-info">
                      {stanowisko.typ}
                    </span>
                  )}
                  <span className="badge badge-neutral">
                    ID: {stanowisko.id}
                  </span>
                </div>
              </div>
              <div className="card-body flex-1">
                <ImageGallery 
                  zdjecia={stanowisko.zdjecia || []} 
                  altText={`Stanowisko ${stanowisko.nazwa}`}
                />
              </div>
            </div>
          </div>

          {/* Szczegóły */}
          <div className="h-full flex flex-col">
            <div className="card mb-4">
              <div className="card-header bg-gradient-to-br from-primary-50 to-white border-b border-primary-200">
                <h2 className="text-xl font-semibold">Podstawowe informacje</h2>
              </div>
              <div className="card-body space-y-7">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-neutral-900 font-semibold text-sm">{stanowisko.nazwa}</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <p className="text-neutral-900 font-semibold text-sm">
                    Typ: {stanowisko.typ || "Nie określono"}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <p className="text-neutral-900 font-semibold text-sm">
                    W sali: {stanowisko.sala 
                      ? `${stanowisko.sala.numer}${stanowisko.sala.budynek}`
                      : `${stanowisko.salaId}`
                    }
                  </p>
                </div>
                
                {stanowisko.sala && stanowisko.sala.czynnaOd && stanowisko.sala.czynnaDo && (
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-neutral-900 font-semibold text-sm">
                      {stanowisko.sala.czynnaOd.substring(0, 5)} - {stanowisko.sala.czynnaDo.substring(0, 5)}
                    </p>
                  </div>
                )}
                
              </div>
            </div>

            {/* Informacje o sali */}
            {stanowisko.sala && (
              <div className="card mb-2">
                <div className="card-header">
                  <h2 className="text-lg font-semibold">Lokalizacja</h2>
                </div>
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">
                          Sala {stanowisko.sala.numer}
                        </p>
                        <p className="text-sm text-neutral-600">Budynek {stanowisko.sala.budynek}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/sala/${stanowisko.sala!.id}`)}
                      className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                      title="Zobacz szczegóły sali"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Akcje */}
            <div className="card border-primary-200 bg-gradient-to-br from-primary-50 to-white mt-auto">
              <div className="card-body p-0">
                <button 
                  onClick={() => navigate(`/reservation?stanowiskoId=${stanowisko.id}&name=${stanowisko.nazwa}`)}
                  className="btn btn-primary w-full py-6 px-6 text-base font-semibold transform hover:scale-105 transition-all duration-200 focus:outline-none border border-red-600/20 hover:border-red-500/30"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Zarezerwuj
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Opis */}
        {stanowisko.opis && (
          <div className="card mt-4 bg-gradient-to-br from-neutral-50 to-white border-neutral-200">
            <div className="card-header bg-gradient-to-br from-primary-50 to-white border-b border-primary-200">
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 className="text-lg font-semibold text-neutral-800">Opis stanowiska</h2>
              </div>
            </div>
            <div className="card-body p-8">
              <p className="text-neutral-700 leading-relaxed text-base">{stanowisko.opis}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}