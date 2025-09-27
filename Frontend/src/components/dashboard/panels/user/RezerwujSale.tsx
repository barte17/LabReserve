import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMyReservations } from '../../../../services/rezerwacjaService';

interface Rezerwacja {
  id: number;
  dataStart: string;
  dataKoniec: string;
  dataUtworzenia: string;
  salaNumer?: string;
  salaBudynek?: string;
  stanowiskoNazwa?: string;
  stanowiskoId?: number;
  salaId?: number;
  uzytkownikId: string;
  uzytkownikImie?: string;
  uzytkownikNazwisko?: string;
  uzytkownikEmail?: string;
  status: string;
  opis?: string;
}

export default function RezerwujSale() {
  const navigate = useNavigate();
  const [ostatnieRezerwacje, setOstatnieRezerwacje] = useState<Rezerwacja[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOstatnieRezerwacje();
  }, []);

  const loadOstatnieRezerwacje = async () => {
    try {
      const rezerwacje = await fetchMyReservations();
      // Pobierz ostatnie 6 rezerwacji według daty rezerwacji (dataStart)
      const ostatnie = rezerwacje
        .sort((a, b) => new Date(b.dataStart).getTime() - new Date(a.dataStart).getTime())
        .slice(0, 6);
      
      setOstatnieRezerwacje(ostatnie);
    } catch (error) {
      console.error('Błąd pobierania ostatnich rezerwacji:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToRooms = () => {
    navigate('/sale');
  };

  const handleNavigateToStations = () => {
    navigate('/stanowiska');
  };

  const handleNavigateToDetails = (rezerwacja: Rezerwacja) => {
    if (rezerwacja.stanowiskoId) {
      navigate(`/stanowisko/${rezerwacja.stanowiskoId}`);
    } else if (rezerwacja.salaId) {
      navigate(`/sala/${rezerwacja.salaId}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          📅 Rezerwuj Sale
        </h1>
        <p className="text-gray-600">
          Przeglądaj dostępne sale i stanowiska, dokonuj nowych rezerwacji
        </p>
      </div>

      {/* Główne opcje nawigacji */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sale */}
        <div
          onClick={handleNavigateToRooms}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 cursor-pointer hover:shadow-md hover:border-red-300 transition-all group"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
              <span className="text-3xl">🏢</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Przeglądaj Sale
            </h2>
            <p className="text-gray-600 mb-4">
              Zobacz wszystkie dostępne sale oraz sprawdź ich wyposażenie
            </p>
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium inline-block">
              Zobacz sale →
            </div>
          </div>
        </div>

        {/* Stanowiska */}
        <div
          onClick={handleNavigateToStations}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 cursor-pointer hover:shadow-md hover:border-red-300 transition-all group"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
              <span className="text-3xl">💻</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Przeglądaj Stanowiska
            </h2>
            <p className="text-gray-600 mb-4">
              Znajdź konkretne stanowisko komputerowe w wybranej sali
            </p>
            <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium inline-block">
              Zobacz stanowiska →
            </div>
          </div>
        </div>
      </div>


      {/* Ostatnio rezerwowane */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🕒 Ostatnio rezerwowane</h2>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : ostatnieRezerwacje.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📅</div>
            <p className="text-gray-500">Nie masz jeszcze żadnych rezerwacji</p>
            <p className="text-sm text-gray-400 mt-1">Zarezerwuj pierwszą salę lub stanowisko</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ostatnieRezerwacje.map((rezerwacja) => (
              <div
                key={rezerwacja.id}
                onClick={() => handleNavigateToDetails(rezerwacja)}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm hover:border-red-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {rezerwacja.stanowiskoNazwa ? '💻' : '🏢'}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {rezerwacja.stanowiskoNazwa ? (
                        <>{rezerwacja.stanowiskoNazwa} ({rezerwacja.salaNumer || 'brak'}{rezerwacja.salaBudynek || ''})</>
                      ) : (
                        <>Sala {rezerwacja.salaNumer || 'brak'}{rezerwacja.salaBudynek || ''}</>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Ostatnia: {new Date(rezerwacja.dataStart).toLocaleDateString('pl-PL')}
                    </div>
                  </div>
                  <div className="text-gray-400 group-hover:text-red-600 transition-colors">
                    →
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