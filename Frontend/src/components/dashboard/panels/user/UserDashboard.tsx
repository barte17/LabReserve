import React from 'react';

export default function UserDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          👤 Panel Użytkownika
        </h1>
        <p className="text-gray-600">
          Twój główny panel sterowania
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">W przygotowaniu</h2>
        <p className="text-gray-600">Panel dla zwykłych użytkowników</p>
      </div>
    </div>
  );
}