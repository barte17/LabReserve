import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [lockoutInfo, setLockoutInfo] = useState<{remainingMinutes?: number, lockoutEnd?: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();

  // Validation functions
  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) return 'Email jest wymagany';
    if (!emailRegex.test(value)) return 'Podaj prawidłowy adres email';
    return '';
  };

  const validatePassword = (value: string) => {
    if (!value) return 'Hasło jest wymagane';
    if (value.length < 1) return 'Hasło nie może być puste';
    return '';
  };

  // Real-time validation handlers
  const handleEmailChange = (value: string) => {
    setEmail(value);
    setValidationErrors(prev => ({ ...prev, email: validateEmail(value) }));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setValidationErrors(prev => ({ ...prev, password: validatePassword(value) }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setErrorType('');
    setRemainingAttempts(null);
    setLockoutInfo(null);

    // Final validation
    const errors = {
      email: validateEmail(email),
      password: validatePassword(password)
    };

    setValidationErrors(errors);

    if (Object.values(errors).some(error => error !== '')) {
      setError('Proszę poprawić błędy w formularzu');
      setIsLoading(false);
      return;
    }
    
    try {
      const result = await login(email, password);
      refreshAuth(); // Odśwież stan autoryzacji
      navigate('/');
    } catch (loginError: any) {
      console.log('Login error caught:', loginError); 
      console.log('Error type:', loginError.type); 
      console.log('Remaining attempts:', loginError.remainingAttempts); 
      console.log('Failed attempts:', loginError.failedAttempts); 
      
      setError(loginError.message);
      setErrorType(loginError.type || '');
      
      if (loginError.remainingAttempts !== undefined) {
        setRemainingAttempts(loginError.remainingAttempts);
        console.log('Set remaining attempts to:', loginError.remainingAttempts); 
      }
      
      if (loginError.remainingMinutes || loginError.lockoutEnd) {
        setLockoutInfo({
          remainingMinutes: loginError.remainingMinutes,
          lockoutEnd: loginError.lockoutEnd
        });
        console.log('Set lockout info:', {
          remainingMinutes: loginError.remainingMinutes,
          lockoutEnd: loginError.lockoutEnd
        }); 
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-neutral-900">
            Zaloguj się do konta
          </h2>
          <p className="mt-2 text-neutral-600">
            Wprowadź swoje dane, aby uzyskać dostęp do systemu
          </p>
        </div>

        {/* Form */}
        <div className="card animate-scale-in">
          <div className="card-body">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Adres email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="twoj@email.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  required
                  className={`form-input ${validationErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  disabled={isLoading}
                />
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Hasło
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Wprowadź hasło"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  required
                  className={`form-input ${validationErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  disabled={isLoading}
                />
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                )}
              </div>

              {error && (
                <div className={`border rounded-lg p-4 animate-slide-up ${
                  errorType === 'rate_limited' ? 'bg-orange-50 border-orange-200' :
                  errorType === 'account_locked' || errorType === 'account_locked_now' ? 'bg-red-50 border-red-200' :
                  errorType === 'last_attempt_warning' ? 'bg-yellow-50 border-yellow-200' :
                  errorType === 'few_attempts_left' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <div className="flex">
                    <svg className={`h-5 w-5 mr-2 ${
                      errorType === 'rate_limited' ? 'text-orange-400' :
                      errorType === 'account_locked' || errorType === 'account_locked_now' ? 'text-red-400' :
                      errorType === 'last_attempt_warning' ? 'text-yellow-400' :
                      errorType === 'few_attempts_left' ? 'text-yellow-400' :
                      'text-red-400'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {errorType === 'rate_limited' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      ) : errorType === 'account_locked' || errorType === 'account_locked_now' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      ) : errorType === 'last_attempt_warning' || errorType === 'few_attempts_left' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        errorType === 'rate_limited' ? 'text-orange-700' :
                        errorType === 'account_locked' || errorType === 'account_locked_now' ? 'text-red-700' :
                        errorType === 'last_attempt_warning' ? 'text-yellow-700' :
                        errorType === 'few_attempts_left' ? 'text-yellow-700' :
                        'text-red-700'
                      }`}>{error}</p>
                      
                      {remainingAttempts !== null && remainingAttempts >= 0 && (
                        <p className={`text-xs mt-1 ${
                          errorType === 'last_attempt_warning' ? 'text-yellow-600' :
                          errorType === 'few_attempts_left' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {remainingAttempts === 0 ? 
                            'Brak pozostałych prób' : 
                            `Pozostało prób: ${remainingAttempts}`
                          }
                        </p>
                      )}
                      
                      {lockoutInfo && lockoutInfo.remainingMinutes && (
                        <p className="text-xs mt-1 text-red-600">
                          Konto zostanie odblokowane za {lockoutInfo.remainingMinutes} minut
                        </p>
                      )}
                      
                      {errorType === 'rate_limited' && (
                        <p className="text-xs mt-1 text-orange-600">
                          Przekroczono limit prób logowania z tego adresu IP
                        </p>
                      )}
                    </div>
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
                    Logowanie...
                  </div>
                ) : (
                  'Zaloguj się'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-neutral-600">
            Nie masz jeszcze konta?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200">
              Zarejestruj się tutaj
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
