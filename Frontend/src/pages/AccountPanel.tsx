import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface UserData {
  id: string;
  email: string;
  imie: string;
  nazwisko: string;
  rola: string;
  numerTelefonu: string | null;
}

export default function Account() {
  const [user, setUser] = useState<UserData | null>(null);
  const [error, setError] = useState("");
  const navigate =  useNavigate();

  useEffect(() => {
    document.title = "Moje konto";

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            navigate('/login');
            return;
        }

        const response = await fetch("/api/account/me", {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Nie udało się pobrać danych użytkownika");
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError("Nie udało się załadować danych. Upewnij się, że jesteś zalogowany.");
      }
    };

    fetchUserData();
  }, []);

  if (error) {
    return <div style={{ padding: "1rem", color: "red" }}>{error}</div>;
  }

  if (!user) {
    return <div style={{ padding: "1rem" }}>Ładowanie danych konta...</div>;
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1rem" }}>
      <h1>Moje konto</h1>
      <div style={{ marginTop: "1rem" }}>
        <div><strong>Id użytkownika:</strong> {user.id}</div>
        <div><strong>Email:</strong> {user.email}</div>
        <div><strong>Imię:</strong> {user.imie}</div>
        <div><strong>Nazwisko:</strong> {user.nazwisko}</div>
        <div><strong>Rola:</strong> {user.rola}</div>
        <div><strong>Numer telefonu:</strong> {user.numerTelefonu || "Brak"}</div>
        <div><strong>Tu będą funkcje dla zalogowanego konta</strong></div>
      </div>
    </div>
  );
}
