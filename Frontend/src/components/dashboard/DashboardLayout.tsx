import React, { useState, useEffect, useCallback } from 'react';
import { fetchMojeSale } from '../../services/salaService';
import { fetchMojeStanowiska } from '../../services/stanowiskoService';
import { fetchMojeRezerwacje } from '../../services/rezerwacjaService';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import DashboardContent from './DashboardContent';

interface Role {
  key: string;
  label: string;
  icon: string;
  color: string;
}

interface DashboardLayoutProps {
  role: string;
  availableRoles: Role[];
  onRoleChange: (role: string) => void;
  initialSection?: string;
}

export default function DashboardLayout({ role, availableRoles, onRoleChange, initialSection }: DashboardLayoutProps) {
  const [activeSection, setActiveSection] = useState(initialSection || 'dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [autoAdd, setAutoAdd] = useState<string | null>(null);
  const [autoFilterRezerwacje, setAutoFilterRezerwacje] = useState<string | null>(null);

  // Aktualizuj activeSection gdy zmieni się initialSection
  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);
  const [sidebarStats, setSidebarStats] = useState<{
    mojeSale?: number;
    mojeStanowiska?: number;
    oczekujaceRezerwacje?: number;
  }>({});

  // Ładowanie statystyk do sidebaru dla opiekuna niezależnie od aktywnej sekcji
  useEffect(() => {
    let isMounted = true;
    const loadSidebarStats = async () => {
      if (role !== 'opiekun') return;
      try {
        const [saleRes, stanowiskaRes, rezerwacjeRes] = await Promise.allSettled([
          fetchMojeSale(),
          fetchMojeStanowiska(),
          fetchMojeRezerwacje()
        ]);

        const mojeSale = saleRes.status === 'fulfilled' ? saleRes.value.length : 0;
        const mojeStanowiska = stanowiskaRes.status === 'fulfilled' ? stanowiskaRes.value.length : 0;
        const oczekujaceRezerwacje = rezerwacjeRes.status === 'fulfilled' 
          ? rezerwacjeRes.value.filter((r: any) => r.status === 'oczekujące').length 
          : 0;

        if (isMounted) {
          setSidebarStats({ mojeSale, mojeStanowiska, oczekujaceRezerwacje });
        }
      } catch {
        // ciche błędy - sidebar może pokazywać 0 gdy brak danych
      }
    };

    loadSidebarStats();
    return () => { isMounted = false; };
  }, [role, activeSection]);

  const handleSectionChange = useCallback((section: string, shouldAutoAdd: boolean = false, options?: { autoFilter?: string }) => {
    setActiveSection(section);
    // Set autoAdd based on section and type
    if (shouldAutoAdd) {
      if (section === 'uzytkownicy') {
        setAutoAdd('uzytkownicy-niezatwierdzeni');
      } else {
        setAutoAdd(section);
      }
    } else {
      setAutoAdd(null);
    }

    // Obsługa automatycznego filtra dla rezerwacji
    if (section === 'rezerwacje') {
      if (options?.autoFilter) {
        setAutoFilterRezerwacje(options.autoFilter);
      } else {
        setAutoFilterRezerwacje(null);
      }
    } else {
      setAutoFilterRezerwacje(null);
    }
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Layout container */}
      <div className="lg:flex">
        {/* Sidebar */}
        <div className={`
          fixed top-16 bottom-0 left-0 z-30 w-72 transform transition-transform duration-300 ease-in-out
          lg:static lg:top-0 lg:translate-x-0 lg:w-72 lg:flex-shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <DashboardSidebar
            role={role}
            availableRoles={availableRoles}
            activeSection={activeSection}
            onSectionChange={(section) => handleSectionChange(section, false)}
            onRoleChange={onRoleChange}
            onClose={() => setSidebarOpen(false)}
            stats={sidebarStats}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 lg:ml-0 min-h-screen">
          <DashboardHeader
            role={role}
            onMenuClick={() => setSidebarOpen(true)}
          />
          
          <main className="pt-4 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <DashboardContent
                role={role}
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
                autoAdd={autoAdd}
                onAutoAddProcessed={() => setAutoAdd(null)}
                onStatsUpdate={setSidebarStats}
                autoFilterRezerwacje={autoFilterRezerwacje}
                onAutoFilterProcessed={() => setAutoFilterRezerwacje(null)}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}