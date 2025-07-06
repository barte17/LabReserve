import { Link } from "react-router-dom";


export function Navbar() {
  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li><Link to="/stanowiska" className="navbar-link">Wyświetl stanowiska</Link></li>
        <li><Link to="/sale" className="navbar-link">Wyświetl sale</Link></li>
        <li><Link to="/account" className="navbar-link">Panel użytkownika</Link></li>
        <li><Link to="/panel-admina" className="navbar-link">Panel admina</Link></li>
        <li><Link to="/register" className="navbar-link">Rejestracja</Link></li>
        <li><Link to="/login" className="navbar-link">Logowanie</Link></li>
      </ul>
    </nav>
  );
}
