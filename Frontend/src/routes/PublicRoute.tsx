import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: Props) => {
  const token = localStorage.getItem("accessToken");

  // Jeśli użytkownik jest zalogowany – przekieruj go na stronę główną
  if (token) {
    return <Navigate to="/" replace />;
  }

  // Jeśli nie jest zalogowany – pokaż stronę (np. login lub register)
  return <>{children}</>;
};

export default PublicRoute;
