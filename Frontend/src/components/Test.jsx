import { useEffect, useState } from 'react';

export default function Rooms() {
  const [tests, setTests] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5165/api/test') // dostosuj port!
      .then((res) => res.json())
      .then((data) => setTests(data))
      .catch((err) => console.error('Błąd:', err));
  }, []);

  return (
    <div>
      <h2>Lista testów</h2>
      <ul>
        {tests.map((test) => (
          <li key={test.id}>{test.name}</li>
        ))}
      </ul>
    </div>
  );
}
