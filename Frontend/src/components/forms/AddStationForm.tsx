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

export default function AddStationForm({ onSubmit, initialData, submitLabel = "Dodaj", onCancel }: {
  onSubmit: (data: StanowiskoFormData) => void;
  initialData?: Partial<StanowiskoFormData>;
  submitLabel?: string;
  onCancel?: () => void;
}) {
  const [sale, setSale] = useState<SalaTyp[]>([]);
  const [salaId, setSalaId] = useState<number | "">(initialData?.salaId ?? "");
  const [nazwa, setNazwa] = useState(initialData?.nazwa ?? "");
  const [typ, setTyp] = useState(initialData?.typ ?? "");
  const [opis, setOpis] = useState(initialData?.opis ?? "");

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
    <div className="card">
      <h3 className="text-2xl font-semibold text-light-text mb-6">Dodaj stanowisko</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-light-text mb-1">Nazwa</label>
          <input
            value={nazwa}
            onChange={(e) => setNazwa(e.target.value)}
            required
            className="input"
            placeholder="Nazwa"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-light-text mb-1">Typ</label>
          <input
            value={typ}
            onChange={(e) => setTyp(e.target.value)}
            className="input"
            placeholder="Typ"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-light-text mb-1">Wybierz salę</label>
          <select
            value={salaId}
            onChange={(e) => setSalaId(e.target.value === "" ? "" : parseInt(e.target.value))}
            required
            className="select"
          >
            <option value="">-- Wybierz salę --</option>
            {sale.map((s) => (
              <option key={s.id} value={s.id}>
                Sala {s.numer}, Budynek {s.budynek}
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