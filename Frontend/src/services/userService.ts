export const fetchUsers = async () => {
  const res = await fetch("/api/users");
  if (!res.ok) throw new Error("Błąd podczas pobierania użytkowników");
  return res.json();
};

export const changeUserRoles = async (userId: string, roles: string[]) => {
  const res = await fetch(`/api/users/${userId}/roles`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roles }),
  });
  if (!res.ok) throw new Error("Błąd podczas zmiany ról użytkownika");
  return res.json();
};