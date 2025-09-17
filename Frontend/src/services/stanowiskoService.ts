export const fetchStanowiska = async () => {
  const res = await fetch("/api/stanowisko");
  if (!res.ok) throw new Error("Błąd pobierania stanowisk");
  return await res.json();
};

export const addStanowisko = async (data: any) => {
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

  const res = await authenticatedFetch("/api/stanowisko", {
    method: "POST",
    body: formData, // Bez Content-Type - browser ustawi automatycznie z boundary
  });
  if (!res.ok) throw new Error("Błąd dodawania stanowiska");
  return await res.json();
};

export const editStanowisko = async (id: number, data: any) => {
  const { authenticatedFetch } = await import('./authService');
  
  // ZAWSZE używaj FormData - backend oczekuje FormData
  const formData = new FormData();
  
  // Dodanie danych formularza
  Object.keys(data).forEach(key => {
    if (key === 'zdjecia' && data[key]) {
      // Dodanie nowych plików
      data[key].forEach((file: File) => {
        formData.append('zdjecia', file);
      });
    } else if (key === 'zdjeciaDoUsuniecia' && data[key]) {
      // Dodanie ID zdjęć do usunięcia
      data[key].forEach((id: number) => {
        formData.append('zdjeciaDoUsuniecia', id.toString());
      });
    } else if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key].toString());
    }
  });

  const res = await authenticatedFetch(`/api/stanowisko/${id}`, {
    method: "PUT",
    body: formData, // Backend oczekuje FormData
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

// Funkcje dla opiekuna
export const fetchMojeStanowiska = async () => {
  const { authenticatedFetch } = await import('./authService');
  const res = await authenticatedFetch("/api/stanowisko/opiekun/me");
  if (!res.ok) throw new Error("Błąd pobierania stanowisk opiekuna");
  return res.json();
};

export const updateMojeStanowisko = async (id: number, data: { opis?: string }) => {
  const { authenticatedFetch } = await import('./authService');
  const res = await authenticatedFetch(`/api/stanowisko/opiekun/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Błąd edycji stanowiska");
};

export const fetchStanowiskoById = async (id: number) => {
  const res = await fetch(`/api/stanowisko/${id}`);
  if (!res.ok) throw new Error("Błąd pobierania szczegółów stanowiska");
  return await res.json();
};
