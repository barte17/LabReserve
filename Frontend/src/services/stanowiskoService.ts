export const fetchStanowiska = async () => {
  const { authenticatedFetch } = await import('./authService');
  const res = await authenticatedFetch("/api/stanowisko");
  if (!res.ok) throw new Error("Błąd pobierania stanowisk");
  return await res.json();
};

export const addStanowisko = async (data: any) => {
  const { authenticatedFetch } = await import('./authService');
  const res = await authenticatedFetch("/api/stanowisko", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Błąd dodawania stanowiska");
  return await res.json();
};

export const editStanowisko = async (id: number, data: any) => {
  const { authenticatedFetch } = await import('./authService');
  const res = await authenticatedFetch(`/api/stanowisko/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Błąd edycji stanowiska");
};

export const deleteStanowisko = async (id: number) => {
  const { authenticatedFetch } = await import('./authService');
  const res = await authenticatedFetch(`/api/stanowisko/${id}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Błąd usuwania stanowiska");
};

export const fetchStanowiskoById = async (id: number) => {
  const { authenticatedFetch } = await import('./authService');
  const res = await authenticatedFetch(`/api/stanowisko/${id}`);
  if (!res.ok) throw new Error("Błąd pobierania szczegółów stanowiska");
  return await res.json();
};
