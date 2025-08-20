import { BrowserRouter as Router  } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { AppRoutes } from "./routes/AppRoutes";
import { ToastProvider } from "./components/ToastProvider";
import { AuthProvider } from "./contexts/AuthContext";


function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Navbar />
          <main>
            <AppRoutes />
          </main>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App

