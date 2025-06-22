export const getRooms = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sala`);
  if (!res.ok) throw new Error("Błąd z wczytaniem sal z backendu");
  return res.json();
};

export const getStations = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stanowisko`);
  if (!res.ok) throw new Error("Błąd z wczytaniem stanowisk z backendu");
  return res.json();
};
