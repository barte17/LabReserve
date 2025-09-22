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
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'oczekujące': return '⏳';
      case 'zaakceptowano': return '✅';
      case 'odrzucono': return '❌';
      case 'anulowane': return '🚫';
      default: return '❓';
    }
  };

  const filteredRezerwacje = rezerwacje
    .filter(r => {
      if (filter === 'wszystkie') return true;
      return r.status === filter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'najnowsze':
          return new Date(b.dataUtworzenia).getTime() - new Date(a.dataUtworzenia).getTime();
        case 'najstarsze':
          return new Date(a.dataUtworzenia).getTime() - new Date(b.dataUtworzenia).getTime();
        case 'data-rezerwacji':
          return new Date(a.dataStart).getTime() - new Date(b.dataStart).getTime();
        default:
          return 0;
      }
    });

  const stats = {
    wszystkie: rezerwacje.length,
    oczekujace: rezerwacje.filter(r => r.status === 'oczekujące').length,
    zaakceptowane: rezerwacje.filter(r => r.status === 'zaakceptowano').length,
    odrzucone: rezerwacje.filter(r => r.status === 'odrzucono').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header z statystykami */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          📅 Zarządzaj Rezerwacjami
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.wszystkie}</div>
            <div className="text-sm text-gray-500">Wszystkie</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.oczekujace}</div>
            <div className="text-sm text-gray-500">Oczekujące</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.zaakceptowane}</div>
            <div className="text-sm text-gray-500">Zaakceptowane</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.odrzucone}</div>
            <div className="text-sm text-gray-500">Odrzucone</div>
          </div>
        </div>
      </div>

      {/* Filtry i sortowanie */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filtruj po statusie:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="wszystkie">Wszystkie ({stats.wszystkie})</option>
              <option value="oczekujące">Oczekujące ({stats.oczekujace})</option>
              <option value="zaakceptowano">Zaakceptowane ({stats.zaakceptowane})</option>
              <option value="odrzucono">Odrzucone ({stats.odrzucone})</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sortuj według:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="najnowsze">Najnowsze zgłoszenia</option>
              <option value="najstarsze">Najstarsze zgłoszenia</option>
              <option value="data-rezerwacji">Data rezerwacji</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista rezerwacji */}
      {filteredRezerwacje.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {filter === 'wszystkie' ? 'Brak rezerwacji' : `Brak rezerwacji: ${filter}`}
          </h2>
          <p className="text-gray-600">
            {filter === 'wszystkie' 
              ? 'Nie ma jeszcze żadnych rezerwacji dla Twoich sal.'
              : `Brak rezerwacji z statusem "${filter}".`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRezerwacje.map((rezerwacja) => (
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
    </div>
  );
}