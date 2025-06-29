import { useEffect, useState } from "react";
import AddSalaForm from "../components/forms/AddRoomForm";
import AddStanowiskoForm from "../components/forms/AddStationForm";
import RezerwacjeList from "../components/RezerwacjeList";

type PanelView = "default" | "addRoom" | "addStation" | "rezerwacje";


export default function PanelAdmina() {
  const [view, setView] = useState<PanelView>("default");

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
    <div className="p-6 max-w-screen-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Panel administratora</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setView("rezerwacje")}
        >
          Wyświetl rezerwacje
        </button>
        <button className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed" disabled>
          Zarządzaj użytkownikami (w trakcie)
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => setView("addRoom")}
        >
          Dodaj salę
        </button>
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          onClick={() => setView("addStation")}
        >
          Dodaj stanowisko
        </button>
      </div>

      <div className="bg-white shadow-md p-6 rounded-md border min-h-[300px]">
        {view === "addRoom" && <AddSalaForm onSubmit={handleAddRoom} />}
        {view === "addStation" && <AddStanowiskoForm onSubmit={handleAddStation} />}
        {view === "rezerwacje" && <RezerwacjeList />}
        {view === "default" && <p className="text-gray-500">Wybierz opcję z panelu powyżej.</p>}
      </div>
    </div>
  );
}
