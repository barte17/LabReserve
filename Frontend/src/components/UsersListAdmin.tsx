import { useEffect, useState } from "react";
import { fetchUsers, changeUserRoles } from "../services/userService";
import { useToastContext } from "./ToastProvider";
import { LoadingTable } from "./LoadingStates";
import { useMinimumLoadingDelay } from "../hooks/useMinimumLoadingDelay";

export type User = {
  id: string;
  email: string;
  imie: string;
  nazwisko: string;
  roles: string[];
};

export default function UsersListAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);
  const [editRolesUserId, setEditRolesUserId] = useState<string | null>(null);
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const { showSuccess, showError } = useToastContext();

  const allRoles = ["Student", "Nauczyciel", "Opiekun", "Admin", "Niezatwierdzony"];
  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(() => setError("Błąd podczas pobierania użytkowników"))
      .finally(() => setLoading(false));
  }, []);


  const openEditRoles = (user: User) => {
    setEditRolesUserId(user.id);
    setEditRoles(user.roles);
  };

  const handleRoleCheckbox = (role: string) => {
    setEditRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    );
  };

  const handleSaveRoles = async () => {
    if (!editRolesUserId) return;
    setChangingRoleId(editRolesUserId);
    try {
      await changeUserRoles(editRolesUserId, editRoles);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editRolesUserId ? { ...u, roles: editRoles } : u
        )
      );
      setEditRolesUserId(null);
      showSuccess("Pomyślnie zmieniono role użytkownika");
    } catch {
      showError("Błąd podczas zmiany ról");
    } finally {
      setChangingRoleId(null);
    }
  };

  const shouldShowLoading = useMinimumLoadingDelay(loading, {
    minimumDelay: 200,
    minimumDuration: 500
  });

  if (shouldShowLoading) return <LoadingTable rows={6} columns={5} className="mt-6" />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-neutral-900 mb-2">
          Użytkownicy - Zarządzanie
        </h3>
        <p className="text-neutral-600">
          Zarządzaj rolami i uprawnieniami użytkowników
        </p>
      </div>

      {/* Filtry i wyszukiwanie */}
      <div className="filters-panel mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Wyszukaj użytkownika</label>
            <input
              type="text"
              placeholder="Imię, nazwisko, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Filtruj według roli</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="form-input"
            >
              <option value="">Wszystkie role</option>
              <option value="admin">Admin</option>
              <option value="student">Student</option>
              <option value="niezatwierdzony">Niezatwierdzony</option>
              <option value="opiekun">Opiekun</option>
              <option value="nauczyciel">Nauczyciel</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {users.filter(user => {
          const searchLower = searchTerm.toLowerCase();
          const matchesSearch = 
            user.imie.toLowerCase().includes(searchLower) ||
            user.nazwisko.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower);
          
          const matchesRole = roleFilter === "" || 
            (user.roles && user.roles.some(role => role.toLowerCase() === roleFilter.toLowerCase()));
          
          return matchesSearch && matchesRole;
        }).map((u) => (
          <div key={u.id} className="list-item animate-in">
            <div className="list-item-header">
              <div>
                <h4 className="list-item-title">
                  {u.imie} {u.nazwisko}
                </h4>
                <p className="list-item-subtitle">
                  {u.email}
                </p>
              </div>
              <div className="flex space-x-1">
                {u.roles && u.roles.length > 0 ? (
                  u.roles.map(role => (
                    <span key={role} className="badge badge-info">{role}</span>
                  ))
                ) : (
                  <span className="badge badge-neutral">Brak ról</span>
                )}
              </div>
            </div>
            
            <div className="list-item-content">
              <div className="text-sm text-neutral-600 mb-3">
                <span className="font-medium">ID:</span> {u.id}
              </div>
              
            </div>
            {editRolesUserId === u.id ? (
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {allRoles.map((role) => (
                    <label key={role} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={editRoles.includes(role)}
                        onChange={() => handleRoleCheckbox(role)}
                        disabled={changingRoleId === u.id}
                      />
                      {role}
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveRoles}
                    disabled={changingRoleId === u.id}
                    className="btn btn-success btn-sm"
                  >
                    <svg className="h-3 w-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {changingRoleId === u.id ? "Zapisywanie..." : "Zapisz"}
                  </button>
                  <button
                    onClick={() => setEditRolesUserId(null)}
                    disabled={changingRoleId === u.id}
                    className="btn btn-secondary btn-sm"
                  >
                    <svg className="h-3 w-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Anuluj
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => openEditRoles(u)}
                disabled={changingRoleId === u.id}
                className="btn btn-secondary btn-sm"
              >
                {changingRoleId === u.id ? (
                  <>
                    <div className="animate-spin h-3 w-3 border border-neutral-400 border-t-transparent rounded-full mr-2"></div>
                    Zmieniam...
                  </>
                ) : (
                  <>
                    <svg className="h-3 w-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Zmień role
                  </>
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
