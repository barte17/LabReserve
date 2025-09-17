import React from 'react';

export default function UserProfile() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          👤 Profil Użytkownika
        </h1>
        <p className="text-gray-600">
          Zarządzaj swoim kontem i ustawieniami
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">W przygotowaniu</h2>
        <p className="text-gray-600">Edycja profilu i ustawień konta</p>
      </div>
    </div>
  );
}