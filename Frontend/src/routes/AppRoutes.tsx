// src/routes/AppRoutes.tsx
import { Routes, Route } from "react-router-dom";
import Stanowiska from "../pages/ShowStations";
import Sale from "../pages/ShowRooms";
import SalaDetails from "../pages/SalaDetails";
import StanowiskoDetails from "../pages/StanowiskoDetails";
import PanelAdmina from "../pages/AdminPanel";
import UserPanel from "../pages/AccountPanel";
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import ReservationPage from '../pages/ReservationPage';
import MyReservations from '../pages/MyReservations';
import PublicRoute from "../routes/PublicRoute";
import { AdminRoute } from "../routes/AdminRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/stanowiska" element={<Stanowiska />} />
      <Route path="/stanowisko/:id" element={<StanowiskoDetails />} />
      <Route path="/sale" element={<Sale />} />
      <Route path="/sala/:id" element={<SalaDetails />} />
      <Route path="/account" element={<UserPanel />} />
      <Route path="/reservation" element={<ReservationPage />} />
      <Route path="/my-reservations" element={<MyReservations />} />

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
