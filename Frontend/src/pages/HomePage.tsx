import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { isLogged, isLoading } = useAuth();
  
  // Sztywne dane marketingowe dla strony głównej - brak niepotrzebnych API calls
  const stats = {
    dostepneSale: 21,
    dostepneStanowiska: 30,
    liczbaUzytkownikow: "100+"
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.3),transparent_50%)]"></div>
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[radial-gradient(circle,rgba(168,85,247,0.4),transparent_70%)] rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[radial-gradient(circle,rgba(34,197,94,0.3),transparent_70%)] rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight animate-slide-in-left">
                LabReserve
                <span className="block text-blue-400 mt-2">
                  System rezerwacji sal i stanowisk laboratoryjnych
                </span>
              </h1>

              <p className="text-xl text-gray-300 mt-6 leading-relaxed max-w-2xl animate-slide-in-left-delay">
                Kompleksowe rozwiązanied do nowoczesnego zarządzania rezerwacją sal oraz stanowisk na uczelni. 
                Zbudowane zgodnie z OWASP, architekturą wielorolową i 
                możliwościami operacyjnymi w czasie rzeczywistym.
              </p>

              {/* CTA Buttons - różne dla zalogowanych i niezalogowanych */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-in-left-delay-2">
                {!isLoading && (
                  isLogged ? (
                    // Przyciski dla zalogowanych użytkowników
                    <>
                      <Link
                        to="/sale"
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg 
                                 transition-all duration-300 transform hover:scale-105 hover:shadow-xl
                                 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                      >
                        Lista Sal
                      </Link>
                      <Link
                        to="/stanowiska"
                        className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg 
                                 transition-all duration-300 transform hover:scale-105 hover:shadow-xl
                                 focus:outline-none focus:ring-4 focus:ring-green-500/50"
                      >
                        Lista Stanowisk
                      </Link>
                    </>
                  ) : (
                    // Przyciski dla niezalogowanych użytkowników
                    <>
                      <Link
                        to="/register"
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg 
                                 transition-all duration-300 transform hover:scale-105 hover:shadow-xl
                                 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                      >
                        Rejestracja
                      </Link>
                      <Link
                        to="/login"
                        className="px-8 py-4 bg-transparent border-2 border-gray-300 hover:border-white 
                                 text-gray-300 hover:text-white font-semibold rounded-lg
                                 transition-all duration-300 transform hover:scale-105
                                 focus:outline-none focus:ring-4 focus:ring-gray-500/50"
                      >
                        Logowanie
                      </Link>
                    </>
                  )
                )}
              </div>
            </div>

            {/* Right Column - Simple Preview */}
            <div className="relative animate-slide-in-right">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
                <h3 className="text-white text-xl font-semibold mb-4">System LabReserve</h3>
                <div className="space-y-3">
                  <div className="bg-green-500/20 p-3 rounded-lg">
                    <div className="text-green-300 text-sm">Dostępne Sale</div>
                    <div className="text-white text-2xl font-bold">21</div>
                  </div>
                  <div className="bg-purple-500/20 p-3 rounded-lg">
                    <div className="text-purple-300 text-sm">Dostępne Stanowiska</div>
                    <div className="text-white text-2xl font-bold">30</div>
                  </div>
                  <div className="bg-blue-500/20 p-3 rounded-lg">
                    <div className="text-blue-300 text-sm">Użytkownicy</div>
                    <div className="text-white text-2xl font-bold">Ponad 100</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Funkcjonalności i Możliwości Systemu
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Nowoczesna aplikacja webowa zbudowana z użyciem nowoczesnych technologii i technik programowania
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "🛡️",
                title: "Szkielet Bezpieczeństwa",
                description: "Implementacja zgodna z OWASP z uwierzytelnianiem JWT i kompleksowym logowaniem audytu."
              },
              {
                icon: "👥",
                title: "Wiele Ról",
                description: "Szczegółowe zarządzanie uprawnieniami dla studentów, opiekunów i administratorów."
              },
              {
                icon: "⚡",
                title: "Aktualizacje na żywo",
                description: "Operacje w czasie rzeczywistym i natychmiastowe powiadomienia z nowoczesnymi technologiami web."
              },
              {
                icon: "📋",
                title: "System logów",
                description: "Kompleksowe śledzenie najważniejszych akcji użytkowników i szczegółowe logi bezpieczeństwa."
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-4xl font-bold text-white mb-6">
              Gotowy na doświadczenie z LabReserve?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Poznaj nowoczesne podejście do zarządzania rezerwacjami z naszą bezpieczną i wydajną platformą.
            </p>
            
            {/* CTA różne dla zalogowanych i niezalogowanych */}
            {!isLoading && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isLogged ? (
                  // CTA dla zalogowanych
                  <>
                    <Link
                      to="/panel"
                      className="inline-block px-10 py-4 bg-white text-blue-600 font-bold rounded-xl text-lg
                                 hover:bg-blue-50 transform hover:scale-105 transition-all duration-300
                                 shadow-xl hover:shadow-2xl"
                    >
                      Przejdź do Panelu
                    </Link>
                    <Link
                      to="/sale"
                      className="inline-block px-10 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl text-lg
                                 hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-300
                                 shadow-xl hover:shadow-2xl"
                    >
                      Przeglądaj Sale
                    </Link>
                  </>
                ) : (
                  // CTA dla niezalogowanych
                  <>
                    <Link
                      to="/register"
                      className="inline-block px-10 py-4 bg-white text-blue-600 font-bold rounded-xl text-lg
                                 hover:bg-blue-50 transform hover:scale-105 transition-all duration-300
                                 shadow-xl hover:shadow-2xl"
                    >
                      Zarejestruj się
                    </Link>
                    <Link
                      to="/login"
                      className="inline-block px-10 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl text-lg
                                 hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-300
                                 shadow-xl hover:shadow-2xl"
                    >
                      Zaloguj się
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl font-bold mb-4">LabReserve</h3>
          <p className="text-gray-400 mb-4">
            Projekt pracy dyplomowej - Systemm rezerwacji sal i stanowisk laboratoryjnych w środowisku uczelnianym.
          </p>
          <p className="text-gray-500">
            &copy; 2025 LabReserve. Zbudowane z React, ASP.NET Core i nowoczesnymi standardami bezpieczeństwa.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;