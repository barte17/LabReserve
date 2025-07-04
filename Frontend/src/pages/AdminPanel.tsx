import { useEffect, useState } from "react";
import AddSalaForm from "../components/forms/AddRoomForm";
import AddStanowiskoForm from "../components/forms/AddStationForm";
import RezerwacjeList from "../components/RezerwacjeList";
import AdminNavbar from "../components/AdminNavbar";

type PanelView =
  | "default"
  | "addRoom"
  | "addStation"
  | "rezerwacje"
  | "users"
  | "sale"
  | "stanowiska";

export default function PanelAdmina() {
  const [view, setView] = useState<PanelView>("default");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Panel admina";
  }, []);

  const handleAddRoom = async (data: any) => {
    await fetch("/api/sala", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Błąd dodawania sali");
        }
        alert("Dodano salę!");
      })
      .catch((err) => {
        console.error(err);
        alert("Nie udało się dodać sali");
      });
  };

  const handleAddStation = async (data: any) => {
    await fetch("/api/stanowisko", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    alert("Dodano stanowisko!");
  };

  // Prosty placeholder dla widoków, które nie są jeszcze zaimplementowane
  const Placeholder = ({ text }: { text: string }) => (
    <p className="text-gray-500">{text}</p>
  );

  return (
    <div className="p-6 max-w-screen-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Panel administratora</h1>
      <AdminNavbar
        view={view}
        setView={setView}
        openDropdown={openDropdown}
        setOpenDropdown={setOpenDropdown}
      />
      <div className="bg-white shadow-md p-6 rounded-md border min-h-[300px]">
        {view === "addRoom" && <AddSalaForm onSubmit={handleAddRoom} />}
        {view === "addStation" && <AddStanowiskoForm onSubmit={handleAddStation} />}
        {view === "rezerwacje" && <RezerwacjeList />}
        {view === "users" && <Placeholder text="Zarządzanie użytkownikami (w trakcie)" />}
        {view === "sale" && <Placeholder text="Lista sal (do zaimplementowania)" />}
        {view === "stanowiska" && <Placeholder text="Lista stanowisk (do zaimplementowania)" />}
        {view === "default" && <p className="text-gray-500">Wybierz opcję z panelu powyżej.</p>}
      </div>
    </div>
  );
}
