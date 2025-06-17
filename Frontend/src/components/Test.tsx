import { useEffect, useState } from 'react';

// Zdefiniowanie typów danych
type Test = {
  id: number;
  name: string;
};

export default function Rooms() {
  const [tests, setTests] = useState<Test[]>([]); 

  useEffect(() => {
    fetch('http://localhost:5165/api/test')
      .then((res) => res.json())
      .then((data: Test[]) => setTests(data))
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
