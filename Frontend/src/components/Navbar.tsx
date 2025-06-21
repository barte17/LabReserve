import { Link } from "react-router-dom";
import "./Navbar.css";

export function Navbar() {
  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/stanowiska">Wyświetl stanowiska</Link></li>
        <li><Link to="/sale">Wyświetl sale</Link></li>
        <li><Link to="/panel-uzytkownika">Panel użytkownika</Link></li>
        <li><Link to="/panel-admina">Panel admina</Link></li>
      </ul>
    </nav>
  );
}
