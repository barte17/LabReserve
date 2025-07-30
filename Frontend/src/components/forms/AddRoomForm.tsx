import { useState, useEffect } from "react";

type SalaFormData = {
  numer: number;
  budynek: string;
  maxOsob: number | null;
  maStanowiska: boolean;
  czynnaOd: string | null; // format hh:mm:ss
  czynnaDo: string | null;
  opis: string;
  idOpiekuna: string | null;
};

type User = {
  id: string;
  imie: string;
  nazwisko: string;
};

export default function AddRoomForm({ onSubmit, initialData, submitLabel = "Dodaj", onCancel }: {
  onSubmit: (data: SalaFormData) => void;
  initialData?: Partial<SalaFormData>;
  submitLabel?: string;
  onCancel?: () => void;
}) {
  const [numer, setNumer] = useState(initialData?.numer?.toString() ?? "");
  const [budynek, setBudynek] = useState(initialData?.budynek ?? "");
  const [maxOsob, setMaxOsob] = useState(initialData?.maxOsob?.toString() ?? "");
  const [maStanowiska, setMaStanowiska] = useState(initialData?.maStanowiska ?? false);
  const [czynnaOd, setCzynnaOd] = useState(initialData?.czynnaOd ? initialData.czynnaOd.slice(0,5) : "");
  const [czynnaDo, setCzynnaDo] = useState(initialData?.czynnaDo ? initialData.czynnaDo.slice(0,5) : "");
  const [opis, setOpis] = useState(initialData?.opis ?? "");
  const [idOpiekuna, setIdOpiekuna] = useState(initialData?.idOpiekuna ?? "");
  const [nauczyciele, setNauczyciele] = useState<User[]>([]);

  useEffect(() => {
    fetch("/api/users/opiekunowie")
      .then(res => res.json())
      .then(setNauczyciele)
      .catch(console.error);
  }, []);

  const formatTimeToTimeSpan = (time: string): string | null => {
    return time ? `${time}:00` : null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedData: SalaFormData = {
      numer: parseInt(numer),
      budynek,
      maxOsob: maxOsob ? parseInt(maxOsob) : null,
      maStanowiska,
      czynnaOd: formatTimeToTimeSpan(czynnaOd),
      czynnaDo: formatTimeToTimeSpan(czynnaDo),
      opis,
      idOpiekuna: idOpiekuna || null
    };

    onSubmit(parsedData);
  };

    return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-neutral-900 mb-2">
          {initialData ? 'Edytuj salę' : 'Dodaj nową salę'}
        </h3>
        <p className="text-neutral-600">
          Wypełnij formularz, aby {initialData ? 'zaktualizować' : 'dodać'} salę do systemu
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label">Numer sali</label>
            <input
              type="number"
              value={numer}
              onChange={(e) => setNumer(e.target.value)}
              required
              className="form-input"
              placeholder="Wprowadź numer sali"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Budynek</label>
            <input
              value={budynek}
              onChange={(e) => setBudynek(e.target.value)}
              required
              className="form-input"
              placeholder="Nazwa budynku"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label">Maksymalna liczba osób</label>
            <input
              type="number"
              value={maxOsob}
              onChange={(e) => setMaxOsob(e.target.value)}
              className="form-input"
              placeholder="Pojemność sali"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Opiekun sali</label>
            <select
              value={idOpiekuna}
              onChange={(e) => setIdOpiekuna(e.target.value)}
              className="form-input"
            >
              <option value="">-- Wybierz opiekuna --</option>
              {nauczyciele.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.imie} {user.nazwisko}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={maStanowiska}
              onChange={(e) => setMaStanowiska(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
              id="maStanowiska"
            />
            <label htmlFor="maStanowiska" className="ml-3 text-sm font-medium text-neutral-700">
              Sala posiada laboratoria/stanowiska badawcze
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label">Godzina otwarcia</label>
            <div className="relative">
              <select
                value={czynnaOd}
                onChange={(e) => setCzynnaOd(e.target.value)}
                className="form-input pr-10"
              >
                <option value="">Wybierz godzinę otwarcia</option>
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i.toString().padStart(2, '0');
                  return (
                    <option key={hour} value={`${hour}:00`}>
                      {hour}:00
                    </option>
                  );
                })}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Godzina zamknięcia</label>
            <div className="relative">
              <select
                value={czynnaDo}
                onChange={(e) => setCzynnaDo(e.target.value)}
                className="form-input pr-10"
              >
                <option value="">Wybierz godzinę zamknięcia</option>
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i.toString().padStart(2, '0');
                  return (
                    <option key={hour} value={`${hour}:00`}>
                      {hour}:00
                    </option>
                  );
                })}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Opis sali</label>
          <textarea
            value={opis}
            onChange={(e) => setOpis(e.target.value)}
            className="form-input"
            placeholder="Dodatkowe informacje o sali..."
            rows={4}
          />
        </div>

        <div className="flex items-center space-x-4 pt-6 border-t border-neutral-200">
          <button type="submit" className="btn btn-primary">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {submitLabel}
          </button>
          {onCancel && (
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Anuluj
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
