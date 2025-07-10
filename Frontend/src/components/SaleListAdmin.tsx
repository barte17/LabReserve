import { useEffect, useState } from "react";
import { fetchSale, editSala, deleteSala } from "../services/salaService";
import AddSalaForm from "./forms/AddRoomForm";

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
      setSale((prev) => prev.map((s) => (s.id === editingSala.id ? { ...s, ...data } : s)));
      setEditingSala(null);
    } catch (e) {
      console.error(e);
      alert("Błąd podczas edycji sali");
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
    <div className="max-w-3xl mx-auto px-2">
      <h3 className="text-2xl font-bold mb-6 mt-4 text-center">Lista sal</h3>
      <div className="rezerwacje-filters">
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Wyszukaj</label>
          <input
            type="text"
            className="input"
            placeholder="Numer, budynek, opiekun, opis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Sortuj wg</label>
          <div className="flex items-center">
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
            <button
              className="ml-2 px-2 py-2 border border-gray-300 rounded bg-gray-100 hover:bg-gray-200"
              onClick={() => setSortDir(d => (d === "asc" ? "desc" : "asc"))}
              title="Zmień kierunek sortowania"
            >
              {sortDir === "asc" ? "▲" : "▼"}
            </button>
          </div>
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
      <ul>
        {filtered.map((s) => (
          <li key={s.id} className="rezerwacja-card">
            <div>
              <p><strong>ID sali:</strong> {s.id}</p>
              <p><strong>Numer:</strong> {s.numer}</p>
              <p><strong>Budynek:</strong> {s.budynek}</p>
              <p><strong>Maks. osób:</strong> {s.maxOsob ?? "-"}</p>
              <p><strong>Stanowiska:</strong> {s.maStanowiska ? "Tak" : "Nie"}</p>
              <p><strong>Czynna od:</strong> {s.czynnaOd ?? "-"}</p>
              <p><strong>Czynna do:</strong> {s.czynnaDo ?? "-"}</p>
              <p><strong>Opiekun:</strong> {s.imieOpiekuna && s.nazwiskoOpiekuna ? `${s.imieOpiekuna} ${s.nazwiskoOpiekuna}` : "brak"}</p>
              {s.opis && <p><strong>Opis:</strong> {s.opis}</p>}
            </div>
            <div className="rezerwacja-actions">
              <button
                className="rezerwacja-btn rezerwacja-btn-edit bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => handleEdit(s)}
              >
                Edytuj
              </button>
              <button
                className="rezerwacja-btn rezerwacja-btn-delete"
                onClick={() => handleDelete(s.id)}
              >
                Usuń
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
