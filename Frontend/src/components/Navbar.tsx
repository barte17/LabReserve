import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { logout } from "../services/authService";





export function Navbar() {

  const [isLogged, setIsLogged] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLogged(!!token);
    const userRoles = localStorage.getItem("userRoles");
    setRoles(userRoles ? JSON.parse(userRoles) : []);
  }, []);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRoles");
    setIsLogged(false);
    setRoles([]);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <ul className="navbar-list" style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ display: "flex", gap: "1rem" }}>
          <li><Link to="/" className="navbar-link">Strona główna</Link></li>
          <li><Link to="/stanowiska" className="navbar-link">Wyświetl stanowiska</Link></li>
          <li><Link to="/sale" className="navbar-link">Wyświetl sale</Link></li>
          {isLogged && roles.includes("Admin") && (
            <li><Link to="/panel-admina" className="navbar-link">Panel admina</Link></li>
          )}
        </span>
        <span style={{ display: "flex", gap: "1rem", marginLeft: "auto" }}>
          {!isLogged ? (
            <li><Link to="/login" className="navbar-link">Logowanie</Link></li>
          ) : (
            <>
              <li><Link to="/account" className="navbar-link">Panel użytkownika</Link></li>
              <li><button onClick={handleLogout} className="navbar-link" style={{ background: "none", border: "none", cursor: "pointer" }}>Wyloguj</button></li>
            </>
          )}
        </span>
      </ul>
    </nav>
  );
}
