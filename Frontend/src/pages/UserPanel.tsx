import { useEffect } from "react";

export default function PanelUzytkownika() {
  useEffect(() => {
    document.title = "Panel użytkownika";
  }, []);

  return (
    <div>
      <h1>Panel użytkownika</h1>
    </div>
  );
}
