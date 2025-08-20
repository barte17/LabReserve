import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
  const { isLogged } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center animate-in">
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
            System Rezerwacji
            <span className="text-gradient block mt-2">sal i stanowisk laboratoryjnych</span>
          </h1>
          <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Nowoczesna platforma do zarządzania rezerwacjami sal uczelnianych i stanowisk laboratoryjnych. 
            Łatwe planowanie zajęć, przejrzyste zarządzanie zasobami, efektywne wykorzystanie infrastruktury akademickiej.
          </p>
          
          {!isLogged ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/login" className="btn btn-primary btn-lg">
                Zaloguj się
              </Link>
              <Link to="/register" className="btn btn-secondary btn-lg">
                Zarejestruj się
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/sale" className="btn btn-primary btn-lg">
                Przeglądaj Sale
              </Link>
              <Link to="/stanowiska" className="btn btn-secondary btn-lg">
                Przeglądaj stanowiska
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Co znajdziemy w systemie rezerwacji?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="card animate-slide-up">
            <div className="card-body text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                Łatwe Rezerwacje
              </h3>
              <p className="text-neutral-600">
                Intuicyjny interfejs pozwala na szybkie i wygodne dokonywanie rezerwacji w kilku krokach.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="card-body text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                Zarządzanie Salami uczelnianymi
              </h3>
              <p className="text-neutral-600">
                Kompleksowy przegląd wszystkich dostępnych sal wykładowych z szczegółowymi informacjami o wyposażeniu.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="card-body text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                Panel Administratora
              </h3>
              <p className="text-neutral-600">
                Zaawansowane narzędzia do zarządzania studentami, wykładowcami, salami i laboratoriami.
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="card animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="card-body text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                Responsywny Design
              </h3>
              <p className="text-neutral-600">
                Aplikacja działa płynnie na wszystkich urządzeniach - komputerach, tabletach i telefonach.
              </p>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="card animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="card-body text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                Bezpieczeństwo
              </h3>
              <p className="text-neutral-600">
                Zaawansowane mechanizmy uwierzytelniania i autoryzacji zapewniają pełne bezpieczeństwo danych.
              </p>
            </div>
          </div>

          {/* Feature 6 */}
          <div className="card animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <div className="card-body text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                Szybkość
              </h3>
              <p className="text-neutral-600">
                Nowoczesna architektura zapewnia błyskawiczne ładowanie i płynną pracę aplikacji.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Gotowy na rozpoczęcie?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Dołącz do społeczności systemu rezerwacji sal i stanowisk laboratoryjnych
          </p>
          {!isLogged && (
            <Link to="/register" className="btn bg-white text-primary-600 hover:bg-primary-50 btn-lg shadow-glow">
              Zarejestruj się!
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
