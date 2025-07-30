import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface UserData {
  id: string;
  email: string;
  imie: string;
  nazwisko: string;
  roles: string[]; 
  numerTelefonu: string | null;
}

export default function Account() {
  const [user, setUser] = useState<UserData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Moje konto";

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch("/api/account/me", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Nie udało się pobrać danych użytkownika");
        }

        const data = await response.json();
        setUser({
          ...data,
          roles: data.roles || [],
        });
      } catch {
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-neutral-600">Ładowanie danych konta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="card animate-scale-in">
          <div className="card-body text-center">
            {/* User Avatar */}
            <div className="mx-auto h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
              <svg className="h-10 w-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>

            {/* User Info */}
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              {user.imie} {user.nazwisko}
            </h1>
            <p className="text-neutral-600 mb-6">{user.email}</p>

            {/* User Details */}
            <div className="text-left space-y-4 mb-6 p-4 bg-neutral-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-neutral-700">Role:</span>
                <span className="text-neutral-600">
                  {user.roles && user.roles.length > 0
                    ? user.roles.map(role => (
                        <span key={role} className="badge badge-info ml-1">{role}</span>
                      ))
                    : <span className="badge badge-neutral">Brak</span>
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-neutral-700">Telefon:</span>
                <span className="text-neutral-600">
                  {user.numerTelefonu || "Nie podano"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full btn btn-primary">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Moje rezerwacje
              </button>
              <button className="w-full btn btn-secondary">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edytuj profil
              </button>
              <button className="w-full btn btn-secondary">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Poproś o weryfikację
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}