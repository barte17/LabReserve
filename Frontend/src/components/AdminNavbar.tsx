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

const AdminNavbar: React.FC<AdminNavbarProps> = ({
  view,
  setView,
  openDropdown,
  setOpenDropdown,
}) => {
  
  const handleDropdownClick = (dropdownName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`${dropdownName} clicked, current dropdown:`, openDropdown);
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  return (
    <div className="bg-white rounded-xl shadow-soft border border-neutral-200 mb-8 overflow-visible">
      <div className="flex">
        {/* Rezerwacje */}
        <div className="flex-1">
          <button
            className={`w-full px-4 py-4 text-center font-medium transition-all duration-200 border-b-2 ${
              view === "rezerwacje" 
                ? "text-primary-600 bg-primary-50 border-primary-600" 
                : "text-neutral-700 hover:text-primary-600 hover:bg-primary-50 border-transparent"
            }`}
            onClick={() => {
              setView("rezerwacje");
              setOpenDropdown(null);
            }}
          >
            Rezerwacje Sal
          </button>
        </div>

        {/* Użytkownicy */}
        <div className="flex-1">
          <button
            className={`w-full px-4 py-4 text-center font-medium transition-all duration-200 border-b-2 ${
              view === "users" 
                ? "text-primary-600 bg-primary-50 border-primary-600" 
                : "text-neutral-700 hover:text-primary-600 hover:bg-primary-50 border-transparent"
            }`}
            onClick={() => {
              setView("users");
              setOpenDropdown(null);
            }}
          >
            Użytkownicy
          </button>
        </div>

        {/* Sale */}
        <div className="flex-1 relative">
          <button
            className={`w-full px-4 py-4 text-center font-medium transition-all duration-200 border-b-2 flex items-center justify-center ${
              view === "sale" || view === "addRoom" 
                ? "text-primary-600 bg-primary-50 border-primary-600" 
                : "text-neutral-700 hover:text-primary-600 hover:bg-primary-50 border-transparent"
            }`}
            onClick={(e) => handleDropdownClick("sale", e)}
          >
            Sale
            <svg className={`h-4 w-4 ml-2 transition-transform duration-200 ${openDropdown === "sale" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openDropdown === "sale" && (
            <div className="absolute top-full left-0 right-0 bg-white border-x border-b border-neutral-200 rounded-b-lg shadow-lg z-50">
              <button
                className="block w-full px-4 py-3 text-center text-neutral-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
                onClick={() => {
                  setView("sale");
                  setOpenDropdown(null);
                }}
              >
                Lista sal
              </button>
              <button
                className="block w-full px-4 py-3 text-center text-neutral-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
                onClick={() => {
                  setView("addRoom");
                  setOpenDropdown(null);
                }}
              >
                Dodaj salę
              </button>
            </div>
          )}
        </div>

        {/* Laboratoria */}
        <div className="flex-1 relative">
          <button
            className={`w-full px-4 py-4 text-center font-medium transition-all duration-200 border-b-2 flex items-center justify-center ${
              view === "stanowiska" || view === "addStation" 
                ? "text-primary-600 bg-primary-50 border-primary-600" 
                : "text-neutral-700 hover:text-primary-600 hover:bg-primary-50 border-transparent"
            }`}
            onClick={(e) => handleDropdownClick("stanowiska", e)}
          >
            Stanowiska
            <svg className={`h-4 w-4 ml-2 transition-transform duration-200 ${openDropdown === "stanowiska" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openDropdown === "stanowiska" && (
            <div className="absolute top-full left-0 right-0 bg-white border-x border-b border-neutral-200 rounded-b-lg shadow-lg z-50">
              <button
                className="block w-full px-4 py-3 text-center text-neutral-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
                onClick={() => {
                  setView("stanowiska");
                  setOpenDropdown(null);
                }}
              >
                Lista stanowisk
              </button>
              <button
                className="block w-full px-4 py-3 text-center text-neutral-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
                onClick={() => {
                  setView("addStation");
                  setOpenDropdown(null);
                }}
              >
                Dodaj stanowisko
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;