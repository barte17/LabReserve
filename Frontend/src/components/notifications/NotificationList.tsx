import React, { useEffect, useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { useToastContext } from '../ToastProvider';

interface NotificationListProps {
  compact?: boolean;
  maxItems?: number;
  // Opcjonalne props do przekazania danych z rodzica (dla współdzielenia stanu)
  externalNotifications?: any[];
  externalLoading?: boolean;
  externalMarkAsRead?: (id: number) => Promise<boolean>;
  externalMarkAsReadOnHover?: (id: number) => Promise<boolean>;
  externalDeleteNotification?: (id: number) => Promise<boolean>;
}

export const NotificationList: React.FC<NotificationListProps> = ({ 
  compact = false, 
  maxItems,
  externalNotifications,
  externalLoading,
  externalMarkAsRead,
  externalMarkAsReadOnHover,
  externalDeleteNotification
}) => {
  const hookData = useNotifications();
  
  // Używaj zewnętrznych danych jeśli są dostępne, w przeciwnym razie użyj hooka
  const notifications = externalNotifications ?? hookData.notifications;
  const loading = externalLoading ?? hookData.loading;
  const initialized = hookData.initialized;
  const fetchNotifications = hookData.fetchNotifications;
  const markAsRead = externalMarkAsRead ?? hookData.markAsRead;
  const markAsReadOnHover = externalMarkAsReadOnHover ?? hookData.markAsReadOnHover;
  const deleteNotification = externalDeleteNotification ?? hookData.deleteNotification;
  const { showSuccess, showError } = useToastContext();
  const [currentPage, setCurrentPage] = useState(1);

  // Początkowe załadowanie tylko jeśli używamy hooka (nie external props) i dane nie zostały załadowane
  useEffect(() => {
    if (!externalNotifications && !initialized) {
      fetchNotifications(1, maxItems || 20);
      setCurrentPage(1);
    }
  }, [externalNotifications, initialized, fetchNotifications, maxItems]);

  // Reset strony gdy notifications są puste (po usunięciu wszystkich)
  useEffect(() => {
    if (notifications.length === 0) {
      setCurrentPage(1);
    }
  }, [notifications.length]);

  const handleMarkAsRead = async (id: number) => {
    const success = await markAsRead(id);
    if (success) {
      showSuccess('Powiadomienie oznaczone jako przeczytane');
    } else {
      showError('Nie udało się oznaczyć powiadomienia');
    }
  };

  const handleDelete = async (id: number) => {
    const success = await deleteNotification(id);
    if (success) {
      showSuccess('Powiadomienie zostało usunięte');
    } else {
      showError('Nie udało się usunąć powiadomienia');
    }
  };

  const loadMore = async () => {
    const nextPage = currentPage + 1;
    await fetchNotifications(nextPage, 20, true); // append = true dla paginacji
    setCurrentPage(nextPage);
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Ładowanie powiadomień...</span>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="text-6xl mb-4">🔔</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Brak powiadomień</h3>
        <p className="text-gray-500">Wszystkie powiadomienia są aktualne</p>
      </div>
    );
  }

  const displayNotifications = maxItems 
    ? notifications.slice(0, maxItems) 
    : notifications;

  return (
    <div className={compact ? 'space-y-1' : 'space-y-2'}>
      {displayNotifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={handleMarkAsRead}
          onMarkAsReadOnHover={markAsReadOnHover}
          onDelete={handleDelete}
          compact={compact}
        />
      ))}
      
      {!compact && !maxItems && notifications.length >= 20 && (
        <div className="text-center pt-4">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:underline disabled:opacity-50"
          >
            {loading ? 'Ładowanie...' : 'Załaduj więcej'}
          </button>
        </div>
      )}
      
      {compact && maxItems && notifications.length > maxItems && (
        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            Pokazano {maxItems} z {notifications.length} powiadomień
          </p>
        </div>
      )}
    </div>
  );
};