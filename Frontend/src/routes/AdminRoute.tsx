// src/routes/AdminRoutes.tsx
import { Navigate } from "react-router-dom";
import { getUserFromToken } from "../services/authService";
import { ReactNode } from "react";

export const AdminRoute = ({ children }: { children: ReactNode }) => {
  const user = getUserFromToken();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "Admin") return <Navigate to="/" replace />;

  return children;
};
