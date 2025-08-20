export const fetchUsers = async () => {
  const { authenticatedFetch } = await import('./authService');
  const res = await authenticatedFetch("/api/users");
  if (!res.ok) throw new Error("Błąd podczas pobierania użytkowników");
  return res.json();
};

export const changeUserRoles = async (userId: string, roles: string[]) => {
  const { authenticatedFetch } = await import('./authService');
  const res = await authenticatedFetch(`/api/users/${userId}/roles`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ roles }),
  });
  if (!res.ok) throw new Error("Błąd podczas zmiany ról użytkownika");
  return res.json();
};