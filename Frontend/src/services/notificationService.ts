import { apiRequest } from './apiErrorHandler';
import type { NotificationData, NotificationsResponse } from '../types/notification';

export const notificationService = {
  async getNotifications(strona = 1, rozmiar = 20): Promise<NotificationsResponse> {
    const response = await apiRequest(`/api/powiadomienia?strona=${strona}&rozmiar=${rozmiar}`, {}, 'Błąd podczas ładowania powiadomień');
    return response.json();
  },

  async markAsRead(id: number): Promise<void> {
    await apiRequest(`/api/powiadomienia/${id}/przeczytane`, { 
      method: 'POST' 
    }, 'Błąd podczas oznaczania powiadomienia jako przeczytane');
  },

  async deleteNotification(id: number): Promise<void> {
    await apiRequest(`/api/powiadomienia/${id}`, { 
      method: 'DELETE' 
    }, 'Błąd podczas usuwania powiadomienia');
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiRequest('/api/powiadomienia/licznik', {}, 'Błąd podczas pobierania licznika powiadomień');
    const data = await response.json();
    return data.licznik;
  },

  async markAllAsRead(): Promise<void> {
    await apiRequest('/api/powiadomienia/oznacz-wszystkie-przeczytane', { 
      method: 'POST' 
    }, 'Błąd podczas oznaczania wszystkich powiadomień jako przeczytane');
  },

  async deleteAllNotifications(): Promise<{ message: string; liczbaUsunietych: number }> {
    const response = await apiRequest('/api/powiadomienia/usun-wszystkie', { 
      method: 'DELETE' 
    }, 'Błąd podczas usuwania wszystkich powiadomień');
    return response.json();
  }
};