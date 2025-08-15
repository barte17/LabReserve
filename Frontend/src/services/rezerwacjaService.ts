const getToken = () => localStorage.getItem("accessToken");

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
  const res = await fetch("/api/rezerwacja", {
    headers: { "Authorization": `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error("Błąd pobierania rezerwacji");
  return await res.json();
};

export const fetchMyReservations = async (): Promise<RezerwacjaDetailsDto[]> => {
  const res = await fetch("/api/rezerwacja/my", {
    headers: { "Authorization": `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error("Błąd pobierania moich rezerwacji");
  return await res.json();
};

export const createReservation = async (data: CreateReservationDto): Promise<RezerwacjaDetailsDto> => {
  const res = await fetch("/api/rezerwacja", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
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

  const res = await fetch(`/api/rezerwacja/available-hours?${searchParams}`, {
    headers: { "Authorization": `Bearer ${getToken()}` }
  });
  
  if (!res.ok) throw new Error("Błąd pobierania dostępnych godzin");
  return await res.json();
};

export const getAvailableDays = async (params: MonthAvailabilityDto): Promise<AvailableDayDto[]> => {
  const searchParams = new URLSearchParams();
  if (params.salaId) searchParams.append('salaId', params.salaId.toString());
  if (params.stanowiskoId) searchParams.append('stanowiskoId', params.stanowiskoId.toString());
  searchParams.append('year', params.year.toString());
  searchParams.append('month', params.month.toString());

  const res = await fetch(`/api/rezerwacja/available-days?${searchParams}`, {
    headers: { "Authorization": `Bearer ${getToken()}` }
  });
  
  if (!res.ok) {
    throw new Error(`Błąd pobierania dostępnych dni: ${res.status} ${res.statusText}`);
  }
  
  return await res.json();
};

export const updateStatus = async (id: number, status: string) => {
  const res = await fetch(`/api/rezerwacja/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Błąd zmiany statusu");
};

export const deleteRezerwacja = async (id: number) => {
  const res = await fetch(`/api/rezerwacja/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error("Błąd usuwania rezerwacji");
};
