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
import { useToastContext } from "../components/ToastProvider";

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
  const { showSuccess, showError } = useToastContext();

  useEffect(() => {
    document.title = "Panel admina";
  }, []);

  const handleAddRoom = async (data: any) => {
    try {
      await addSala(data);
      showSuccess("Dodano salę!");
      setView("sale");
    } catch (err) {
      console.error(err);
      showError("Nie udało się dodać sali");
    }
  };

  const handleAddStation = async (data: any) => {
    try {
      await addStanowisko(data);
      showSuccess("Dodano stanowisko!");
      setView("stanowiska");
    } catch (err) {
      console.error(err);
      showError("Nie udało się dodać stanowiska");
    }
  };

  // Prosty placeholder dla widoków, które nie są jeszcze zaimplementowane
  const Placeholder = ({ text }: { text: string }) => (
    <p className="text-gray-500">{text}</p>
  );

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Panel Administratora
          </h1>
          <p className="text-neutral-600">
            Zarządzaj systemem rezerwacji, użytkownikami i zasobami
          </p>
        </div>

        {/* Navigation */}
        <AdminNavbar
          view={view}
          setView={setView}
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
        />

        {/* Content */}
        <div className="card min-h-[500px]">
          <div className="card-body">
            {view === "addRoom" && <AddSalaForm onSubmit={handleAddRoom} />}
            {view === "addStation" && <AddStanowiskoForm onSubmit={handleAddStation} />}
            {view === "rezerwacje" && <RezerwacjeList />}
            {view === "users" && <UsersListAdmin />}
            {view === "sale" && <SaleListAdmin />}
            {view === "stanowiska" && <StanowiskaListAdmin />}
            {view === "default" && (
              <div className="text-center py-12">
                <svg className="h-16 w-16 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  Witaj w panelu administratora
                </h3>
                <p className="text-neutral-600">
                  Wybierz opcję z menu powyżej, aby rozpocząć zarządzanie systemem.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
