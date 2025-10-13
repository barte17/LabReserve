import React from 'react';
import type { NotificationData } from '../../types/notification';

interface NotificationItemProps {
  notification: NotificationData;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
  compact?: boolean;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  compact = false
}) => {
  const getPriorityColor = (priorytet: string) => {
    switch (priorytet) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'normal': return 'border-l-blue-500 bg-blue-50';
      case 'low': return 'border-l-gray-500 bg-gray-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getTypeIcon = (typ: string) => {
    switch (typ) {
      case 'rezerwacja': return '📅';
      case 'system': return '⚙️';
      case 'reminder': return '⏰';
      default: return '📢';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Przed chwilą';
    if (diffHours < 24) return `${diffHours}h temu`;
    if (diffDays < 7) return `${diffDays} dni temu`;
    return date.toLocaleDateString('pl-PL');
  };

  return (
    <div className={`
      border-l-4 p-3 mb-2 rounded-r-lg transition-all duration-200
      ${getPriorityColor(notification.priorytet)}
      ${!notification.czyPrzeczytane ? 'shadow-md' : 'opacity-75'}
      ${compact ? 'text-sm' : ''}
      hover:shadow-lg
    `}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{getTypeIcon(notification.typ)}</span>
            <h4 className={`font-medium ${!notification.czyPrzeczytane ? 'text-gray-900' : 'text-gray-600'}`}>
              {notification.tytul}
            </h4>
            {!notification.czyPrzeczytane && (
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </div>
          
          <p className={`mb-2 ${compact ? 'text-xs' : 'text-sm'} ${!notification.czyPrzeczytane ? 'text-gray-700' : 'text-gray-500'}`}>
            {notification.tresc}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {formatDate(notification.dataUtworzenia)}
            </span>
            
            {!compact && (
              <div className="flex gap-2">
                {!notification.czyPrzeczytane && (
                  <button
                    onClick={() => onMarkAsRead(notification.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Oznacz jako przeczytane
                  </button>
                )}
                <button
                  onClick={() => onDelete(notification.id)}
                  className="text-xs text-red-600 hover:text-red-800 hover:underline"
                >
                  Usuń
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};