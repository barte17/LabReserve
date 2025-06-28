import { useState, useEffect } from "react";

type StanowiskoFormData = {
  salaId: number;
  nazwa: string;
  typ: string;
  opis: string;
};

type SalaTyp = {
  id: number;
  numer: number;
  budynek: string;
};

export default function AddStationForm({ onSubmit }: { onSubmit: (data: StanowiskoFormData) => void }) {
  const [sale, setSale] = useState<SalaTyp[]>([]);
  const [salaId, setSalaId] = useState<number | "">("");
  const [nazwa, setNazwa] = useState("");
  const [typ, setTyp] = useState("");
  const [opis, setOpis] = useState("");

  useEffect(() => {
    fetch("/api/sala/stanowiska-dozwolone")
      .then((res) => res.json())
      .then(setSale)
      .catch(console.error);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (salaId === "") return alert("Wybierz salę");

    onSubmit({
      salaId: Number(salaId),
      nazwa,
      typ,
      opis,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Dodaj stanowisko</h3>
      <input
        placeholder="Nazwa"
        value={nazwa}
        onChange={(e) => setNazwa(e.target.value)}
        required
      />
      <input
        placeholder="Typ"
        value={typ}
        onChange={(e) => setTyp(e.target.value)}
      />
      <label>Wybierz salę</label>
      <select
        value={salaId}
        onChange={(e) => setSalaId(e.target.value === "" ? "" : parseInt(e.target.value))}
        required
      >
        <option value="">-- Wybierz salę --</option>
        {sale.map((s) => (
          <option key={s.id} value={s.id}>
            Sala {s.numer}, Budynek {s.budynek}
          </option>
        ))}
      </select>
      <textarea
        placeholder="Opis"
        value={opis}
        onChange={(e) => setOpis(e.target.value)}
      />
      <button type="submit">Dodaj</button>
    </form>
  );
}
