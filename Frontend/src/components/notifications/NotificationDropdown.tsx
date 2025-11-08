import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationItem } from './NotificationItem';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  mobileRef?: React.RefObject<HTMLButtonElement>;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  triggerRef,
  mobileRef
}) => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { 
    notifications, 
    unreadCount, 
    loading, 
    fetchNotifications, 
    markAsRead,
    markAsReadOnHover,
    deleteNotification
  } = useNotifications();

  // Pobierz ostatnie powiadomienia gdy dropdown się otwiera
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(1, 5); // Zawsze odśwież przy otwarciu (sync z sekcją powiadomień)
    }
  }, [isOpen, fetchNotifications]);

  // Zamknij dropdown przy kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Sprawdź czy kliknięcie jest poza dropdown
      const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(target);
      
      // Sprawdź czy kliknięcie nie jest w desktop przycisk
      const isNotDesktopButton = triggerRef.current && !triggerRef.current.contains(target);
      
      // Sprawdź czy kliknięcie nie jest w mobile przycisk
      const isNotMobileButton = !mobileRef?.current || !mobileRef.current.contains(target);
      
      if (isOutsideDropdown && isNotDesktopButton && isNotMobileButton) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef, mobileRef]);

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id);
  };

  const handleDelete = async (id: number) => {
    const success = await deleteNotification(id);
    if (success) {
      // Po usunięciu powiadomienia, sprawdź czy mamy już 4+ powiadomień załadowanych
      // Jeśli nie, pobierz więcej żeby pokazać kolejne w miejsce usuniętego
      if (notifications.length <= 3) {
        await fetchNotifications(1, 5); // Pobierz więcej powiadomień
      }
      // Jeśli mamy już więcej niż 3, lokalny stan się automatycznie zaktualizuje
      // przez deleteNotification() który usuwa z lokalnej tablicy
    }
  };

  const handleViewAll = () => {
    navigate('/panel?view=user&section=powiadomienia');
    onClose();
  };

  if (!isOpen) return null;

  const recentNotifications = notifications.slice(0, 5); // Max 5 powiadomień

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 right-0 w-80 sm:w-96 max-w-[calc(100vw-16px)]"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-900">Powiadomienia</h3>
      </div>

      {/* Content z ograniczoną wysokością i scrollem */}
      <div className="max-h-[50vh] sm:max-h-[400px] overflow-y-auto">
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
                  onDelete={handleDelete}
                  compact={true}
                  truncate={true}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky Footer - zawsze widoczny na dole */}
      <div className="sticky bottom-0 px-4 py-3 border-t border-gray-100 bg-white rounded-b-lg">
        <button
          onClick={handleViewAll}
          className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          Zobacz wszystkie powiadomienia
        </button>
      </div>
    </div>
  );
};