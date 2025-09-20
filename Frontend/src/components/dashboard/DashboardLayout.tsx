import React, { useState } from 'react';
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

  const handleSectionChange = (section: string, shouldAutoAdd: boolean = false) => {
    setActiveSection(section);
    setAutoAdd(shouldAutoAdd ? section : null);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
            />
          </div>
        </main>
      </div>
    </div>
  );
}