import React from "react";

type PanelView =
  | "default"
  | "addRoom"
  | "addStation"
  | "rezerwacje"
  | "users"
  | "sale"
  | "stanowiska";

interface AdminNavbarProps {
  view: PanelView;
  setView: (v: PanelView) => void;
  openDropdown: string | null;
  setOpenDropdown: (v: string | null) => void;
}

const activeTab =
  "bg-green-600 text-white border-green-600 border-b-4";
const hoverTab =
  "hover:bg-green-100 hover:text-green-900";

const AdminNavbar: React.FC<AdminNavbarProps> = ({
  view,
  setView,
  openDropdown,
  setOpenDropdown,
}) => {
  return (
    <nav className="mb-6 w-full">
      <div className="flex justify-center w-full">
        <ul className="flex bg-white rounded shadow border w-full max-w-3xl mx-auto">
          <li className="flex-1">
            <button
              className={`w-full py-3 text-base font-semibold border-b-4 transition rounded-t ${
                view === "rezerwacje" ? activeTab : hoverTab
              }`}
              onClick={() => setView("rezerwacje")}
            >
              Rezerwacje
            </button>
          </li>
          <li className="flex-1">
            <button
              className={`w-full py-3 text-base font-semibold border-b-4 transition rounded-t ${
                view === "users" ? activeTab : hoverTab
              }`}
              onClick={() => setView("users")}
            >
              Użytkownicy
            </button>
          </li>
          <li className="flex-1 relative" onMouseEnter={() => setOpenDropdown("sale")} onMouseLeave={() => setOpenDropdown(null)}>
            <button
              className={`w-full py-3 text-base font-semibold border-b-4 transition rounded-t flex items-center justify-center gap-2 ${
                view === "sale" || view === "addRoom" ? activeTab : hoverTab
              }`}
              onClick={() => setOpenDropdown(openDropdown === "sale" ? null : "sale")}
              type="button"
            >
              Sale <span className="text-xs">▼</span>
            </button>
            {openDropdown === "sale" && (
              <div className="absolute left-0 top-full w-full bg-white border-x border-b rounded-b shadow z-30 flex flex-col">
                <button
                  className="text-left px-4 py-2 hover:bg-green-100 hover:text-green-900 transition"
                  onClick={() => {
                    setView("sale");
                    setOpenDropdown(null);
                  }}
                >
                  Wyświetl sale
                </button>
                <button
                  className="text-left px-4 py-2 hover:bg-green-100 hover:text-green-900 transition"
                  onClick={() => {
                    setView("addRoom");
                    setOpenDropdown(null);
                  }}
                >
                  Dodaj salę
                </button>
              </div>
            )}
          </li>
          <li className="flex-1 relative" onMouseEnter={() => setOpenDropdown("stanowiska")} onMouseLeave={() => setOpenDropdown(null)}>
            <button
              className={`w-full py-3 text-base font-semibold border-b-4 transition rounded-t flex items-center justify-center gap-2 ${
                view === "stanowiska" || view === "addStation" ? activeTab : hoverTab
              }`}
              onClick={() => setOpenDropdown(openDropdown === "stanowiska" ? null : "stanowiska")}
              type="button"
            >
              Stanowiska <span className="text-xs">▼</span>
            </button>
            {openDropdown === "stanowiska" && (
              <div className="absolute left-0 top-full w-full bg-white border-x border-b rounded-b shadow z-30 flex flex-col">
                <button
                  className="text-left px-4 py-2 hover:bg-green-100 hover:text-green-900 transition"
                  onClick={() => {
                    setView("stanowiska");
                    setOpenDropdown(null);
                  }}
                >
                  Wyświetl stanowiska
                </button>
                <button
                  className="text-left px-4 py-2 hover:bg-green-100 hover:text-green-900 transition"
                  onClick={() => {
                    setView("addStation");
                    setOpenDropdown(null);
                  }}
                >
                  Dodaj stanowisko
                </button>
              </div>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default AdminNavbar;
