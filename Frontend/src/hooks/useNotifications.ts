import { useState, useEffect, useCallback } from 'react';
import { useSignalR } from './useSignalR';
import { notificationService } from '../services/notificationService';
import type { NotificationData } from '../types/notification';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { connection, isConnected } = useSignalR();

  // Pobierz powiadomienia z API
  const fetchNotifications = useCallback(async (strona = 1, rozmiar = 20, append = false) => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications(strona, rozmiar);
      
      if (append && strona > 1) {
        // Dodaj nowe powiadomienia do istniejących (paginacja)
        setNotifications(prev => [...prev, ...response.powiadomienia]);
      } else {
        // Zastąp wszystkie powiadomienia (refresh lub pierwsza strona)
        setNotifications(response.powiadomienia);
      }
      
      // Również zaktualizuj licznik nieprzeczytanych
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
      setInitialized(true);
      
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

  // Oznacz wszystkie jako przeczytane z lokalną aktualizacją
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Lokalnie zaktualizuj stan wszystkich powiadomień
      setNotifications(prev => 
        prev.map(n => ({ ...n, czyPrzeczytane: true }))
      );
      
      // Ustaw licznik na 0
      setUnreadCount(0);
      
      return true;
    } catch (error) {
      console.error('Błąd podczas oznaczania wszystkich jako przeczytane:', error);
      return false;
    }
  }, []);

  // Usuń wszystkie powiadomienia z lokalną aktualizacją
  const deleteAllNotifications = useCallback(async () => {
    try {
      const result = await notificationService.deleteAllNotifications();
      
      // Lokalnie wyczyść stan ale zachowaj initialized = true
      setNotifications([]);
      setUnreadCount(0);
      // Nie resetuj initialized - dane są nadal "załadowane", po prostu puste
      
      return result;
    } catch (error) {
      console.error('Błąd podczas usuwania wszystkich powiadomień:', error);
      throw error;
    }
  }, []);

  // Obsługa SignalR
  useEffect(() => {
    if (!connection || !isConnected) return;

    // Obsługa nowego powiadomienia
    const handleNewNotification = (notification: NotificationData) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Toast notifications usunięte - powiadomienia będą widoczne tylko w dzwoneczku navbara
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
  }, [connection, isConnected]);

  // Początkowe załadowanie danych
  useEffect(() => {
    if (isConnected && !initialized) {
      fetchNotifications(1, 20); // Automatycznie załaduj powiadomienia przy połączeniu
    }
  }, [isConnected, initialized, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    initialized,
    isConnected,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAsReadOnHover,
    deleteNotification,
    markAllAsRead,
    deleteAllNotifications
  };
};