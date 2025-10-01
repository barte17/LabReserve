import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { logout as authLogout } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isLogged, hasRole, logout, isLoading, user } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    setIsUserDropdownOpen(false);
    await logout(); // AuthContext logout już wywołuje authLogout
    navigate("/login");
  };

  const isActiveLink = (path: string) => location.pathname === path;

  // Zamykanie dropdown po kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDropdownNavigation = (path: string) => {
    setIsUserDropdownOpen(false);
    navigate(path);
  };

  return (
    <nav className="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-stretch h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0 h-full">
            <Link to="/" className="navbar-brand h-full flex items-center">
              🎓 LabReserve
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="navbar-nav">
              <Link 
                to="/" 
                className={`flex items-center space-x-1.5 ${isActiveLink("/") ? "navbar-link-active" : "navbar-link"}`}
              >
                <span>🏠</span>
                <span>Strona główna</span>
              </Link>
              <Link 
                to="/stanowiska" 
                className={`flex items-center space-x-1.5 ${isActiveLink("/stanowiska") ? "navbar-link-active" : "navbar-link"}`}
              >
                <span>💻</span>
                <span>Stanowiska</span>
              </Link>
              <Link 
                to="/sale" 
                className={`flex items-center space-x-1.5 ${isActiveLink("/sale") ? "navbar-link-active" : "navbar-link"}`}
              >
                <span>🏢</span>
                <span>Sale</span>
              </Link>
              {isLogged && (
                <Link 
                  to="/panel?view=user&section=moje-rezerwacje" 
                  className={`flex items-center space-x-1.5 ${isActiveLink("/panel") && new URLSearchParams(location.search).get('section') === 'moje-rezerwacje' ? "navbar-link-active" : "navbar-link"}`}
                >
                  <span>📋</span>
                  <span>Moje Rezerwacje</span>
                </Link>
              )}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-stretch space-x-2 h-full">
            {isLoading ? (
              // Placeholder podczas ładowania
              <div className="flex items-center space-x-2">
                <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : !isLogged ? (
              <Link to="/login" className="btn-navbar btn-primary">
                Zaloguj się
              </Link>
            ) : (
              // User Dropdown
              <div className="relative h-full" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-3 px-6 h-full text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
                >
                  <svg 
                    className="w-6 h-6 text-gray-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="hidden lg:block font-semibold text-gray-900">
                    Panel
                  </span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${isUserDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                      <p className="text-xs text-gray-500">Panel</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={() => handleDropdownNavigation('/panel?view=user')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <span className="mr-3">👤</span>
                        <span>Panel użytkownika</span>
                      </button>

                      {hasRole("Admin") && (
                        <button
                          onClick={() => handleDropdownNavigation('/panel?view=admin')}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                          <span className="mr-3">🔧</span>
                          <span>Panel admina</span>
                        </button>
                      )}

                      {hasRole("Opiekun") && (
                        <button
                          onClick={() => handleDropdownNavigation('/panel?view=opiekun')}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                          <span className="mr-3">👨‍🏫</span>
                          <span>Panel opiekuna</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDropdownNavigation('/panel?view=user&section=profil')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <span className="mr-3">⚙️</span>
                        <span>Profil</span>
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        <span className="mr-3">🚪</span>
                        <span>Wyloguj</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                  isActiveLink("/") 
                    ? "bg-primary-100 text-primary-700" 
                    : "text-neutral-700 hover:text-primary-600 hover:bg-primary-50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>🏠</span>
                <span>Strona główna</span>
              </Link>
              <Link 
                to="/stanowiska" 
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                  isActiveLink("/stanowiska") 
                    ? "bg-primary-100 text-primary-700" 
                    : "text-neutral-700 hover:text-primary-600 hover:bg-primary-50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>💻</span>
                <span>Stanowiska</span>
              </Link>
              <Link 
                to="/sale" 
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                  isActiveLink("/sale") 
                    ? "bg-primary-100 text-primary-700" 
                    : "text-neutral-700 hover:text-primary-600 hover:bg-primary-50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>🏢</span>
                <span>Sale</span>
              </Link>
              {isLogged && (
                <Link 
                  to="/panel?view=user&section=moje-rezerwacje" 
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActiveLink("/panel") && new URLSearchParams(location.search).get('section') === 'moje-rezerwacje'
                      ? "bg-primary-100 text-primary-700" 
                      : "text-neutral-700 hover:text-primary-600 hover:bg-primary-50"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>📋</span>
                  <span>Moje Rezerwacje</span>
                </Link>
              )}
              
              {/* Mobile User Menu */}
              <div className="border-t border-neutral-200 pt-3 mt-3">
                {isLoading ? (
                  // Placeholder podczas ładowania w mobile
                  <div className="space-y-2">
                    <div className="w-full h-10 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-full h-10 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : !isLogged ? (
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
                      to="/panel?view=user" 
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span>👤</span>
                      <span>Panel użytkownika</span>
                    </Link>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }} 
                      className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-lg text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
                    >
                      <span>🚪</span>
                      <span>Wyloguj</span>
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