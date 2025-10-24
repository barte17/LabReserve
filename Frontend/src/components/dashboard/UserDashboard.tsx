import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from './DashboardLayout';

export default function UserDashboard() {
  const { user, hasRole, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Określ dostępne role dla użytkownika
  const availableRoles = React.useMemo(() => {
    const roles: Array<{ key: string; label: string; icon: string; color: string }> = [];
    
    if (hasRole('Admin')) {
      roles.push({
        key: 'admin',
        label: 'Panel Administratora',
        icon: '🔧',
        color: 'bg-red-600 hover:bg-red-700'
      });
    }
    
    if (hasRole('Opiekun')) {
      roles.push({
        key: 'opiekun',
        label: 'Panel Opiekuna',
        icon: '👨‍🏫',
        color: 'bg-red-500 hover:bg-red-600'
      });
    }
    
    // Każdy user ma dostęp do panelu użytkownika
    roles.push({
      key: 'user',
      label: 'Panel Użytkownika',
      icon: '👤',
      color: 'bg-gray-600 hover:bg-gray-700'
    });
    
    return roles;
  }, [hasRole]);

  // Sprawdź view z URL lub ustaw domyślny
  useEffect(() => {
    const viewParam = searchParams.get('view');
    const sectionParam = searchParams.get('section');
    
    if (viewParam) {
      // Sprawdź czy user ma uprawnienia do tego widoku
      const hasPermission = 
        (viewParam === 'admin' && hasRole('Admin')) ||
        (viewParam === 'opiekun' && hasRole('Opiekun')) ||
        viewParam === 'user';
      
      if (hasPermission) {
        setSelectedRole(viewParam);
        // Zapisz ostatni wybrany panel w localStorage
        localStorage.setItem('lastSelectedPanel', viewParam);
        
        // Jeśli nie ma sekcji w URL, sprawdź czy jest zapisana w localStorage
        if (!sectionParam) {
          const savedSection = localStorage.getItem(`lastSection_${viewParam}`);
          if (savedSection) {
            // Aktualizuj URL z zapisaną sekcją
            navigate(`/panel?view=${viewParam}&section=${savedSection}`, { replace: true });
          }
        }
      } else {
        // Przekieruj do domyślnego panelu jeśli brak uprawnień
        const defaultRole = getDefaultRole();
        navigate(`/panel?view=${defaultRole}`);
      }
    } else {
      // Brak view w URL - wybierz domyślny lub ostatni używany
      const lastPanel = localStorage.getItem('lastSelectedPanel');
      const defaultRole = getDefaultRole();
      
      // Sprawdź czy ostatni panel jest nadal dostępny
      const targetRole = lastPanel && availableRoles.some(r => r.key === lastPanel) 
        ? lastPanel 
        : defaultRole;
      
      // Sprawdź czy jest zapisana sekcja dla tego panelu
      const savedSection = localStorage.getItem(`lastSection_${targetRole}`);
      const targetSection = savedSection || 'dashboard';
      
      navigate(`/panel?view=${targetRole}&section=${targetSection}`);
    }
  }, [searchParams, hasRole, navigate, availableRoles]);

  // Funkcja do określenia domyślnego panelu
  const getDefaultRole = () => {
    // Zawsze zaczynaj od panelu użytkownika, nawet jeśli ma inne role
    return 'user';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie panelu...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  // Loading state gdy selectedRole nie jest jeszcze ustawione
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie panelu...</p>
        </div>
      </div>
    );
  }

  // Renderuj wybrany panel
  const initialSection = searchParams.get('section') || 'dashboard';
  
  return (
    <DashboardLayout 
      role={selectedRole!}
      availableRoles={availableRoles}
      onRoleChange={setSelectedRole}
      initialSection={initialSection}
    />
  );
}