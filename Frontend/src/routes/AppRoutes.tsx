// src/routes/AppRoutes.tsx
import { Routes, Route } from "react-router-dom";
import Stanowiska from "../pages/ShowStations";
import Sale from "../pages/ShowRooms";
import PanelAdmina from "../pages/AdminPanel";
import UserPanel from "../pages/AccountPanel";
import Login from '../pages/Login';
import Register from '../pages/Register';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/stanowiska" element={<Stanowiska />} />
      <Route path="/sale" element={<Sale />} />
      <Route path="/account" element={<UserPanel />} />
      <Route path="/panel-admina" element={<PanelAdmina />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}
