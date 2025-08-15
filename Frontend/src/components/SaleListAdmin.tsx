import { useEffect, useState } from "react";
import { fetchSale, editSala, deleteSala } from "../services/salaService";
import AddSalaForm from "./forms/AddRoomForm";
import { useToastContext } from "./ToastProvider";

type Sala = {
  id: number;
  numer: number;
  budynek: string;
  maxOsob: number | null;
  maStanowiska: boolean;
  czynnaOd: string | null;
  czynnaDo: string | null;
  opis?: string;
  idOpiekuna: string | null;
  imieOpiekuna?: string | null;
  nazwiskoOpiekuna?: string | null;
};

type Props = {
  onEdit?: (sala: Sala) => void;
};

export default function SaleListAdmin({ onEdit }: Props) {
  const [sale, setSale] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"budynekA" | "budynekB" | "maxOsobAsc" | "maxOsobDesc">("budynekA");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [stanowiskaFilter, setStanowiskaFilter] = useState<"" | "tak" | "nie">("");
  const [editingSala, setEditingSala] = useState<Sala | null>(null);
  const { showSuccess, showError } = useToastContext();

  useEffect(() => {
    fetchSale()
      .then((data) => setSale(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Resetuj edycję jeśli komponent jest montowany na nowo (np. po zmianie widoku)
  useEffect(() => {
    setEditingSala(null);
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Na pewno usunąć salę?")) return;
    try {
      await deleteSala(id);
      setSale((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (sala: Sala) => {
    setEditingSala(sala);
  };

  const handleEditSubmit = async (data: any) => {
    if (!editingSala) return;
    try {
      await editSala(editingSala.id, data);
      const updatedSale = await fetchSale();
      setSale(updatedSale);
      setEditingSala(null);
      showSuccess("Pomyślnie zaktualizowano salę");
    } catch (e) {
      console.error(e);
      showError("Błąd podczas edycji sali");
    }
  };

  // Filtrowanie i wyszukiwanie
  let filtered = sale.filter((s) => {
    const opiekunFullName = (s.imieOpiekuna && s.nazwiskoOpiekuna) ? `${s.imieOpiekuna} ${s.nazwiskoOpiekuna}`.toLowerCase() : "";
    const matchesSearch =
      s.id.toString().includes(search) ||
      s.numer.toString().includes(search) ||
      s.budynek.toLowerCase().includes(search.toLowerCase()) ||
      opiekunFullName.includes(search.toLowerCase()) ||
      (s.opis?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesStanowiska = stanowiskaFilter
      ? stanowiskaFilter === "tak"
        ? s.maStanowiska
        : !s.maStanowiska
      : true;
    return matchesSearch && matchesStanowiska;
  });

  // Sortowanie
  filtered = filtered.sort((a, b) => {
    if (sortKey === "budynekA") {
      return a.budynek.localeCompare(b.budynek);
    } else if (sortKey === "budynekB") {
      return b.budynek.localeCompare(a.budynek);
    } else if (sortKey === "maxOsobAsc") {
      return (a.maxOsob ?? 0) - (b.maxOsob ?? 0);
    } else if (sortKey === "maxOsobDesc") {
      return (b.maxOsob ?? 0) - (a.maxOsob ?? 0);
    }
    return 0;
  });

  if (loading) return <p>Ładowanie sal...</p>;

  if (editingSala) {
    return (
      <div className="max-w-3xl mx-auto px-2">
        <h3 className="text-2xl font-bold mb-6 mt-4 text-center">Edytuj salę</h3>
        <AddSalaForm
          onSubmit={handleEditSubmit}
          initialData={editingSala}
          submitLabel="Zapisz zmiany"
          onCancel={() => setEditingSala(null)}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-neutral-900 mb-2">
          Sale uczelniane - zarządzanie
        </h3>
        <p className="text-neutral-600">
          Edytuj i zarządzaj salami uczelnianymi w systemie
        </p>
      </div>
      <div className="filters-panel mb-6">
        <div className="form-group">
          <label className="form-label">Wyszukaj salę</label>
          <input
            type="text"
            className="form-input"
            placeholder="Numer, budynek, opiekun, opis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Sortuj wg</label>
          <select
            className="select"
            value={sortKey}
            onChange={e => setSortKey(e.target.value as any)}
          >
            <option value="budynekA">Budynek A</option>
            <option value="budynekB">Budynek B</option>
            <option value="maxOsobAsc">Maks osób rosnąco</option>
            <option value="maxOsobDesc">Maks osób malejąco</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Stanowiska</label>
          <select
            className="select"
            value={stanowiskaFilter}
            onChange={e => setStanowiskaFilter(e.target.value as "" | "tak" | "nie")}
          >
            <option value="">Wszystkie</option>
            <option value="tak">Z stanowiskami</option>
            <option value="nie">Bez stanowisk</option>
          </select>
        </div>
      </div>
      <div className="space-y-4">
        {filtered.map((s) => (
          <div key={s.id} className="list-item animate-in">
            <div className="list-item-header">
              <div>
                <h4 className="list-item-title">
                  Sala {s.numer}
                </h4>
                <p className="list-item-subtitle">
                  Budynek: {s.budynek}
                </p>
              </div>
              <div className="flex space-x-2">
                {s.maStanowiska && (
                  <span className="badge badge-info">
                    Z laboratoriami
                  </span>
                )}
                <span className="badge badge-neutral">
                  ID: {s.id}
                </span>
              </div>
            </div>

            <div className="list-item-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-neutral-700">Pojemność:</span>
                  <span className="text-neutral-600 ml-2">
                    {s.maxOsob ? `${s.maxOsob} osób` : "Nie podano"}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-neutral-700">Opiekun:</span>
                  <span className="text-neutral-600 ml-2">
                    {s.imieOpiekuna && s.nazwiskoOpiekuna ? `${s.imieOpiekuna} ${s.nazwiskoOpiekuna}` : "Nie przypisano"}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-neutral-700">Godziny pracy:</span>
                  <span className="text-neutral-600 ml-2">
                    {s.czynnaOd && s.czynnaDo ? `${s.czynnaOd} - ${s.czynnaDo}` : "Nie podano"}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-neutral-700">Stanowiska:</span>
                  <span className="text-neutral-600 ml-2">
                    {s.maStanowiska ? "Tak" : "Nie"}
                  </span>
                </div>
              </div>
              
              {s.opis && (
                <div className="mt-3">
                  <span className="font-medium text-neutral-700">Opis:</span>
                  <p className="text-neutral-600 mt-1">{s.opis}</p>
                </div>
              )}
            </div>
            <div className="list-item-actions">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(s)}
                  className="btn btn-secondary btn-sm"
                >
                  <svg className="h-3 w-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edytuj
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="btn btn-danger btn-sm"
                >
                  <svg className="h-3 w-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Usuń
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
