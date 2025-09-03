import { BrowserRouter as Router  } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { AppRoutes } from "./routes/AppRoutes";
import { ToastProvider, useToastContext } from "./components/ToastProvider";
import { AuthProvider } from "./contexts/AuthContext";
import GlobalErrorBoundary from "./components/ErrorBoundary/GlobalErrorBoundary";
// Import errorUtils dla debug tools
import "./utils/errorUtils";
// Import toast handlers
import { setToastHandler } from "./services/apiErrorHandler";
import { setGlobalToastHandler } from "./components/ErrorBoundary/GlobalErrorBoundary";
import { setPageToastHandler } from "./components/ErrorBoundary/PageErrorBoundary";
import { useEffect } from "react";


// Komponent wewnętrzny do podłączenia toast handlers
const AppContent = () => {
  const { showError } = useToastContext();

  useEffect(() => {
    // Podłącz toast handlery do wszystkich error boundaries i API handler
    setToastHandler(showError);
    setGlobalToastHandler(showError);
    setPageToastHandler(showError);
  }, [showError]);

  return (
    <Router>
      <Navbar />
      <main>
        <AppRoutes />
      </main>
    </Router>
  );
};

function App() {
  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </GlobalErrorBoundary>
  );
}

export default App

