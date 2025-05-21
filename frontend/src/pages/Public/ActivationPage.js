import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

const ActivationPage = () => {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      setError(t('invalid_activation_code'));
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/activate', { email, code });
      navigate('/login', { state: { message: t('account_activated') } });
    } catch (err) {
      setError(t(err.response?.data?.error || 'activation_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex items-center justify-center flex-grow px-4 py-8">
        <section className="w-full max-w-md p-8 bg-white shadow-lg rounded-xl">
          <h1 className="mb-8 text-3xl font-semibold text-center text-teal-600" role="heading" aria-level="1">
            {t('activate_account')}
          </h1>
          <p className="mb-6 text-center text-gray-600">
            {t('enter_activation_code', { email })}
          </p>
          {error && (
            <div
              className="flex items-center justify-between p-4 text-red-700 bg-red-100 rounded-lg"
              role="alert"
            >
              <span>{error}</span>
              <button
                onClick={() => setError('')}
                className="text-red-700 hover:text-red-900"
                aria-label={t('dismiss_error')}
              >
                ✕
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                {t('activation_code')}
              </label>
              <input
                id="code"
                name="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={t('enter_code')}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'code-error' : undefined}
                disabled={isLoading}
                maxLength={6}
              />
              {error && (
                <p id="code-error" className="mt-1 text-sm text-red-500">
                  {error}
                </p>
              )}
            </div>
            <button
              type="submit"
              className={`w-full p-3 text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition duration-300 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? t('verifying') : t('verify_code')}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default ActivationPage;