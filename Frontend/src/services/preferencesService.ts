import { apiRequest } from './apiErrorHandler';

interface EmailNotificationSettings {
  statusChange: boolean;
  newReservations: boolean;
}

interface UserPreferences {
  emailNotifications: EmailNotificationSettings;
  theme: string;
}

interface UpdatePreferences {
  emailNotifications?: EmailNotificationSettings;
  theme?: string;
}

export type { EmailNotificationSettings, UserPreferences, UpdatePreferences };

export const preferencesService = {
  async getUserPreferences(): Promise<UserPreferences> {
    const response = await apiRequest('/api/userpreferences', {
      method: 'GET'
    }, 'Błąd podczas pobierania preferencji');
    return response.json();
  },

  async updatePreferences(preferences: UpdatePreferences): Promise<void> {
    await apiRequest('/api/userpreferences', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferences)
    }, 'Błąd podczas aktualizacji preferencji');
  },

  async getUserTheme(): Promise<string> {
    const response = await apiRequest('/api/userpreferences/theme', {
      method: 'GET'
    }, 'Błąd podczas pobierania theme');
    const data = await response.json();
    return data.theme;
  }
};