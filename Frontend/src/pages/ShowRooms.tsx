import { useEffect, useState } from "react";
import { getRooms } from "../services/api";

type Sala = {
  id: number;
  numer: number;
  budynek: string;
  maxOsob: number | null;
  maStanowiska: boolean | null;
  czynnaOd: string | null; 
  czynnaDo: string | null;
  opis: string | null;
  idOpiekuna: string | null;
};

export default function Sale() {
  const [sale, setSale] = useState<Sala[]>([]);

  useEffect(() => {
    document.title = "Sale";
    getRooms().then(setSale).catch(console.error);
  }, []);

  return (
    <div>
      <h1>Lista sal</h1>
        <ul>
          {sale.map((sala) => (
            <li key={sala.id}>
              <strong>Sala {sala.numer}</strong> — Budynek: {sala.budynek}<br />
              Max osób: {sala.maxOsob ?? "brak danych"}<br />
              Stanowiska: {sala.maStanowiska ? "tak" : "nie"}<br />
              Czynna: {sala.czynnaOd ?? "?"} - {sala.czynnaDo ?? "?"}<br />
              Opis: {sala.opis ?? "-"}<br />
              Opiekun ID: {sala.idOpiekuna ?? "-"}
            </li>
          ))}
        </ul>
    </div>
  );

}
