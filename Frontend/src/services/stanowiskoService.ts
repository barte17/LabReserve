const getToken = () => localStorage.getItem("accessToken");

export const fetchStanowiska = async () => {
  const res = await fetch("/api/stanowisko", {
    headers: { "Authorization": `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error("Błąd pobierania stanowisk");
  return await res.json();
};

export const addStanowisko = async (data: any) => {
  const res = await fetch("/api/stanowisko", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Błąd dodawania stanowiska");
  return await res.json();
};

export const editStanowisko = async (id: number, data: any) => {
  const res = await fetch(`/api/stanowisko/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Błąd edycji stanowiska");
};

export const deleteStanowisko = async (id: number) => {
  const res = await fetch(`/api/stanowisko/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error("Błąd usuwania stanowiska");
};
