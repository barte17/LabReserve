// src/routes/AppRoutes.tsx
import { Routes, Route } from "react-router-dom";
import Stanowiska from "../pages/ShowStations";
import Sale from "../pages/ShowRooms";
import PanelUzytkownika from "../pages/UserPanel";
import PanelAdmina from "../pages/AdminPanel";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/stanowiska" element={<Stanowiska />} />
      <Route path="/sale" element={<Sale />} />
      <Route path="/panel-uzytkownika" element={<PanelUzytkownika />} />
      <Route path="/panel-admina" element={<PanelAdmina />} />
    </Routes>
  );
}
