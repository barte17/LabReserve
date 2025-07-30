import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { logout } from "../services/authService";

export function Navbar() {
  const [isLogged, setIsLogged] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  const isActiveLink = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link to="/" className="navbar-brand">
              🎓 System Rezerwacji Uczelni
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="navbar-nav">
              <Link 
                to="/" 
                className={isActiveLink("/") ? "navbar-link-active" : "navbar-link"}
              >
                Strona główna
              </Link>
              <Link 
                to="/stanowiska" 
                className={isActiveLink("/stanowiska") ? "navbar-link-active" : "navbar-link"}
              >
                Stanowiska
              </Link>
              <Link 
                to="/sale" 
                className={isActiveLink("/sale") ? "navbar-link-active" : "navbar-link"}
              >
                Sale
              </Link>
              {isLogged && roles.includes("Admin") && (
                <Link 
                  to="/panel-admina" 
                  className={isActiveLink("/panel-admina") ? "navbar-link-active" : "navbar-link"}
                >
                  Panel admina
                </Link>
              )}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-2">
            {!isLogged ? (
              <Link to="/login" className="btn btn-primary">
                Zaloguj się
              </Link>
            ) : (
              <>
                <Link to="/account" className="navbar-link">
                  Panel użytkownika
                </Link>
                <button onClick={handleLogout} className="btn btn-secondary">
                  Wyloguj
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-neutral-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden animate-slide-up">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-neutral-200">
              <Link 
                to="/" 
                className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                  isActiveLink("/") 
                    ? "bg-primary-100 text-primary-700" 
                    : "text-neutral-700 hover:text-primary-600 hover:bg-primary-50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Strona główna
              </Link>
              <Link 
                to="/stanowiska" 
                className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                  isActiveLink("/stanowiska") 
                    ? "bg-primary-100 text-primary-700" 
                    : "text-neutral-700 hover:text-primary-600 hover:bg-primary-50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Laboratoria
              </Link>
              <Link 
                to="/sale" 
                className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                  isActiveLink("/sale") 
                    ? "bg-primary-100 text-primary-700" 
                    : "text-neutral-700 hover:text-primary-600 hover:bg-primary-50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sale Wykładowe
              </Link>
              {isLogged && roles.includes("Admin") && (
                <Link 
                  to="/panel-admina" 
                  className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActiveLink("/panel-admina") 
                      ? "bg-primary-100 text-primary-700" 
                      : "text-neutral-700 hover:text-primary-600 hover:bg-primary-50"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Panel admina
                </Link>
              )}
              
              {/* Mobile User Menu */}
              <div className="border-t border-neutral-200 pt-3 mt-3">
                {!isLogged ? (
                  <Link 
                    to="/login" 
                    className="block w-full text-center btn btn-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Zaloguj się
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <Link 
                      to="/account" 
                      className="block px-3 py-2 rounded-lg text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Panel użytkownika
                    </Link>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }} 
                      className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
                    >
                      Wyloguj
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}