import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddStationForm from "./forms/AddStationForm";
import { fetchStanowiska, editStanowisko, deleteStanowisko, fetchStanowiskoById, addStanowisko } from "../services/stanowiskoService";
import { useToastContext } from "./ToastProvider";
import { LoadingTable, LoadingSpinner } from "./LoadingStates";
import { useMinimumLoadingDelay } from "../hooks/useMinimumLoadingDelay";

type Stanowisko = {
  id: number;
  salaId: number;
  nazwa: string;
  typ: string | null;
  opis: string | null;
};

interface StanowiskaListAdminProps {
  autoAdd?: boolean;
  onAutoAddProcessed?: () => void;
}

export default function StanowiskaListAdmin({ autoAdd = false, onAutoAddProcessed }: StanowiskaListAdminProps = {}) {
  const [stanowiska, setStanowiska] = useState<Stanowisko[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"id" | "nazwa" | "salaId">("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [editingStanowisko, setEditingStanowisko] = useState<Stanowisko | null>(null);
  const [editingStanowiskoDetails, setEditingStanowiskoDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { showSuccess, showError } = useToastContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStanowiska()
      .then((data) => setStanowiska(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Handle autoAdd
  useEffect(() => {
    if (autoAdd) {
      setShowAddForm(true);
      if (onAutoAddProcessed) {
        onAutoAddProcessed();
      }
    }
  }, [autoAdd, onAutoAddProcessed]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Na pewno usunąć stanowisko?")) return;
    setDeletingId(id);
    try {
      await deleteStanowisko(id);
      setStanowiska((prev) => prev.filter((s) => s.id !== id));
      showSuccess("Pomyślnie usunięto stanowisko");
    } catch (e) {
      console.error(e);
      showError("Błąd podczas usuwania stanowiska");
    } finally {
      setDeletingId(null);
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
    setIsEditing(true);
    try {
      await editStanowisko(editingStanowisko.id, data);
      setStanowiska((prev) => prev.map((s) => (s.id === editingStanowisko.id ? { ...s, ...data } : s)));
      setEditingStanowisko(null);
      setEditingStanowiskoDetails(null);
      showSuccess("Pomyślnie zaktualizowano stanowisko");
    } catch (e) {
      console.error(e);
      showError("Błąd podczas edycji stanowiska");
    } finally {
      setIsEditing(false);
    }
  };

  const handleAddSubmit = async (data: any) => {
    setIsAdding(true);
    try {
      await addStanowisko(data);
      const updatedStanowiska = await fetchStanowiska();
      setStanowiska(updatedStanowiska);
      setShowAddForm(false);
      showSuccess("Pomyślnie dodano stanowisko");
    } catch (e) {
      console.error(e);
      showError("Błąd podczas dodawania stanowiska");
    } finally {
      setIsAdding(false);
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

  // Paginacja
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStanowiska = filtered.slice(startIndex, startIndex + itemsPerPage);

  // Reset strony gdy zmienia się filtr
  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortKey, sortDir]);

  const shouldShowLoading = useMinimumLoadingDelay(loading, {
    minimumDelay: 200,
    minimumDuration: 500
  });

  if (shouldShowLoading) return <LoadingTable rows={5} columns={6} className="mt-6" />;

  // Formularz dodawania stanowiska
  if (showAddForm) {
    return (
      <div className="max-w-3xl mx-auto px-2">
        <AddStationForm
          onSubmit={handleAddSubmit}
          submitLabel="Dodaj stanowisko"
          isLoading={isAdding}
          onCancel={() => setShowAddForm(false)}
        />
      </div>
    );
  }

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
          isLoading={isEditing}
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="block text-sm font-semibold mb-1 text-gray-700">Wyszukaj stanowisko</label>
              <input
                type="text"
                className="form-input h-10"
                placeholder="ID, sala, nazwa, typ, opis..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Sortuj według</label>
              <div className="flex items-center gap-2 h-10">
                <select
                  className="select flex-1 h-10"
                  value={sortKey}
                  onChange={e => setSortKey(e.target.value as "id" | "nazwa" | "salaId")}
                >
                  <option value="id">ID stanowiska</option>
                  <option value="nazwa">Nazwa</option>
                  <option value="salaId">ID sali</option>
                </select>
                <button
                  className="px-3 py-2 border border-gray-300 rounded bg-gray-100 hover:bg-gray-200 transition-colors h-10 flex items-center justify-center"
                  onClick={() => setSortDir(d => (d === "asc" ? "desc" : "asc"))}
                  title="Zmień kierunek sortowania"
                >
                  {sortDir === "asc" ? "▲" : "▼"}
                </button>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 whitespace-nowrap h-10"
            >
              <span>➕</span>
              <span>Dodaj stanowisko</span>
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {paginatedStanowiska.map((s) => (
          <div key={s.id} className="list-item animate-in flex flex-col">
            {/* Sekcja informacji - flex-grow wypełnia dostępną przestrzeń */}
            <div className="flex-grow">
              <p><strong>ID stanowiska:</strong> {s.id}</p>
              <p><strong>ID sali:</strong> {s.salaId}</p>
              <p><strong>Nazwa:</strong> {s.nazwa}</p>
              <p><strong>Typ:</strong> {s.typ ?? "-"}</p>
              <p><strong>Opis:</strong> {s.opis ?? "-"}</p>
            </div>

            {/* Sekcja akcji - zawsze na dole, jednakowa wysokość */}
            <div className="list-item-actions mt-auto">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 w-full">
                <button
                  onClick={() => navigate(`/stanowisko/${s.id}`)}
                  className="btn btn-primary btn-sm flex-1 sm:flex-none text-center"
                >
                  <svg className="h-3 w-3 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span className="hidden sm:inline">Przejdź do strony stanowiska</span>
                  <span className="sm:hidden">Strona stanowiska</span>
                </button>
                <button
                  onClick={() => handleEdit(s)}
                  className="btn btn-secondary btn-sm flex-1 sm:flex-none text-center"
                >
                  <svg className="h-3 w-3 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edytuj
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  disabled={deletingId === s.id}
                  className="btn btn-danger btn-sm flex-1 sm:flex-none text-center disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
                >
                  {deletingId === s.id ? (
                    <>
                      <LoadingSpinner size="sm" color="white" className="mr-2" />
                      Usuwanie...
                    </>
                  ) : (
                    <>
                      <svg className="h-3 w-3 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Usuń
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginacja */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Wyświetlanie {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filtered.length)} z {filtered.length} stanowisk
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Poprzednia
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`btn btn-sm ${currentPage === page
                  ? 'btn-primary'
                  : 'btn-secondary'
                  }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Następna
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
