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
}

export default function DashboardLayout({ role, availableRoles, onRoleChange }: DashboardLayoutProps) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [autoAdd, setAutoAdd] = useState<string | null>(null);
  const [autoFilterRezerwacje, setAutoFilterRezerwacje] = useState<string | null>(null);
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
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-16 bottom-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:relative lg:top-0 lg:translate-x-0 lg:flex lg:flex-col lg:w-64
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
      <div className="flex-1 lg:flex lg:flex-col lg:overflow-hidden">
        <DashboardHeader
          role={role}
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="flex-1 py-4 lg:overflow-y-auto">
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
  );
}