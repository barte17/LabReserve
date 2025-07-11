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
    <div className="card">
      <h3 className="text-2xl font-semibold text-light-text mb-6">Dodaj salę</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-light-text mb-1">Numer sali</label>
          <input
            type="number"
            value={numer}
            onChange={(e) => setNumer(e.target.value)}
            required
            className="input"
            placeholder="Numer sali"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-light-text mb-1">Budynek</label>
          <input
            value={budynek}
            onChange={(e) => setBudynek(e.target.value)}
            required
            className="input"
            placeholder="Budynek"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-light-text mb-1">Max osób</label>
          <input
            type="number"
            value={maxOsob}
            onChange={(e) => setMaxOsob(e.target.value)}
            className="input"
            placeholder="Max osób"
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={maStanowiska}
            onChange={(e) => setMaStanowiska(e.target.checked)}
            className="h-4 w-4 text-light-text focus:ring-light-text border-gray-300 rounded"
          />
          <label className="ml-2 text-sm font-medium text-light-text">Czy ma stanowiska?</label>
        </div>
        <div>
          <label className="block text-sm font-medium text-light-text mb-1">Godzina otwarcia</label>
          <div className="relative group">
            <input
              type="time"
              value={czynnaOd}
              onChange={(e) => setCzynnaOd(e.target.value)}
              className="input pr-14"
            />
            <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none transition-colors group-hover:text-blue-500 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M12 7v5l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-light-text mb-1">Godzina zamknięcia</label>
          <div className="relative group">
            <input
              type="time"
              value={czynnaDo}
              onChange={(e) => setCzynnaDo(e.target.value)}
              className="input pr-12"
            />
            <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none transition-colors group-hover:text-blue-500 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M12 7v5l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-light-text mb-1">Opiekun sali</label>
          <select
            value={idOpiekuna}
            onChange={(e) => setIdOpiekuna(e.target.value)}
            className="select"
          >
            <option value="">-- Wybierz nauczyciela --</option>
            {nauczyciele.map((user) => (
              <option key={user.id} value={user.id}>
                {user.imie} {user.nazwisko}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-light-text mb-1">Opis</label>
          <textarea
            value={opis}
            onChange={(e) => setOpis(e.target.value)}
            className="input"
            placeholder="Opis"
            rows={4}
          />
        </div>
        <button type="submit" className="btn-primary">
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn ml-2" onClick={onCancel}>
            Anuluj
          </button>
        )}
      </form>
    </div>
  );
}
