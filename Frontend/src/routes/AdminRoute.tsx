// src/routes/AdminRoutes.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { ReactNode } from "react";

export const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLogged, isLoading } = useAuth();

  // Pokaż loader podczas sprawdzania uwierzytelnienia
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>;
  }

  if (!isLogged) return <Navigate to="/login" replace />;
  if (!user?.roles?.includes("Admin")) return <Navigate to="/" replace />;

  return children;
};
