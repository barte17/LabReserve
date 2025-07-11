import { useEffect, useState } from "react";
import AddSalaForm from "../components/forms/AddRoomForm";
import AddStanowiskoForm from "../components/forms/AddStationForm";
import { addSala } from "../services/salaService";
import { addStanowisko } from "../services/stanowiskoService";
import RezerwacjeList from "../components/RezerwacjeList";
import AdminNavbar from "../components/AdminNavbar";
import SaleListAdmin from "../components/SaleListAdmin";
import StanowiskaListAdmin from "../components/StanowiskaListAdmin";
import UsersListAdmin from "../components/UsersListAdmin";

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
    try {
      await addSala(data);
      alert("Dodano salę!");
    } catch (err) {
      console.error(err);
      alert("Nie udało się dodać sali");
    }
  };

  const handleAddStation = async (data: any) => {
    try {
      await addStanowisko(data);
      alert("Dodano stanowisko!");
    } catch (err) {
      console.error(err);
      alert("Nie udało się dodać stanowiska");
    }
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
        {view === "users" && <UsersListAdmin />}
        {view === "sale" && <SaleListAdmin />}
        {view === "stanowiska" && <StanowiskaListAdmin />}
        {view === "default" && <p className="text-gray-500">Wybierz opcję z panelu powyżej.</p>}
      </div>
    </div>
  );
}
