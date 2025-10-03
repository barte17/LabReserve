// Usunięto getToken - używamy authenticatedFetch z authService

export interface CreateReservationDto {
  salaId?: number;
  stanowiskoId?: number;
  dataStart: string;
  dataKoniec: string;
  opis?: string;
}

export interface AvailabilityCheckDto {
  salaId?: number;
  stanowiskoId?: number;
  data: string;
}

export interface AvailableHourDto {
  godzina: string;
  dostepna: boolean;
}

export interface MonthAvailabilityDto {
  salaId?: number;
  stanowiskoId?: number;
  year: number;
  month: number;
}

export interface AvailableDayDto {
  data: string;
  maDostepneGodziny: boolean;
}

export interface RezerwacjaDetailsDto {
  id: number;
  salaId?: number;
  salaNumer?: string;
  salaBudynek?: string;
  stanowiskoId?: number;
  stanowiskoNazwa?: string;
  uzytkownikId: string;
  uzytkownikImie?: string;
  uzytkownikNazwisko?: string;
  dataUtworzenia: string;
  dataStart: string;
  dataKoniec: string;
  status: string;
  opis?: string;
}

export const fetchRezerwacje = async (): Promise<RezerwacjaDetailsDto[]> => {
  const { authenticatedFetch } = await import('./authService');
  const res = await authenticatedFetch("/api/rezerwacja");
  if (!res.ok) throw new Error("Błąd pobierania rezerwacji");
  return await res.json();
};

export const fetchMyReservations = async (): Promise<RezerwacjaDetailsDto[]> => {
  const { authenticatedFetch } = await import('./authService');
  const res = await authenticatedFetch("/api/rezerwacja/my");
  if (!res.ok) throw new Error("Błąd pobierania moich rezerwacji");
  return await res.json();
};

export const createReservation = async (data: CreateReservationDto): Promise<RezerwacjaDetailsDto> => {
  const { authenticatedFetch } = await import('./authService');
  const res = await authenticatedFetch("/api/rezerwacja", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Błąd tworzenia rezerwacji");
  }
  
  return await res.json();
};

export const getAvailableHours = async (params: AvailabilityCheckDto): Promise<AvailableHourDto[]> => {
  const searchParams = new URLSearchParams();
  if (params.salaId) searchParams.append('salaId', params.salaId.toString());
  if (params.stanowiskoId) searchParams.append('stanowiskoId', params.stanowiskoId.toString());
  searchParams.append('data', params.data);

  const { authenticatedFetch } = await import('./authService');
  const res = await authenticatedFetch(`/api/rezerwacja/available-hours?${searchParams}`);
  
  if (!res.ok) throw new Error("Błąd pobierania dostępnych godzin");
  return await res.json();
};

export const getAvailableDays = async (params: MonthAvailabilityDto): Promise<AvailableDayDto[]> => {
  const searchParams = new URLSearchParams();
  if (params.salaId) searchParams.append('salaId', params.salaId.toString());
  if (params.stanowiskoId) searchParams.append('stanowiskoId', params.stanowiskoId.toString());
  searchParams.append('year', params.year.toString());
  searchParams.append('month', params.month.toString());

  const { authenticatedFetch } = await import('./authService');
  const res = await authenticatedFetch(`/api/rezerwacja/available-days?${searchParams}`);
  
  if (!res.ok) {
    throw new Error(`Błąd pobierania dostępnych dni: ${res.status} ${res.statusText}`);
  }
  
  return await res.json();
};

export const updateStatus = async (id: number, status: string) => {
  const { authenticatedFetch } = await import('./authService');
  const res = await authenticatedFetch(`/api/rezerwacja/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Błąd zmiany statusu");
};

export const deleteRezerwacja = async (id: number) => {
  const { authenticatedFetch } = await import('./authService');
  const res = await authenticatedFetch(`/api/rezerwacja/${id}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Błąd usuwania rezerwacji");
};

export const cancelReservation = async (id: number) => {
  const { authenticatedFetch } = await import('./authService');
  const res = await authenticatedFetch(`/api/rezerwacja/${id}/cancel`, {
    method: "PATCH"
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Błąd anulowania rezerwacji");
  }
  
  return await res.json();
};

// Funkcje dla opiekuna
export const fetchMojeRezerwacje = async () => {
  const { authenticatedFetch } = await import('./authService');
  const res = await authenticatedFetch("/api/rezerwacja/opiekun/me");
  if (!res.ok) throw new Error("Błąd pobierania rezerwacji opiekuna");
  return res.json();
};

export const updateStatusRezerwacji = async (id: number, status: string) => {
  const { authenticatedFetch } = await import('./authService');
  const res = await authenticatedFetch(`/api/rezerwacja/opiekun/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error("Błąd aktualizacji statusu rezerwacji");
};

// Generowanie ostatnich aktywności z rezerwacji (Opcja A - bez nowej tabeli)
export const generateRecentActivities = (rezerwacje: any[]) => {
  // Sortuj po dacie utworzenia i weź ostatnie 7 dni
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  return rezerwacje
    .filter(r => new Date(r.dataUtworzenia) > sevenDaysAgo)
    .slice(0, 10) // Max 10 aktywności
    .map(r => ({
      action: getActionText(r.status),
      details: getDetailsText(r),
      time: getTimeAgo(r.dataUtworzenia),
      type: getActivityType(r.status),
      icon: getActivityIcon(r.status)
    }));
};

const getActionText = (status: string) => {
  switch (status) {
    case 'oczekujące': return 'Nowa rezerwacja';
    case 'zaakceptowano': return 'Zatwierdzono rezerwację';
    case 'odrzucono': return 'Odrzucono rezerwację';
    case 'anulowane': return 'Anulowano rezerwację';
    case 'po terminie': return 'Rezerwacja po terminie';
    default: return 'Zmiana rezerwacji';
  }
};

const getDetailsText = (rezerwacja: any) => {
  const location = rezerwacja.salaId 
    ? `Sala ${rezerwacja.salaNumer} - ${rezerwacja.salaBudynek}`
    : `${rezerwacja.stanowiskoNazwa} (${rezerwacja.stanowiskoSala})`;
  
  const date = new Date(rezerwacja.dataStart).toLocaleDateString('pl-PL');
  const time = new Date(rezerwacja.dataStart).toLocaleTimeString('pl-PL', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  return `${location} • ${date} ${time}`;
};

// Sprawdzenie wygasłych rezerwacji
export const checkExpiredReservations = async () => {
  const { authenticatedFetch } = await import('./authService');
  const res = await authenticatedFetch("/api/rezerwacja/check-expired", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!res.ok) throw new Error("Błąd sprawdzania wygasłych rezerwacji");
  return res.json();
};

const getTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 60) {
    return `${diffMinutes} min temu`;
  } else if (diffHours < 24) {
    return `${diffHours} godz. temu`;
  } else {
    return `${diffDays} dni temu`;
  }
};

const getActivityType = (status: string) => {
  switch (status) {
    case 'oczekujące': return 'new';
    case 'zaakceptowano': return 'approved';
    case 'odrzucono': return 'rejected';
    case 'anulowane': return 'cancelled';
    default: return 'updated';
  }
};

const getActivityIcon = (status: string) => {
  switch (status) {
    case 'oczekujące': return '📅';
    case 'zaakceptowano': return '✅';
    case 'odrzucono': return '❌';
    case 'anulowane': return '🚫';
    default: return '🔄';
  }
};
