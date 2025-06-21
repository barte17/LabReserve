import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import Stanowiska from "./pages/ShowStations";
import Sale from "./pages/ShowRooms";
import PanelUzytkownika from "./pages/UserPanel";
import PanelAdmina from "./pages/AdminPanel";


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/stanowiska" element={<Stanowiska />} />
        <Route path="/sale" element={<Sale />} />
        <Route path="/panel-uzytkownika" element={<PanelUzytkownika />} />
        <Route path="/panel-admina" element={<PanelAdmina />} />
      </Routes>
    </Router>
  );
}

export default App

