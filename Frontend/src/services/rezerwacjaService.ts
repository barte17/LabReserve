const getToken = () => localStorage.getItem("accessToken");

export const fetchRezerwacje = async () => {
  const res = await fetch("/api/rezerwacja", {
    headers: { "Authorization": `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error("Błąd pobierania rezerwacji");
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
