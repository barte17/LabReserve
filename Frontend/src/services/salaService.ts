const getToken = () => localStorage.getItem("accessToken");

export const fetchSale = async () => {
  const res = await fetch("/api/sala", {
    headers: { "Authorization": `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error("Błąd pobierania sal");
  return await res.json();
};

export const addSala = async (data: any) => {
  const res = await fetch("/api/sala", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Błąd dodawania sali");
  return await res.json();
};

export const editSala = async (id: number, data: any) => {
  const res = await fetch(`/api/sala/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Błąd edycji sali");
};

export const deleteSala = async (id: number) => {
  const res = await fetch(`/api/sala/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error("Błąd usuwania sali");
};
