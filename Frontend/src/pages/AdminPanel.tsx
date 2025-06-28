import { useEffect } from "react";

export default function PanelAdmina() {
  useEffect(() => {
    document.title = "Panel admina";
  }, []);

  return (
    <div>
      <h1>Panel admina</h1>
      <div>
        <button>Wyświetl rezerwacje</button>
        <button>Dodaj salę</button>
        <button>Dodaj stanowisko</button>
        <button>Zarządzaj użytkownikami</button>
      </div>
    </div>
  );
}
