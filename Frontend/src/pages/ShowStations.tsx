import { useEffect, useState } from "react";
import { getStations } from "../services/api";

type Stanowisko = {
  id: number;
  salaId: number;
  nazwa: string;
  typ: string | null;
  opis: string | null;
};

export default function Stanowiska() {
  const [stanowiska, setStanowiska] = useState<Stanowisko[]>([]);

  useEffect(() => {
    document.title = "Stanowiska";
        getStations().then(setStanowiska).catch(console.error);
  }, []);

  return (
    <div>
      <h1>Lista stanowisk</h1>
        <ul>
          {stanowiska.map((stanowisko) => (
            <li key={stanowisko.id}>
              <strong>Stanowisko id: {stanowisko.id}</strong> — W sali o id: {stanowisko.salaId}<br />
              Nazwa: {stanowisko.nazwa}<br />
              Typ stanowiska: {stanowisko.typ ?? "brak danych"}<br />
              Opis: {stanowisko.opis ?? "-"}<br />
            </li>
          ))}
        </ul>
    </div>
  );
}
