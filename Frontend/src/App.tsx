import { BrowserRouter as Router  } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { AppRoutes } from "./routes/AppRoutes";
import { ToastProvider } from "./components/ToastProvider";


function App() {
  return (
    <ToastProvider>
      <Router>
        <Navbar />
        <main>
          <AppRoutes />
        </main>
      </Router>
    </ToastProvider>
  );
}

export default App

