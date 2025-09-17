import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMojeSale, updateMojaSala } from '../../../../services/salaService';
import { useToastContext } from '../../../ToastProvider';

interface Sala {
  id: number;
  numer: number;
  budynek: string;
  maxOsob: number | null;
  maStanowiska: boolean;
  czynnaOd: string | null;
  czynnaDo: string | null;
  opis: string;
  idOpiekuna: string | null;
  imieOpiekuna: string | null;
  nazwiskoOpiekuna: string | null;
}

export default function MojeSale() {
  const navigate = useNavigate();
  const [sale, setSale] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSala, setEditingSala] = useState<number | null>(null);
  const [editData, setEditData] = useState({ opis: '', czynnaOd: '', czynnaDo: '' });
  const { showSuccess, showError } = useToastContext();

  useEffect(() => {
    loadMojeSale();
  }, []);

  const loadMojeSale = async () => {
    try {
      setLoading(true);
      const data = await fetchMojeSale();
      setSale(data);
    } catch (error) {
      console.error('Błąd pobierania sal:', error);
      showError('Błąd pobierania sal opiekuna');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStart = (sala: Sala) => {
    setEditingSala(sala.id);
    setEditData({
      opis: sala.opis || '',
      czynnaOd: sala.czynnaOd ? sala.czynnaOd.slice(0, 5) : '',
      czynnaDo: sala.czynnaDo ? sala.czynnaDo.slice(0, 5) : ''
    });
  };

  const handleEditCancel = () => {
    setEditingSala(null);
    setEditData({ opis: '', czynnaOd: '', czynnaDo: '' });
  };

  const handleEditSave = async (salaId: number) => {
    try {
      const updateData: any = {};
      
      if (editData.opis.trim()) updateData.opis = editData.opis.trim();
      if (editData.czynnaOd) updateData.czynnaOd = `${editData.czynnaOd}:00`;
      if (editData.czynnaDo) updateData.czynnaDo = `${editData.czynnaDo}:00`;

      await updateMojaSala(salaId, updateData);
      
      // Odśwież listę sal
      await loadMojeSale();
      setEditingSala(null);
      setEditData({ opis: '', czynnaOd: '', czynnaDo: '' });
      showSuccess('Sala została zaktualizowana');
    } catch (error) {
      console.error('Błąd edycji sali:', error);
      showError('Błąd podczas edycji sali');
    }
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
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          🏢 Moje Sale
        </h1>
        <p className="text-gray-600">
          Zarządzaj salami, dla których jesteś opiekunem ({sale.length} sal)
        </p>
      </div>

      {/* Lista sal */}
      {sale.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🏢</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Brak przypisanych sal
          </h2>
          <p className="text-gray-600">
            Nie jesteś opiekunem żadnej sali w systemie.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sale.map((sala) => (
            <div key={sala.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Sala {sala.numer}
                  </h3>
                  <p className="text-sm text-gray-500">{sala.budynek}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      👥 {sala.maxOsob || 'N/A'} osób
                    </span>
                    {sala.maStanowiska && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        💻 Stanowiska
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/sala/${sala.id}`)}
                    className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-colors"
                    title="Zobacz szczegóły"
                  >
                    👁️
                  </button>
                  {editingSala !== sala.id && (
                    <button
                      onClick={() => handleEditStart(sala)}
                      className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Edytuj salę"
                    >
                      ✏️
                    </button>
                  )}
                </div>
              </div>

              {editingSala === sala.id ? (
                // Formularz edycji
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opis sali
                    </label>
                    <textarea
                      value={editData.opis}
                      onChange={(e) => setEditData({ ...editData, opis: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Opis sali (opcjonalny)"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Czynna od
                      </label>
                      <input
                        type="time"
                        value={editData.czynnaOd}
                        onChange={(e) => setEditData({ ...editData, czynnaOd: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Czynna do
                      </label>
                      <input
                        type="time"
                        value={editData.czynnaDo}
                        onChange={(e) => setEditData({ ...editData, czynnaDo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEditSave(sala.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      💾 Zapisz
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      ❌ Anuluj
                    </button>
                  </div>
                </div>
              ) : (
                // Widok informacji
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Opis:</span>
                    <p className="text-gray-900 mt-1">
                      {sala.opis || 'Brak opisu'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Godziny dostępności:</span>
                      <p className="text-gray-900">
                        {sala.czynnaOd && sala.czynnaDo 
                          ? `${sala.czynnaOd.slice(0, 5)} - ${sala.czynnaDo.slice(0, 5)}`
                          : 'Nie określono'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}