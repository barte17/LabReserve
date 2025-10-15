import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationItem } from './NotificationItem';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  triggerRef
}) => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { 
    notifications, 
    unreadCount, 
    loading, 
    fetchNotifications, 
    markAsRead,
    markAsReadOnHover
  } = useNotifications();

  // Pobierz ostatnie powiadomienia gdy dropdown się otwiera
  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      fetchNotifications(1, 3); // Max 3 powiadomienia
    }
  }, [isOpen, fetchNotifications, notifications.length]);

  // Zamknij dropdown przy kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id);
  };

  const handleViewAll = () => {
    navigate('/panel?view=user&section=powiadomienia');
    onClose();
  };

  if (!isOpen) return null;

  const recentNotifications = notifications.slice(0, 3); // Max 3 powiadomienia

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Powiadomienia</h3>
          {unreadCount > 0 && (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
              {unreadCount} nowych
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div>
        {loading && recentNotifications.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Ładowanie...</span>
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="text-4xl mb-2">🔔</div>
            <p className="text-sm text-gray-500">Brak nowych powiadomień</p>
          </div>
        ) : (
          <div className="p-2">
            {recentNotifications.map((notification) => (
              <div key={notification.id} className="mb-2">
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAsReadOnHover={markAsReadOnHover}
                  onDelete={() => {}} // Ukryj usuwanie w dropdown
                  compact={true}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer - zawsze widoczny */}
      <div className="px-4 py-3 border-t border-gray-100">
        <button
          onClick={handleViewAll}
          className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Zobacz wszystkie powiadomienia
        </button>
      </div>
    </div>
  );
};