export interface NotificationData {
  id: number;
  tytul: string;
  tresc: string;
  typ: 'rezerwacja' | 'system' | 'reminder';
  priorytet: 'low' | 'normal' | 'high';
  czyPrzeczytane: boolean;
  dataUtworzenia: string;
  actionUrl?: string;
  rezerwacjaId?: number;
}

export interface NotificationsResponse {
  powiadomienia: NotificationData[];
  strona: number;
  rozmiar: number;
  liczbaElementow: number;
}