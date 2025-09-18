// Serwisy do pobierania statystyk dla admina

export const fetchUserStats = async () => {
  const { authenticatedFetch } = await import('./authService');
  const res = await authenticatedFetch("/api/account/stats");
  if (!res.ok) throw new Error("Błąd pobierania statystyk użytkowników");
  return res.json();
};

export const fetchRezerwacjeStats = async () => {
  const { authenticatedFetch } = await import('./authService');
  const res = await authenticatedFetch("/api/rezerwacja/stats");
  if (!res.ok) throw new Error("Błąd pobierania statystyk rezerwacji");
  return res.json();
};