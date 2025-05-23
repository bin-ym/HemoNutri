import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle, User } from 'lucide-react';
import api from '../../services/api';

const SelectProvider = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { providers, userId } = location.state || {};
  const [selectedProvider, setSelectedProvider] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProvider) {
      setApiError(t('provider_required'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/select-provider', {
        userId,
        providerId: selectedProvider,
      });
      console.log('Provider selection response:', response.data);
      setApiError('');
      console.log('Navigating to /dashboard');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Provider selection error:', err.response?.data);
      setApiError(t(err.response?.data?.error || 'provider_selection_failed'));
      setIsLoading(false);
    }
  };

  const handleContinueWithoutProvider = () => {
    console.log('Continuing to dashboard without provider');
    navigate('/dashboard', { replace: true });
  };

  if (!providers || providers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 via-white to-gray-100">
        <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-xl animate-fade-in">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-blue-700">{t('select_provider')}</h2>
            <p className="mt-2 text-red-500">{t('no_providers_available')}</p>
          </div>
          <button
            onClick={handleContinueWithoutProvider}
            className="w-full p-3 text-white transition-all duration-300 bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 hover:scale-105"
            disabled={isLoading}
          >
            {t('continue_to_dashboard')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 via-white to-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-xl animate-fade-in">
        <div className="relative mb-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-blue-700">
            {t('select_provider')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">{t('choose_provider')}</p>
          <User className="absolute top-0 right-0 w-8 h-8 text-blue-500 animate-pulse" />
        </div>

        {apiError && (
          <div className="flex items-center p-3 mb-6 space-x-2 text-red-600 rounded-lg shadow-md bg-red-50 animate-slide-down">
            <AlertCircle className="flex-shrink-0 w-5 h-5" />
            <p className="text-sm font-medium">{apiError}</p>
            <button
              onClick={() => setApiError('')}
              className="ml-2 text-red-600 hover:text-red-800"
              aria-label={t('dismiss_error')}
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <label htmlFor="provider" className="block mb-2 text-sm font-semibold text-gray-700 transition-colors group-hover:text-blue-600">
              {t('choose_provider')}
            </label>
            <select
              id="provider"
              name="provider"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className={`w-full p-3 border rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                apiError && !selectedProvider ? 'border-red-500' : 'border-blue-200'
              }`}
              disabled={isLoading}
            >
              <option value="">{t('select_a_provider')}</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.username}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className={`flex items-center justify-center w-full p-3 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:scale-105 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">{isLoading ? t('submitting') : t('submit')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default SelectProvider;