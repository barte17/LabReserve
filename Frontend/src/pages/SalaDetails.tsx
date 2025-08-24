import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchSalaById } from "../services/salaService";
import imgPlaceholder from "../images/img-placeholder.png";

type SalaDetails = {
  id: number;
  numer: number;
  budynek: string;
  maxOsob: number | null;
  maStanowiska: boolean | null;
  czynnaOd: string | null;
  czynnaDo: string | null;
  opis: string | null;
  idOpiekuna: string | null;
  opiekun?: {
    imie: string;
    nazwisko: string;
    email: string;
  } | null;
  zdjecia?: Array<{
    id: number;
    url: string;
  }>;
};

export default function SalaDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sala, setSala] = useState<SalaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Nieprawidłowy identyfikator sali");
      setLoading(false);
      return;
    }

    document.title = "Szczegóły sali - System Rezerwacji";
    
    fetchSalaById(parseInt(id))
      .then((data) => {
        setSala(data);
        document.title = `Sala ${data.numer} - Szczegóły`;
      })
      .catch((err) => {
        console.error(err);
        setError("Błąd podczas pobierania szczegółów sali");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-neutral-600">Ładowanie szczegółów sali...</p>
        </div>
      </div>
    );
  }

  if (error || !sala) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="h-16 w-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Błąd</h2>
          <p className="text-neutral-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate("/sale")}
            className="btn btn-primary"
          >
            Powrót do listy sal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header z nawigacją */}
        <div className="mb-4">
          <button 
            onClick={() => navigate("/sale")}
            className="btn btn-secondary btn-sm mb-2"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Powrót do sal
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:items-start">
          {/* Zdjęcia */}
          <div className="lg:col-span-3 flex flex-col">
            <div className="card mb-6">
              <div className="card-header flex items-center justify-between bg-gradient-to-br from-primary-50 to-white border-b border-primary-200">
                <h2 className="text-lg font-semibold">Sala {sala.numer}</h2>
                <div className="flex space-x-2">
                  {sala.maStanowiska && (
                    <span className="badge badge-info">
                      Z laboratoriami
                    </span>
                  )}
                  <span className="badge badge-neutral">
                    ID: {sala.id}
                  </span>
                </div>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sala.zdjecia && sala.zdjecia.length > 0 ? (
                    sala.zdjecia.map((zdjecie) => (
                      <div key={zdjecie.id} className="aspect-video bg-neutral-100 rounded-lg overflow-hidden">
                        <img 
                          src={zdjecie.url} 
                          alt={`Sala ${sala.numer}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = imgPlaceholder;
                          }}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="md:col-span-2 aspect-video bg-gradient-to-br from-neutral-50 to-neutral-100 border-2 border-dashed border-neutral-200 rounded-lg flex items-center justify-center">
                      <div className="text-center text-neutral-400">
                        <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm font-medium text-neutral-500">Brak zdjęć sali</p>
                        <p className="text-xs text-neutral-400 mt-1">Zdjęcia będą dostępne wkrótce</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Szczegóły */}
          <div className="flex flex-col h-full">
            <div className="card mb-4">
              <div className="card-header bg-gradient-to-br from-primary-50 to-white border-b border-primary-200">
                <h2 className="text-lg font-semibold">Podstawowe informacje</h2>
              </div>
              <div className="card-body space-y-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-neutral-600 block mb-1">Numer sali</span>
                    <p className="text-neutral-900 text-xl font-bold">{sala.numer}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-neutral-600 block mb-1">Budynek</span>
                    <p className="text-neutral-900 font-semibold">{sala.budynek}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-neutral-600 block mb-1">Maksymalna liczba osób</span>
                    <p className="text-neutral-900 font-semibold">
                      {sala.maxOsob ? `${sala.maxOsob} osób` : "Nie podano"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-neutral-600 block mb-1">Stanowiska laboratoryjne</span>
                    <div className="flex items-center space-x-2">
                      <p className="text-neutral-900 font-semibold">
                        {sala.maStanowiska ? "Tak" : "Nie"}
                      </p>
                      {sala.maStanowiska && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Dostępne
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-neutral-600 block mb-1">Godziny pracy</span>
                    <p className="text-neutral-900 font-semibold">
                      {sala.czynnaOd && sala.czynnaDo 
                        ? `${sala.czynnaOd} - ${sala.czynnaDo}`
                        : "Nie podano"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Opiekun */}
            {sala.opiekun && (
              <div className="card mb-4">
                <div className="card-header">
                  <h2 className="text-lg font-semibold">Opiekun sali</h2>
                </div>
                <div className="card-body">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">
                        {sala.opiekun.imie} {sala.opiekun.nazwisko}
                      </p>
                      <p className="text-sm text-neutral-600">{sala.opiekun.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Akcje */}
            <div className="card border-primary-200 bg-gradient-to-br from-primary-50 to-white mt-auto">
              <div className="card-body">
                <button 
                  onClick={() => navigate(`/reservation?salaId=${sala.id}&name=Sala ${sala.numer} (${sala.budynek})`)}
                  className="btn btn-primary w-full py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <svg className="h-6 w-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Zarezerwuj salę
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Opis */}
        {sala.opis && (
          <div className="card mt-4 bg-gradient-to-br from-neutral-50 to-white border-neutral-200">
            <div className="card-header bg-gradient-to-br from-primary-50 to-white border-b border-primary-200">
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 className="text-lg font-semibold text-neutral-800">Opis sali</h2>
              </div>
            </div>
            <div className="card-body p-8">
              <p className="text-neutral-700 leading-relaxed text-base">{sala.opis}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}