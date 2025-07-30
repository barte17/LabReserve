import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [imie, setImie] = useState('');
  const [nazwisko, setNazwisko] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Walidacja frontendowa
    const onlyLettersRegex = /^[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż\s-]+$/;
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!onlyLettersRegex.test(imie)) {
      setError('Imię może zawierać tylko litery.');
      setIsLoading(false);
      return;
    }

    if (!onlyLettersRegex.test(nazwisko)) {
      setError('Nazwisko może zawierać tylko litery.');
      setIsLoading(false);
      return;
    }

    if (!strongPasswordRegex.test(password)) {
      setError('Hasło musi mieć minimum 8 znaków, w tym dużą i małą literę, cyfrę oraz znak specjalny.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Hasła nie są identyczne.');
      setIsLoading(false);
      return;
    }

    try {
      await register(email, password, imie, nazwisko);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError('Rejestracja nie powiodła się. Sprawdź czy email nie jest już używany.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="card animate-scale-in">
            <div className="card-body text-center">
              <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Rejestracja zakończona!
              </h2>
              <p className="text-neutral-600 mb-4">
                Twoje konto zostało utworzone. Za chwilę zostaniesz przekierowany do strony logowania.
              </p>
              <div className="animate-spin h-6 w-6 border-2 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-neutral-900">
            Utwórz nowe konto
          </h2>
          <p className="mt-2 text-neutral-600">
            Wypełnij formularz, aby dołączyć do systemu rezerwacji
          </p>
        </div>

        {/* Form */}
        <div className="card animate-scale-in">
          <div className="card-body">
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="imie" className="form-label">
                    Imię
                  </label>
                  <input
                    id="imie"
                    type="text"
                    placeholder="Jan"
                    value={imie}
                    onChange={(e) => setImie(e.target.value)}
                    required
                    className="form-input"
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="nazwisko" className="form-label">
                    Nazwisko
                  </label>
                  <input
                    id="nazwisko"
                    type="text"
                    placeholder="Kowalski"
                    value={nazwisko}
                    onChange={(e) => setNazwisko(e.target.value)}
                    required
                    className="form-input"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Adres email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="jan.kowalski@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Hasło
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 znaków"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                  disabled={isLoading}
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Hasło musi zawierać: małą literę, dużą literę, cyfrę i znak specjalny
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Potwierdź hasło
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Powtórz hasło"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="form-input"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-slide-up">
                  <div className="flex">
                    <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn btn-primary btn-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Tworzenie konta...
                  </div>
                ) : (
                  'Utwórz konto'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-neutral-600">
            Masz już konto?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200">
              Zaloguj się tutaj
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
