// components/RezerwacjeList.tsx

import { useEffect, useState } from "react";

type Rezerwacja = {
  id: number;
  salaId: number | null;
  stanowiskoId: number | null;
  uzytkownikId: string;
  dataStart: string;
  dataKoniec: string;
  dataUtworzenia: string; // <-- dodaj to pole
  opis?: string;
  status: string;
};

export default function RezerwacjeList() {
  const [rezerwacje, setRezerwacje] = useState<Rezerwacja[]>([]);
  const [loading, setLoading] = useState(true);

  // Nowe stany do wyszukiwania, sortowania i filtrowania
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"dataUtworzenia" | "dataStart">("dataUtworzenia");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<"" | "oczekujące" | "zaakceptowano" | "odrzucono">("");

  useEffect(() => {
    fetch("/api/rezerwacja")
      .then((res) => res.json())
      .then((data) => setRezerwacje(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/rezerwacja/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRezerwacje((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteRezerwacja = async (id: number) => {
    try {
      const res = await fetch(`/api/rezerwacja/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRezerwacje((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <p>Ładowanie rezerwacji...</p>;

  // Filtrowanie i wyszukiwanie
  let filtered = rezerwacje.filter(r => {
    const matchesStatus = statusFilter ? r.status === statusFilter : true;
    const matchesSearch =
      r.uzytkownikId.toLowerCase().includes(search.toLowerCase()) ||
      (r.opis?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (r.salaId ? `Sala ${r.salaId}` : `Stanowisko ${r.stanowiskoId}`).toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Sortowanie
  filtered = filtered.sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  // Podział rezerwacji według statusu (po filtrach)
  const oczekujace = filtered.filter(r => r.status === "oczekujące");
  const zaakceptowane = filtered.filter(r => r.status === "zaakceptowano");
  const odrzucone = filtered.filter(r => r.status === "odrzucono");

  return (
    <div className="max-w-3xl mx-auto px-2">
      <h3 className="text-2xl font-bold mb-6 mt-4 text-center">Lista rezerwacji</h3>
      {/* Panel wyszukiwania, sortowania i filtrowania */}
      <div className="rezerwacje-filters">
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Wyszukaj</label>
          <input
            type="text"
            className="input"
            placeholder="Użytkownik, opis, sala/stanowisko..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Sortuj wg</label>
          <div className="flex items-center">
            <select
              className="select"
              value={sortKey}
              onChange={e => setSortKey(e.target.value as "dataUtworzenia" | "dataStart")}
            >
              <option value="dataUtworzenia">Data dodania</option>
              <option value="dataStart">Data rozpoczęcia</option>
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
          <label className="block text-sm font-semibold mb-1 text-gray-700">Status</label>
          <select
            className="select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as "" | "oczekujące" | "zaakceptowano" | "odrzucono")}
          >
            <option value="">Wszystkie</option>
            <option value="oczekujące">Oczekujące</option>
            <option value="zaakceptowano">Zaakceptowane</option>
            <option value="odrzucono">Odrzucone</option>
          </select>
        </div>
      </div>
      <div>
        {renderList(oczekujace, "Oczekujące")}
        {oczekujace.length > 0 && <hr className="my-8" />}
        {renderList(zaakceptowane, "Zaakceptowane")}
        {zaakceptowane.length > 0 && <hr className="my-8" />}
        {renderList(odrzucone, "Odrzucone")}
      </div>
    </div>
  );

  // renderList z nowymi klasami:
  function renderList(lista: Rezerwacja[], label: string) {
    return (
      <>
        {lista.length > 0 && (
          <>
            <h4 className="rezerwacje-section-title">{label}</h4>
            <ul>
              {lista.map((r) => (
                <li key={r.id} className="rezerwacja-card">
                  <div>
                    <p>
                      <strong>ID rezerwacji:</strong> {r.id}
                    </p>
                    <p>
                      <strong>Użytkownik:</strong> {r.uzytkownikId}
                    </p>
                    <p>
                      <strong>Typ:</strong>{" "}
                      {r.salaId ? "Sala" : "Stanowisko"} {r.salaId || r.stanowiskoId}
                    </p>
                    <p>
                      <strong>Dodano:</strong> {new Date(r.dataUtworzenia).toLocaleString()}
                    </p>
                    <p>
                      <strong>Od:</strong> {new Date(r.dataStart).toLocaleString()}
                    </p>
                    <p>
                      <strong>Do:</strong> {new Date(r.dataKoniec).toLocaleString()}
                    </p>
                    {r.opis && (
                      <p>
                        <strong>Opis:</strong> {r.opis}
                      </p>
                    )}
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className="text-blue-600 font-medium">{r.status}</span>
                    </p>
                  </div>
                  <div className="rezerwacja-actions">
                    <button
                      className="rezerwacja-btn rezerwacja-btn-accept"
                      onClick={() => updateStatus(r.id, "zaakceptowano")}
                      disabled={r.status === "zaakceptowano"}
                    >
                      Zaakceptuj
                    </button>
                    <button
                      className="rezerwacja-btn rezerwacja-btn-reject"
                      onClick={() => updateStatus(r.id, "odrzucono")}
                      disabled={r.status === "odrzucono"}
                    >
                      Odrzuć
                    </button>
                    <button
                      className="rezerwacja-btn rezerwacja-btn-delete"
                      onClick={() => deleteRezerwacja(r.id)}
                    >
                      Usuń
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </>
    );
  }
}
