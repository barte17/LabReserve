import { useEffect, useState } from "react";
import { fetchUsers, changeUserRoles } from "../services/userService";

export type User = {
  id: string;
  email: string;
  imie: string;
  nazwisko: string;
  roles: string[];
};

export default function UsersListAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);
  const [editRolesUserId, setEditRolesUserId] = useState<string | null>(null);
  const [editRoles, setEditRoles] = useState<string[]>([]);

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
    } catch {
      alert("Błąd podczas zmiany ról");
    } finally {
      setChangingRoleId(null);
    }
  };

  if (loading) return <p>Ładowanie użytkowników...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto px-2">
      <h3 className="text-2xl font-bold mb-6 mt-4 text-center">Lista użytkowników</h3>
      <ul>
        {users.map((u) => (
          <li key={u.id} className="rezerwacja-card flex items-center justify-between">
            <div>
              <p><strong>ID:</strong> {u.id}</p>
              <p><strong>Email:</strong> {u.email}</p>
              <p><strong>Imię:</strong> {u.imie}</p>
              <p><strong>Nazwisko:</strong> {u.nazwisko}</p>
              <p><strong>Role:</strong> {u.roles && u.roles.length > 0 ? u.roles.join(", ") : "-"}</p>
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
                    className="rezerwacja-btn rezerwacja-btn-edit bg-green-500 hover:bg-green-600 text-white"
                    onClick={handleSaveRoles}
                    disabled={changingRoleId === u.id}
                  >
                    {changingRoleId === u.id ? "Zapisywanie..." : "Zapisz"}
                  </button>
                  <button
                    className="rezerwacja-btn rezerwacja-btn-delete bg-gray-300 hover:bg-gray-400 text-black"
                    onClick={() => setEditRolesUserId(null)}
                    disabled={changingRoleId === u.id}
                  >
                    Anuluj
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="rezerwacja-btn rezerwacja-btn-edit bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => openEditRoles(u)}
                disabled={changingRoleId === u.id}
              >
                {changingRoleId === u.id ? "Zmiana..." : "Zmień role"}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
