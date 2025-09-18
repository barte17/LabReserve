import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddStationForm from "./forms/AddStationForm";
import { fetchStanowiska, editStanowisko, deleteStanowisko, fetchStanowiskoById } from "../services/stanowiskoService";
import { useToastContext } from "./ToastProvider";
import { LoadingTable } from "./LoadingStates";
import { useMinimumLoadingDelay } from "../hooks/useMinimumLoadingDelay";

type Stanowisko = {
  id: number;
  salaId: number;
  nazwa: string;
  typ: string | null;
  opis: string | null;
};

export default function StanowiskaListAdmin() {
  const [stanowiska, setStanowiska] = useState<Stanowisko[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"id" | "nazwa" | "salaId">("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [editingStanowisko, setEditingStanowisko] = useState<Stanowisko | null>(null);
  const [editingStanowiskoDetails, setEditingStanowiskoDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { showSuccess, showError } = useToastContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStanowiska()
      .then((data) => setStanowiska(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Na pewno usunąć stanowisko?")) return;
    try {
      await deleteStanowisko(id);
      setStanowiska((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = async (stanowisko: Stanowisko) => {
    setEditingStanowisko(stanowisko);
    setLoadingDetails(true);
    try {
      const details = await fetchStanowiskoById(stanowisko.id);
      setEditingStanowiskoDetails(details);
    } catch (error) {
      console.error("Błąd pobierania szczegółów stanowiska:", error);
      showError("Błąd pobierania szczegółów stanowiska");
      setEditingStanowisko(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleEditSubmit = async (data: any) => {
    if (!editingStanowisko) return;
    try {
      await editStanowisko(editingStanowisko.id, data);
      setStanowiska((prev) => prev.map((s) => (s.id === editingStanowisko.id ? { ...s, ...data } : s)));
      setEditingStanowisko(null);
      setEditingStanowiskoDetails(null);
      showSuccess("Pomyślnie zaktualizowano stanowisko");
    } catch (e) {
      console.error(e);
      showError("Błąd podczas edycji stanowiska");
    }
  };

  // Filtrowanie i wyszukiwanie
  let filtered = stanowiska.filter((s) => {
    const matchesSearch =
      s.id.toString().includes(search) ||
      s.salaId.toString().includes(search) ||
      s.nazwa.toLowerCase().includes(search.toLowerCase()) ||
      (s.typ?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (s.opis?.toLowerCase().includes(search.toLowerCase()) ?? false);
    return matchesSearch;
  });

  // Sortowanie
  filtered = filtered.sort((a, b) => {
    let aVal: string | number = a[sortKey];
    let bVal: string | number = b[sortKey];
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    } else {
      return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    }
  });

  const shouldShowLoading = useMinimumLoadingDelay(loading, {
    minimumDelay: 200,
    minimumDuration: 500
  });

  if (shouldShowLoading) return <LoadingTable rows={5} columns={6} className="mt-6" />;

  if (editingStanowisko) {
    if (loadingDetails) {
      return (
        <div className="max-w-3xl mx-auto px-2">
          <h3 className="text-2xl font-bold mb-6 mt-4 text-center">Edytuj stanowisko</h3>
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-600">Ładowanie szczegółów stanowiska...</div>
          </div>
        </div>
      );
    }

    if (!editingStanowiskoDetails) {
      return (
        <div className="max-w-3xl mx-auto px-2">
          <h3 className="text-2xl font-bold mb-6 mt-4 text-center">Edytuj stanowisko</h3>
          <div className="flex justify-center items-center py-8">
            <div className="text-red-600">Błąd ładowania szczegółów stanowiska</div>
          </div>
        </div>
      );
    }

    // Konwersja null na pusty string dla typ i opis
    const initialData = {
      ...editingStanowisko,
      typ: editingStanowisko.typ ?? "",
      opis: editingStanowisko.opis ?? "",
    };

    // Przygotowanie listy istniejących zdjęć
    const existingImages = editingStanowiskoDetails.zdjecia?.map((zdjecie: any) => ({
      id: zdjecie.id,
      url: zdjecie.url
    })) || [];

    return (
      <div className="max-w-3xl mx-auto px-2">
        <h3 className="text-2xl font-bold mb-6 mt-4 text-center">Edytuj stanowisko</h3>
        <AddStationForm
          onSubmit={handleEditSubmit}
          initialData={initialData}
          existingImages={existingImages}
          submitLabel="Zapisz zmiany"
          onCancel={() => {
            setEditingStanowisko(null);
            setEditingStanowiskoDetails(null);
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="filters-panel mb-6">
        <div className="form-group">
          <label className="form-label">Wyszukaj stanowisko</label>
          <input
            type="text"
            className="form-input"
            placeholder="ID, sala, nazwa, typ, opis..."
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
              onChange={e => setSortKey(e.target.value as "id" | "nazwa" | "salaId")}
            >
              <option value="id">ID stanowiska</option>
              <option value="nazwa">Nazwa</option>
              <option value="salaId">ID sali</option>
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
      </div>
      <div className="space-y-4">
        {filtered.map((s) => (
          <div key={s.id} className="list-item animate-in">
            <div>
              <p><strong>ID stanowiska:</strong> {s.id}</p>
              <p><strong>ID sali:</strong> {s.salaId}</p>
              <p><strong>Nazwa:</strong> {s.nazwa}</p>
              <p><strong>Typ:</strong> {s.typ ?? "-"}</p>
              <p><strong>Opis:</strong> {s.opis ?? "-"}</p>
            </div>
            <div className="list-item-actions">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate(`/stanowisko/${s.id}`)}
                  className="btn btn-primary btn-sm"
                >
                  <svg className="h-3 w-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Przejdź do strony stanowiska
                </button>
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
