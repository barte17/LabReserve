// src/routes/AppRoutes.tsx
import { Routes, Route } from "react-router-dom";
import Stanowiska from "../pages/ShowStations";
import Sale from "../pages/ShowRooms";
import PanelAdmina from "../pages/AdminPanel";
import UserPanel from "../pages/AccountPanel";
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import PublicRoute from "../routes/PublicRoute";
import { AdminRoute } from "../routes/AdminRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/stanowiska" element={<Stanowiska />} />
      <Route path="/sale" element={<Sale />} />
      <Route path="/account" element={<UserPanel />} />


      <Route path="/panel-admina" element={
        <AdminRoute>
          <PanelAdmina />
        </AdminRoute>
      } />

      { /* Public routes */ }
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
        } />

      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
        } />
      
    </Routes>
  );
}
