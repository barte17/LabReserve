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
