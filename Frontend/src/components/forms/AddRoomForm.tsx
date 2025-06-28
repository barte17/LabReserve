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

export default function AddRoomForm({ onSubmit }: { onSubmit: (data: SalaFormData) => void }) {
  const [numer, setNumer] = useState("");
  const [budynek, setBudynek] = useState("");
  const [maxOsob, setMaxOsob] = useState("");
  const [maStanowiska, setMaStanowiska] = useState(false);
  const [czynnaOd, setCzynnaOd] = useState("");
  const [czynnaDo, setCzynnaDo] = useState("");
  const [opis, setOpis] = useState("");

  const [idOpiekuna, setIdOpiekuna] = useState("");
  const [nauczyciele, setNauczyciele] = useState<User[]>([]);

  useEffect(() => {
    fetch("/api/users/teachers")
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
    <form onSubmit={handleSubmit}>
      <h3>Dodaj salę</h3>
      <input
        placeholder="Numer sali"
        type="number"
        value={numer}
        onChange={e => setNumer(e.target.value)}
        required
      />
      <input
        placeholder="Budynek"
        value={budynek}
        onChange={e => setBudynek(e.target.value)}
        required
      />
      <input
        placeholder="Max osób"
        type="number"
        value={maxOsob}
        onChange={e => setMaxOsob(e.target.value)}
      />
      <label>
        <input
          type="checkbox"
          checked={maStanowiska}
          onChange={e => setMaStanowiska(e.target.checked)}
        />
        Czy ma stanowiska?
      </label>
      <label>
        Godzina otwarcia:
        <input
          type="time"
          value={czynnaOd}
          onChange={e => setCzynnaOd(e.target.value)}
        />
      </label>
      <label>
        Godzina zamknięcia:
        <input
          type="time"
          value={czynnaDo}
          onChange={e => setCzynnaDo(e.target.value)}
        />
      </label>
      <label>Opiekun sali (Nauczyciel):</label>
      <select value={idOpiekuna} onChange={e => setIdOpiekuna(e.target.value)}>
        <option value="">-- wybierz nauczyciela --</option>
        {nauczyciele.map(user => (
          <option key={user.id} value={user.id}>
            {user.imie} {user.nazwisko}
          </option>
        ))}
      </select>
      <textarea
        placeholder="Opis"
        value={opis}
        onChange={e => setOpis(e.target.value)}
      />
      <button type="submit">Dodaj</button>
    </form>
  );
}
