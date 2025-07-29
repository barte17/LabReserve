// src/pages/Login.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login(email, password);
      localStorage.setItem('accessToken', result.token);
      // Po zalogowaniu pobierz dane użytkownika, aby uzyskać rolę
      const userRes = await fetch('/api/account/me', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${result.token}`,
        },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        localStorage.setItem('userRoles', JSON.stringify(userData.roles || []));
      } else {
        localStorage.setItem('userRoles', JSON.stringify([]));
      }
      navigate('/');
      window.location.reload();
    } catch {
      setError('Nie udało się zalogować.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white text-gray-900 p-8 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Logowanie</h2>

        <input
          type="email"  
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 mb-4 border rounded focus:outline-none focus:ring focus:border-blue-300"
        />
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 mb-4 border rounded focus:outline-none focus:ring focus:border-blue-300"
        />

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          Zaloguj się
        </button>
        <p className="mt-4 text-center">
          Nie masz konta? <a href="/register" className="text-blue-500 hover:underline">Zarejestruj się</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
