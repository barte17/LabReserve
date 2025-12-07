import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UnauthorizedMessageProps {
  type: 'business_roles' | 'stanowiska' | 'sale' | 'admin' | 'opiekun';
  className?: string;
}

const UnauthorizedMessage: React.FC<UnauthorizedMessageProps> = ({ type, className = '' }) => {
  const { hasRole } = useAuth();

  const getMessage = (): { title: string; description: string; contact?: boolean } => {
    switch (type) {
      case 'business_roles':
        return {
          title: 'Brak uprawnień',
          description: 'Aby korzystać z funkcji rezerwacji, twoje konto musi mieć odpowiednie uprawnienia.',
          contact: true
        };
      case 'stanowiska':
        return {
          title: 'Brak uprawnień do rezerwacji stanowisk',
          description: 'Aby rezerwować stanowiska laboratoryjne, potrzebujesz roli Student, Nauczyciel, Opiekun lub Admin.',
          contact: true
        };
      case 'sale':
        return {
          title: 'Brak uprawnień do rezerwacji sal',
          description: 'Tylko nauczyciele, opiekunowie i administratorzy mogą rezerwować sale laboratoryjne.',
          contact: hasRole('Student') // Studenci mogą prosić o upgrade
        };
      case 'admin':
        return {
          title: 'Brak uprawnień administratora',
          description: 'Ta funkcja jest dostępna tylko dla administratorów systemu.',
          contact: false
        };
      case 'opiekun':
        return {
          title: 'Brak uprawnień opiekuna',
          description: 'Ta funkcja jest dostępna tylko dla opiekunów sal i administratorów.',
          contact: true
        };
      default:
        return {
          title: 'Brak uprawnień',
          description: 'Nie masz wystarczających uprawnień do wykonania tej akcji.',
          contact: true
        };
    }
  };

  const { title, description, contact } = getMessage();

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800 mb-1">
            {title}
          </h3>
          <p className="text-sm text-yellow-700 mb-3">
            {description}
          </p>
          {contact && (
            <div className="text-sm">
              <p className="text-yellow-700 mb-2">
                Aby uzyskać niezbędne uprawnienia musisz:
              </p>
              <ul className="list-disc list-inside text-yellow-600 space-y-1">
                <li>Być zalogowanym</li>
                <li>Posiadać status studenta lub nauczyciela</li>
                <li>Jeśli uważasz, że to błąd, skontaktuj się z administratorem systemu</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedMessage;