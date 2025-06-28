import { useEffect } from "react";
import AddSalaForm from "../components/forms/AddRoomForm";
import AddStanowiskoForm from "../components/forms/AddStationForm";


export default function PanelAdmina() {
  useEffect(() => {
    document.title = "Panel admina";
  }, []);

    const handleAddRoom = async (data: any) => {
    await fetch("/api/sala", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(res => {
    if (!res.ok) {
      throw new Error("Błąd dodawania sali");
    }
    alert("Dodano salę!");
  })
  .catch(err => {
    console.error(err);
    alert("Nie udało się dodać sali");
  });
  }

    const handleAddStation = async (data: any) => {
    await fetch("/api/stanowisko", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    alert("Dodano stanowisko!");
  };


  return (
    <div>
      <h1>Panel admina</h1>
      <div className="grid gap-4">
        <button>Wyświetl rezerwacje</button>
        <button>Zarządzaj użytkownikami</button>
        <AddSalaForm onSubmit={handleAddRoom} />
        <AddStanowiskoForm onSubmit={handleAddStation} />
      </div>
    </div>
  );
}
