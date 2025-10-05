import { BrowserRouter as Router  } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { AppRoutes } from "./routes/AppRoutes";
import { ToastProvider, useToastContext } from "./components/ToastProvider";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./contexts/AuthContext";
import GlobalErrorBoundary from "./components/ErrorBoundary/GlobalErrorBoundary";
// Import errorUtils dla debug tools
import "./utils/errorUtils";
// Import toast handlers
import { setToastHandler } from "./services/apiErrorHandler";
import { setGlobalToastHandler } from "./components/ErrorBoundary/GlobalErrorBoundary";
import { setPageToastHandler } from "./components/ErrorBoundary/PageErrorBoundary";
import { setFormToastHandler } from "./components/ErrorBoundary/FormErrorBoundary";
import { setAuthToastHandler } from "./components/ErrorBoundary/AuthErrorBoundary";
import { AuthErrorBoundary } from "./components/ErrorBoundary";
import { useEffect } from "react";


// Komponent wewnętrzny do podłączenia toast handlers
const AppContent = () => {
  const { showError } = useToastContext();

  useEffect(() => {
    // Podłącz toast handlery do wszystkich error boundaries i API handler
    setToastHandler(showError);
    setGlobalToastHandler(showError);
    setPageToastHandler(showError);
    setFormToastHandler(showError);
    setAuthToastHandler(showError);
  }, [showError]);

  return (
    <Router>
      <ScrollToTop />
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
      <AuthErrorBoundary>
        <AuthProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </AuthErrorBoundary>
    </GlobalErrorBoundary>
  );
}

export default App

