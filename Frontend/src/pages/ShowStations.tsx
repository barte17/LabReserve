import { useEffect } from "react";

export default function Stanowiska() {
  useEffect(() => {
    document.title = "Stanowiska";
  }, []);

  return (
    <div>
      <h1>Lista stanowisk</h1>

      {/* Tutaj w przyszłości pojawią się dane z backendu */}

      <div>
        Tutaj będą wyświetlane stanowiska do rezerwacji.
      </div>
    </div>
  );
}
