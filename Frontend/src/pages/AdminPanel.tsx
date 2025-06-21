import { useEffect } from "react";

export default function PanelAdmina() {
  useEffect(() => {
    document.title = "Panel admina";
  }, []);

  return (
    <div>
      <h1>Panel admina</h1>
    </div>
  );
}
