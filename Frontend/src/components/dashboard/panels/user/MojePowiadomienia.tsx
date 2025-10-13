import React from 'react';
import { useNotifications } from '../../../../hooks/useNotifications';
import { NotificationList } from '../../../notifications/NotificationList';
import { useToastContext } from '../../../ToastProvider';
import { apiRequest } from '../../../../services/apiErrorHandler';

export default function MojePowiadomienia() {
  const { unreadCount, isConnected } = useNotifications();
  const { showSuccess, showError } = useToastContext();

  const handleMarkAllAsRead = async () => {
    try {
      await apiRequest('/api/powiadomienia/oznacz-wszystkie-przeczytane', {
        method: 'POST'
      }, 'Błąd podczas oznaczania wszystkich powiadomień jako przeczytane');
      
      showSuccess('Wszystkie powiadomienia oznaczone jako przeczytane');
      // Hook automatycznie zaktualizuje licznik przez SignalR
    } catch (error) {
      showError('Wystąpił błąd podczas oznaczania powiadomień');
    }
  };

  const handleTestNotification = async () => {
    try {
      await apiRequest('/api/powiadomienia/test', {
        method: 'POST'
      }, 'Błąd podczas wysyłania testowego powiadomienia');
      
      showSuccess('Testowe powiadomienie zostało wysłane! Sprawdź toast i dzwonek w navbarze.');
    } catch (error) {
      showError('Wystąpił błąd podczas wysyłania testowego powiadomienia');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Moje Powiadomienia</h1>
            <p className="text-gray-600 mt-1">
              Zarządzaj swoimi powiadomieniami systemowymi
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Status połączenia */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-500">
                {isConnected ? 'Połączony' : 'Rozłączony'}
              </span>
            </div>
            
            {/* Licznik nieprzeczytanych */}
            {unreadCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Nieprzeczytane:</span>
                <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Akcje */}
        <div className="mt-4 flex gap-3 flex-wrap">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Oznacz wszystkie jako przeczytane
            </button>
          )}
          
          <button
            onClick={handleTestNotification}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            🧪 Testuj powiadomienie
          </button>
        </div>
      </div>

      {/* Lista powiadomień */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 min-h-[600px]">
        <NotificationList />
      </div>
    </div>
  );
}