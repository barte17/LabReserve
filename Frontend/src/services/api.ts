import { publicApiRequest } from './apiErrorHandler';

export const getRooms = async () => {
  const res = await publicApiRequest('/api/sala', {}, 'Błąd podczas ładowania sal');
  return res.json();
};

export const getStations = async () => {
  const res = await publicApiRequest('/api/stanowisko', {}, 'Błąd podczas ładowania stanowisk');
  return res.json();
};
