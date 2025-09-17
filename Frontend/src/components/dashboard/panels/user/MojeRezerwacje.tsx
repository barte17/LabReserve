import React from 'react';

export default function MojeRezerwacje() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          📋 Moje Rezerwacje
        </h1>
        <p className="text-gray-600">
          Historia i status Twoich rezerwacji
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">W przygotowaniu</h2>
        <p className="text-gray-600">Lista rezerwacji użytkownika</p>
      </div>
    </div>
  );
}