import { apiRequest } from './apiErrorHandler';

export const getRooms = async () => {
  const res = await apiRequest('/api/sala', {}, 'Błąd podczas ładowania sal');
  return res.json();
};

export const getStations = async () => {
  const res = await apiRequest('/api/stanowisko', {}, 'Błąd podczas ładowania stanowisk');
  return res.json();
};
