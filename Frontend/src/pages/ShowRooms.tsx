import { useEffect } from "react";

export default function Sale() {
  useEffect(() => {
    document.title = "Sale";
  }, []);

  return (
    <div>
      <h1>Lista sal</h1>

      {/* Tutaj w przyszłości pojawią się dane z backendu */}
      
      <div>
        Tutaj będą wyświetlane sale do rezerwacji.
      </div>
    </div>
  );
}
