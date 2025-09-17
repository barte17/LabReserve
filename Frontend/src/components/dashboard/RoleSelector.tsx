import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Role {
  key: string;
  label: string;
  icon: string;
  color: string;
}

interface RoleSelectorProps {
  availableRoles: Role[];
  onRoleSelect: (role: string) => void;
}

export default function RoleSelector({ availableRoles, onRoleSelect }: RoleSelectorProps) {
  const navigate = useNavigate();

  const handleRoleClick = (roleKey: string) => {
    onRoleSelect(roleKey);
    navigate(`/panel?view=${roleKey}`);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {availableRoles.map((role) => (
        <div
          key={role.key}
          onClick={() => handleRoleClick(role.key)}
          className={`
            ${role.color} text-white rounded-xl p-8 cursor-pointer 
            transform transition-all duration-200 hover:scale-105 hover:shadow-xl
            border-2 border-transparent hover:border-white/20
          `}
        >
          <div className="text-center">
            <div className="text-4xl mb-4">{role.icon}</div>
            <h3 className="text-xl font-bold mb-2">{role.label}</h3>
            <p className="text-white/80 text-sm">
              {role.key === 'admin' && 'Pełne zarządzanie systemem'}
              {role.key === 'opiekun' && 'Zarządzanie przypisanymi salami'}
              {role.key === 'user' && 'Rezerwowanie sal i stanowisk'}
            </p>
          </div>
          
          <div className="mt-6 flex items-center justify-center">
            <span className="text-sm font-medium">
              Przejdź do panelu →
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}