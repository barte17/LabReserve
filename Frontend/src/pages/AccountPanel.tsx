import { useEffect } from "react";

export default function Account() {
  useEffect(() => {
    document.title = "Moje konto";
  }, []);

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1rem" }}>
      <h1>Moje konto</h1>
      <div style={{ marginTop: "1rem" }}>
        <div><strong>Id użytkownika:</strong> [tu będzie ID]</div>
        <div><strong>Email:</strong> [tu będzie email]</div>
        <div><strong>Imię:</strong> [tu będzie imię]</div>
        <div><strong>Nazwisko:</strong> [tu będzie nazwisko]</div>
        <div><strong>Rola:</strong> [tu będzie rola]</div>
        <div><strong>Numer telefonu:</strong> [tu będzie numer]</div>
        <div><strong>Tu będą funkcje dla zalogowanego konta</strong></div>
      </div>
    </div>
  );
}
