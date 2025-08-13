import { Navigate } from "react-router-dom";
import { getUserFromToken } from "../services/authService";

interface Props {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: Props) => {
  const user = getUserFromToken();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
