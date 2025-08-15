import { useState, useEffect } from "react";
import { useToastContext } from "../ToastProvider";

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
  const { showWarning } = useToastContext();

  useEffect(() => {
    fetch("/api/sala/stanowiska-dozwolone")
      .then((res) => res.json())
      .then(setSale)
      .catch(console.error);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (salaId === "") {
      showWarning("Wybierz salę");
      return;
    }

    onSubmit({
      salaId: Number(salaId),
      nazwa,
      typ,
      opis,
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-neutral-900 mb-2">
          {initialData ? 'Edytuj stanowisko' : 'Dodaj nowe stanowisko'}
        </h3>
        <p className="text-neutral-600">
          Wypełnij formularz, aby {initialData ? 'zaktualizować' : 'dodać'} stanowisko laboratoryjne do systemu
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label">Nazwa laboratorium</label>
            <input
              value={nazwa}
              onChange={(e) => setNazwa(e.target.value)}
              required
              className="form-input"
              placeholder="Wprowadź nazwę laboratorium"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Typ laboratorium</label>
            <input
              value={typ}
              onChange={(e) => setTyp(e.target.value)}
              className="form-input"
              placeholder="np. Informatyczne, Chemiczne, Fizyczne"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Przypisz do sali</label>
          <select
            value={salaId}
            onChange={(e) => setSalaId(e.target.value === "" ? "" : parseInt(e.target.value))}
            required
            className="form-input"
          >
            <option value="">-- Wybierz salę --</option>
            {sale.map((s) => (
              <option key={s.id} value={s.id}>
                Sala {s.numer} - Budynek {s.budynek}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Opis laboratorium</label>
          <textarea
            value={opis}
            onChange={(e) => setOpis(e.target.value)}
            className="form-input"
            placeholder="Dodatkowe informacje o laboratorium, wyposażenie, specyfikacja..."
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