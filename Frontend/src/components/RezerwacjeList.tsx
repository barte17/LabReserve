// components/RezerwacjeList.tsx

import { useEffect, useState } from "react";

type Rezerwacja = {
  id: number;
  salaId: number | null;
  stanowiskoId: number | null;
  uzytkownikId: string;
  dataStart: string;
  dataKoniec: string;
  opis?: string;
  status: string;
};

export default function RezerwacjeList() {
  const [rezerwacje, setRezerwacje] = useState<Rezerwacja[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rezerwacja")
      .then((res) => res.json())
      .then((data) => setRezerwacje(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Ładowanie rezerwacji...</p>;

  if (rezerwacje.length === 0)
    return <p className="text-gray-500">Brak rezerwacji do wyświetlenia.</p>;

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Lista rezerwacji</h3>
      <ul className="space-y-2">
        {rezerwacje.map((r) => (
          <li key={r.id} className="border p-4 rounded shadow-sm">
            <p>
              <strong>Użytkownik:</strong> {r.uzytkownikId}
            </p>
            <p>
              <strong>Typ:</strong>{" "}
              {r.salaId ? "Sala" : "Stanowisko"}{" "}
              {r.salaId || r.stanowiskoId}
            </p>
            <p>
              <strong>Od:</strong> {new Date(r.dataStart).toLocaleString()}
            </p>
            <p>
              <strong>Do:</strong> {new Date(r.dataKoniec).toLocaleString()}
            </p>
            {r.opis && <p><strong>Opis:</strong> {r.opis}</p>}
            <p>
              <strong>Status:</strong>{" "}
              <span className="text-blue-600 font-medium">{r.status}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
