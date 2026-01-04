import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useToastContext } from '../../../ToastProvider';
import { preferencesService } from '../../../../services/preferencesService';
import type { UserPreferences, UpdatePreferences } from '../../../../services/preferencesService';

interface UserProfileData {
  id: string;
  email: string;
  imie: string;
  nazwisko: string;
  roles: string[];
  dataUtworzenia: string;
}

export default function UserProfile() {
  const { user, refreshAuth } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ imie: '', nazwisko: '', email: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [preferencesLoading, setPreferencesLoading] = useState(true);
  const { showSuccess, showError } = useToastContext();

  useEffect(() => {
    loadUserProfile();
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      setPreferencesLoading(true);
      const userPrefs = await preferencesService.getUserPreferences();
      setPreferences(userPrefs);
    } catch (error) {
      console.error('Błąd pobierania preferencji:', error);
      showError('Błąd podczas pobierania preferencji');
    } finally {
      setPreferencesLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      setLoading(true);

      // Pobierz dane użytkownika z API
      const { authenticatedFetch } = await import('../../../../services/authService');

      const response = await authenticatedFetch("/api/account/me", {
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Nie udało się pobrać danych użytkownika");
      }

      const data = await response.json();

      const profileData: UserProfileData = {
        id: data.id,
        email: data.email || 'brak@email.com',
        imie: data.imie || 'Brak',
        nazwisko: data.nazwisko || 'Brak',
        roles: data.roles || [],
        dataUtworzenia: data.dataUtworzenia || ''
      };

      setProfileData(profileData);
      setEditData({
        imie: profileData.imie,
        nazwisko: profileData.nazwisko,
        email: profileData.email
      });
    } catch (error) {
      console.error('Błąd pobierania profilu:', error);
      showError('Błąd podczas pobierania danych profilu');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStart = () => {
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    if (profileData) {
      setEditData({
        imie: profileData.imie,
        nazwisko: profileData.nazwisko,
        email: profileData.email
      });
    }
  };

  const handleEditSave = async () => {
    try {
      // Walidacja
      if (!editData.imie.trim() || !editData.nazwisko.trim()) {
        showError('Wszystkie pola są wymagane');
        return;
      }

      // Symulacja zapisu - w rzeczywistości byłoby to API call
      // await updateUserProfile({ imie: editData.imie, nazwisko: editData.nazwisko });

      setProfileData(prev => prev ? { ...prev, imie: editData.imie, nazwisko: editData.nazwisko } : null);
      setIsEditing(false);
      showSuccess('Profil został zaktualizowany');
    } catch (error) {
      console.error('Błąd aktualizacji profilu:', error);
      showError('Błąd podczas aktualizacji profilu');
    }
  };

  const handlePasswordChange = async () => {
    try {
      // Walidacja
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        showError('Wszystkie pola hasła są wymagane');
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        showError('Nowe hasła nie są identyczne');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        showError('Nowe hasło musi mieć co najmniej 6 znaków');
        return;
      }

      // Symulacja zmiany hasła - w rzeczywistości byłoby to API call
      // await changePassword(passwordData);

      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
      showSuccess('Hasło zostało zmienione');
    } catch (error) {
      console.error('Błąd zmiany hasła:', error);
      showError('Błąd podczas zmiany hasła');
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: { [key: string]: string } = {
      'Admin': 'Administrator',
      'Opiekun': 'Opiekun sal',
      'Nauczyciel': 'Nauczyciel',
      'Student': 'Student',
      'Niezatwierdzony': 'Oczekuje na zatwierdzenie'
    };
    return roleNames[role] || role;
  };

  const handlePreferenceChange = async (type: 'emailNotifications' | 'theme', key?: string, value?: boolean | string) => {
    if (!preferences) return;

    try {
      let updateData: UpdatePreferences = {};

      if (type === 'emailNotifications' && key && typeof value === 'boolean') {
        updateData.emailNotifications = {
          ...preferences.emailNotifications,
          [key]: value
        };
        setPreferences(prev => prev ? {
          ...prev,
          emailNotifications: {
            ...prev.emailNotifications,
            [key]: value
          }
        } : null);
      } else if (type === 'theme' && typeof value === 'string') {
        updateData.theme = value;
        setPreferences(prev => prev ? { ...prev, theme: value } : null);
      }

      await preferencesService.updatePreferences(updateData);
    } catch (error) {
      console.error('Błąd aktualizacji preferencji:', error);
      showError('Błąd podczas aktualizacji preferencji');
      // Przywróć poprzedni stan
      await loadUserPreferences();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Błąd ładowania profilu</h2>
        <p className="text-gray-600">Nie udało się załadować danych profilu</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Informacje podstawowe */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">👤 Profil Użytkownika</h1>
          <button
            onClick={handleEditStart}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Edytuj profil
          </button>
        </div>

        {/* Widok informacji */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dane osobowe</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Imię i nazwisko:</span>
                <p className="text-gray-900">{profileData.imie} {profileData.nazwisko}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Email:</span>
                <p className="text-gray-900">{profileData.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">ID użytkownika:</span>
                <p className="text-gray-900 font-mono text-sm">{profileData.id}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informacje o koncie</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Role w systemie:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profileData.roles.map((role, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium"
                    >
                      {getRoleDisplayName(role)}
                    </span>
                  ))}
                </div>
              </div>
              {profileData.dataUtworzenia && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Data utworzenia konta:</span>
                  <p className="text-gray-900">{new Date(profileData.dataUtworzenia).toLocaleDateString('pl-PL')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal edycji profilu */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleEditCancel}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">✏️ Edycja Profilu</h2>
              <button
                onClick={handleEditCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imię</label>
                <input
                  type="text"
                  value={editData.imie}
                  onChange={(e) => setEditData({ ...editData, imie: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nazwisko</label>
                <input
                  type="text"
                  value={editData.nazwisko}
                  onChange={(e) => setEditData({ ...editData, nazwisko: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              {/* Email jest tylko do odczytu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editData.email}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">Email nie może być zmieniony.</p>
              </div>
              <div className="flex justify-between items-center pt-4">
                <div className="flex space-x-3">
                  <button
                    onClick={handleEditSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Zapisz zmiany
                  </button>
                  <button
                    onClick={handleEditCancel}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Anuluj
                  </button>
                </div>
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <span>Zmień hasło</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal zmiany hasła */}
      {isChangingPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsChangingPassword(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">🔒 Zmiana hasła</h2>
              <button
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Obecne hasło</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nowe hasło</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Potwierdź nowe hasło</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handlePasswordChange}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Zmień hasło
                </button>
                <button
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Anuluj
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferencje */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">⚙️ Preferencje</h2>

        {preferencesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : preferences ? (
          <div className="space-y-8">
            {/* Powiadomienia Email */}
            <div className="border-b border-gray-100 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📧 Powiadomienia Email</h3>
              <div className="space-y-5">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <p className="text-base font-medium text-gray-900 mb-1">Zmiany statusu rezerwacji</p>
                    <p className="text-sm text-gray-600">Otrzymuj email gdy status Twojej rezerwacji się zmieni</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications.statusChange}
                    onChange={(e) => handlePreferenceChange('emailNotifications', 'statusChange', e.target.checked)}
                    className="ml-4 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                  />
                </div>

                {/* Opcja tylko dla opiekunów */}
                {profileData?.roles.includes('Opiekun') && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <p className="text-base font-medium text-gray-900 mb-1">Nowe rezerwacje sal</p>
                      <p className="text-sm text-gray-600">Otrzymuj email o nowych rezerwacjach Twoich sal</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications.newReservations}
                      onChange={(e) => handlePreferenceChange('emailNotifications', 'newReservations', e.target.checked)}
                      className="ml-4 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Nie udało się załadować preferencji</p>
            <button
              onClick={loadUserPreferences}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Spróbuj ponownie
            </button>
          </div>
        )}
      </div>
    </div>
  );
}