import { BrowserRouter as Router  } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { AppRoutes } from "./routes/AppRoutes";


function App() {
  return (
    <Router>
      <Navbar />
      <main>
        <AppRoutes />
      </main>
    </Router>
  );
}

export default App

