import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMojeStanowiska, updateMojeStanowisko } from '../../../../services/stanowiskoService';
import { useToastContext } from '../../../ToastProvider';

interface Stanowisko {
  id: number;
  nazwa: string;
  typ: string;
  opis: string;
  salaId: number;
  salaNumer: number;
  salaBudynek: string;
}

export default function MojeStanowiska() {
  const navigate = useNavigate();
  const [stanowiska, setStanowiska] = useState<Stanowisko[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStanowisko, setEditingStanowisko] = useState<number | null>(null);
  const [editOpis, setEditOpis] = useState('');
  const { showSuccess, showError } = useToastContext();

  useEffect(() => {
    loadMojeStanowiska();
  }, []);

  const loadMojeStanowiska = async () => {
    try {
      setLoading(true);
      const data = await fetchMojeStanowiska();
      setStanowiska(data);
    } catch (error) {
      console.error('Błąd pobierania stanowisk:', error);
      showError('Błąd pobierania stanowisk opiekuna');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStart = (stanowisko: Stanowisko) => {
    setEditingStanowisko(stanowisko.id);
    setEditOpis(stanowisko.opis || '');
  };

  const handleEditCancel = () => {
    setEditingStanowisko(null);
    setEditOpis('');
  };

  const handleEditSave = async (stanowiskoId: number) => {
    try {
      await updateMojeStanowisko(stanowiskoId, { opis: editOpis.trim() });
      
      // Aktualizuj lokalnie
      setStanowiska(prev => prev.map(s => 
        s.id === stanowiskoId ? { ...s, opis: editOpis.trim() } : s
      ));
      
      setEditingStanowisko(null);
      setEditOpis('');
      showSuccess('Stanowisko zostało zaktualizowane');
    } catch (error) {
      console.error('Błąd edycji stanowiska:', error);
      showError('Błąd podczas edycji stanowiska');
    }
  };

  const getTypIcon = (typ: string) => {
    switch (typ.toLowerCase()) {
      case 'komputer': return '💻';
      case 'laptop': return '📱';
      case 'tablet': return '📟';
      case 'laboratorium': return '🧪';
      default: return '⚙️';
    }
  };

  const groupedByRoom = stanowiska.reduce((acc, stanowisko) => {
    const roomKey = `${stanowisko.salaNumer} - ${stanowisko.salaBudynek}`;
    if (!acc[roomKey]) {
      acc[roomKey] = [];
    }
    acc[roomKey].push(stanowisko);
    return acc;
  }, {} as Record<string, Stanowisko[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          💻 Moje Stanowiska
        </h1>
        <p className="text-gray-600">
          Stanowiska w salach pod Twoją opieką ({stanowiska.length} stanowisk)
        </p>
      </div>

      {/* Lista stanowisk pogrupowana po salach */}
      {Object.keys(groupedByRoom).length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">💻</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Brak stanowisk
          </h2>
          <p className="text-gray-600">
            Nie ma stanowisk w salach pod Twoją opieką.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByRoom).map(([roomName, roomStanowiska]) => (
            <div key={roomName} className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Room Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  🏢 Sala {roomName}
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    {roomStanowiska.length} stanowisk
                  </span>
                </h2>
              </div>

              {/* Stanowiska Grid */}
              <div className="p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {roomStanowiska.map((stanowisko) => (
                    <div key={stanowisko.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getTypIcon(stanowisko.typ)}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900">{stanowisko.nazwa}</h3>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {stanowisko.typ}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/stanowisko/${stanowisko.id}`)}
                            className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Zobacz szczegóły"
                          >
                            👁️
                          </button>
                          {editingStanowisko !== stanowisko.id && (
                            <button
                              onClick={() => handleEditStart(stanowisko)}
                              className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                              title="Edytuj opis"
                            >
                              ✏️
                            </button>
                          )}
                        </div>
                      </div>

                      {editingStanowisko === stanowisko.id ? (
                        // Formularz edycji
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Opis stanowiska
                            </label>
                            <textarea
                              value={editOpis}
                              onChange={(e) => setEditOpis(e.target.value)}
                              rows={3}
                              className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                              placeholder="Opis stanowiska (opcjonalny)"
                            />
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditSave(stanowisko.id)}
                              className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                            >
                              💾 Zapisz
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="flex-1 bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
                            >
                              ❌ Anuluj
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Widok opisu
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Opis:</span>
                          <p className="mt-1 text-gray-900">
                            {stanowisko.opis || 'Brak opisu'}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {stanowiska.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Podsumowanie</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{stanowiska.length}</div>
              <div className="text-sm text-gray-500">Wszystkie stanowiska</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{Object.keys(groupedByRoom).length}</div>
              <div className="text-sm text-gray-500">Sale</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {stanowiska.filter(s => s.typ.toLowerCase().includes('komputer')).length}
              </div>
              <div className="text-sm text-gray-500">Komputery</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {stanowiska.filter(s => s.opis && s.opis.trim()).length}
              </div>
              <div className="text-sm text-gray-500">Z opisem</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}