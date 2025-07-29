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

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="80"
    height="80"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ color: "#e0e0e0" }}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

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
    return <div style={styles.centeredContainer}>Ładowanie danych konta...</div>;
  }

  return (
    // Główny kontener centrujący kartę na stronie
    <div style={styles.centeredContainer}>
      <div style={styles.card}>
        <div style={styles.header}>
          <UserIcon />
          <h1 style={styles.userName}>
            {user.imie} {user.nazwisko}
          </h1>
          <p style={styles.userEmail}>{user.email}</p>
        </div>

        <div style={styles.details}>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Role:</span>
            {/* Wyświetlanie listy ról */}
            <span style={styles.detailValue}>
              {user.roles && user.roles.length > 0
                ? user.roles.join(", ")
                : "Brak"}
            </span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Numer telefonu:</span>
            <span style={styles.detailValue}>
              {user.numerTelefonu || "Nie podano"}
            </span>
          </div>
        </div>

        {/* Sekcja z przyciskami funkcyjnymi */}
        <div style={styles.actions}>
          <button style={styles.button}>Moje rezerwacje</button>
          <button style={styles.button}>Zmień dane</button>
          <button style={styles.button}>Poproś o weryfikację</button>
        </div>
      </div>
    </div>
  );
}

// Definicje stylów dla lepszej czytelności kodu
const styles: { [key: string]: React.CSSProperties } = {
  centeredContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "calc(100vh - 150px)", // Dopasuj wysokość w zależności od Twojego layoutu
    padding: "2rem",
    backgroundColor: "#f7fafc",
  },
  card: {
    width: "100%",
    maxWidth: "500px",
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
    padding: "2rem",
    textAlign: "center",
    border: "1px solid #e2e8f0",
  },
  header: {
    marginBottom: "1.5rem",
  },
  userName: {
    fontSize: "1.75rem",
    fontWeight: "600",
    margin: "0.5rem 0 0.25rem 0",
    color: "#2d3748",
  },
  userEmail: {
    fontSize: "1rem",
    color: "#718096",
    margin: 0,
  },
  details: {
    textAlign: "left",
    margin: "2rem 0",
    padding: "1rem 0",
    borderTop: "1px solid #e2e8f0",
    borderBottom: "1px solid #e2e8f0",
  },
  detailItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.5rem 0",
  },
  detailLabel: {
    fontWeight: "500",
    color: "#4a5568",
  },
  detailValue: {
    color: "#2d3748",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    marginTop: "1.5rem",
  },
  button: {
    width: "100%",
    padding: "0.75rem 1rem",
    fontSize: "1rem",
    fontWeight: "500",
    color: "#fff",
    backgroundColor: "#4299e1", // Tailwind blue-500
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.2s ease-in-out",
  },
};