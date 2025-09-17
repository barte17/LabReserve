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
import { PageErrorBoundary } from "../components/ErrorBoundary";
import UserDashboard from "../components/dashboard/UserDashboard";
import ProtectedRoute from "../routes/ProtectedRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      
      <Route path="/stanowiska" element={
        <PageErrorBoundary fallbackPath="/" fallbackText="Strona główna">
          <Stanowiska />
        </PageErrorBoundary>
      } />
      
      <Route path="/stanowisko/:id" element={
        <PageErrorBoundary fallbackPath="/stanowiska" fallbackText="Lista stanowisk">
          <StanowiskoDetails />
        </PageErrorBoundary>
      } />
      
      <Route path="/sale" element={
        <PageErrorBoundary fallbackPath="/" fallbackText="Strona główna">
          <Sale />
        </PageErrorBoundary>
      } />
      
      <Route path="/sala/:id" element={
        <PageErrorBoundary fallbackPath="/sale" fallbackText="Lista sal">
          <SalaDetails />
        </PageErrorBoundary>
      } />
      
      <Route path="/account" element={
        <PageErrorBoundary fallbackPath="/" fallbackText="Strona główna">
          <UserPanel />
        </PageErrorBoundary>
      } />
      
      <Route path="/reservation" element={
        <PageErrorBoundary fallbackPath="/" fallbackText="Strona główna">
          <ReservationPage />
        </PageErrorBoundary>
      } />
      
      <Route path="/my-reservations" element={
        <PageErrorBoundary fallbackPath="/" fallbackText="Strona główna">
          <MyReservations />
        </PageErrorBoundary>
      } />

      {/* Nowy unified dashboard */}
      <Route path="/panel" element={
        <ProtectedRoute>
          <PageErrorBoundary fallbackPath="/" fallbackText="Strona główna">
            <UserDashboard />
          </PageErrorBoundary>
        </ProtectedRoute>
      } />

      {/* Backward compatibility - stary panel admina */}
      <Route path="/panel-admina" element={
        <AdminRoute>
          <PageErrorBoundary fallbackPath="/" fallbackText="Strona główna">
            <PanelAdmina />
          </PageErrorBoundary>
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
