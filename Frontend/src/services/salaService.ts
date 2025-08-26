export const fetchSale = async () => {
  const { authenticatedFetch } = await import('./authService');
  const res = await authenticatedFetch("/api/sala");
  if (!res.ok) throw new Error("Błąd pobierania sal");
  return await res.json();
};

export const addSala = async (data: any) => {
  const { authenticatedFetch } = await import('./authService');
  
  // Przygotowanie FormData dla plików
  const formData = new FormData();
  
  // Dodanie danych formularza
  Object.keys(data).forEach(key => {
    if (key === 'zdjecia' && data[key]) {
      // Dodanie plików
      data[key].forEach((file: File) => {
        formData.append('zdjecia', file);
      });
    } else if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key].toString());
    }
  });

  const res = await authenticatedFetch("/api/sala", {
    method: "POST",
    body: formData, // Bez Content-Type - browser ustawi automatycznie z boundary
  });
  if (!res.ok) throw new Error("Błąd dodawania sali");
  return await res.json();
};

export const editSala = async (id: number, data: any) => {
  const { authenticatedFetch } = await import('./authService');
  const res = await authenticatedFetch(`/api/sala/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Błąd edycji sali");
};

export const deleteSala = async (id: number) => {
  const { authenticatedFetch } = await import('./authService');
  const res = await authenticatedFetch(`/api/sala/${id}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Błąd usuwania sali");
};

export const fetchSalaById = async (id: number) => {
  const { authenticatedFetch } = await import('./authService');
  const res = await authenticatedFetch(`/api/sala/${id}`);
  if (!res.ok) throw new Error("Błąd pobierania szczegółów sali");
  return await res.json();
};
