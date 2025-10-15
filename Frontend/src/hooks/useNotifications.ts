import { useState, useEffect, useCallback } from 'react';
import { useSignalR } from './useSignalR';
import { notificationService } from '../services/notificationService';
import { useToastContext } from '../components/ToastProvider';
import type { NotificationData } from '../types/notification';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { connection, isConnected } = useSignalR();
  const { showNotification } = useToastContext();

  // Pobierz powiadomienia z API
  const fetchNotifications = useCallback(async (strona = 1, rozmiar = 20) => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications(strona, rozmiar);
      setNotifications(response.powiadomienia);
      
      // Również zaktualizuj licznik nieprzeczytanych
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
      
      return response;
    } catch (error) {
      console.error('Błąd podczas pobierania powiadomień:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Pobierz licznik nieprzeczytanych
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
      return count;
    } catch (error) {
      console.error('Błąd podczas pobierania licznika:', error);
      return 0;
    }
  }, []);

  // Oznacz jako przeczytane
  const markAsRead = useCallback(async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, czyPrzeczytane: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      return true;
    } catch (error) {
      console.error('Błąd podczas oznaczania jako przeczytane:', error);
      return false;
    }
  }, []);

  // Oznacz jako przeczytane przy hover (tylko jeśli nieprzeczytane)
  const markAsReadOnHover = useCallback(async (id: number) => {
    try {
      // Sprawdź czy powiadomienie jest nieprzeczytane
      const notification = notifications.find(n => n.id === id);
      if (!notification || notification.czyPrzeczytane) {
        return true; // Już przeczytane, nic nie rób
      }

      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, czyPrzeczytane: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      return true;
    } catch (error) {
      console.error('Błąd podczas oznaczania jako przeczytane przy hover:', error);
      return false;
    }
  }, [notifications]);

  // Usuń powiadomienie
  const deleteNotification = useCallback(async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
      return true;
    } catch (error) {
      console.error('Błąd podczas usuwania powiadomienia:', error);
      return false;
    }
  }, []);

  // Obsługa SignalR
  useEffect(() => {
    if (!connection || !isConnected) return;

    // Obsługa nowego powiadomienia
    const handleNewNotification = (notification: NotificationData) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Pokaż ulepszony toast z akcją
      showNotification(
        notification.tytul,
        notification.tresc,
        notification.actionUrl || '/dashboard/powiadomienia',
        notification.actionUrl ? 'Zobacz szczegóły' : 'Przejdź do powiadomień'
      );
    };

    // Obsługa aktualizacji licznika
    const handleUpdateCounter = (newCount: number) => {
      setUnreadCount(newCount);
    };

    connection.on('NowePowiadomienie', handleNewNotification);
    connection.on('AktualizujLicznik', handleUpdateCounter);

    return () => {
      connection.off('NowePowiadomienie', handleNewNotification);
      connection.off('AktualizujLicznik', handleUpdateCounter);
    };
  }, [connection, isConnected, showNotification]);

  // Początkowe załadowanie danych
  useEffect(() => {
    if (isConnected) {
      fetchUnreadCount();
    }
  }, [isConnected, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    isConnected,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAsReadOnHover,
    deleteNotification
  };
};