import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.identifier) newErrors.identifier = t('identifier_required');
    if (!formData.password) newErrors.password = t('password_required');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await login(formData.identifier, formData.password);
      console.log('Login response:', response);
      if (response.needsProviderSelection) {
        navigate('/select-provider', {
          state: { providers: response.providers, userId: response.userId },
        });
      } else {
        navigate(response.role === 'provider' ? '/provider' : '/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err.response?.data);
      setApiError(t(err.response?.data?.error || 'login_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="max-w-md p-6 mx-auto bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-center">{t('login')}</h2>
      {apiError && (
        <div
          className="flex items-center justify-between p-4 mb-6 text-red-700 bg-red-100 rounded-lg"
          role="alert"
        >
          <span>{apiError}</span>
          <button
            onClick={() => setApiError('')}
            className="text-red-700 hover:text-red-900"
            aria-label={t('dismiss_error')}
          >
            ✕
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
            {t('email_or_username')}
          </label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            value={formData.identifier}
            onChange={handleChange}
            placeholder={t('enter_email_or_username')}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              errors.identifier ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={errors.identifier ? 'true' : 'false'}
            aria-describedby={errors.identifier ? 'identifier-error' : undefined}
            disabled={isLoading}
            required
          />
          {errors.identifier && (
            <p id="identifier-error" className="mt-1 text-sm text-red-500">
              {errors.identifier}
            </p>
          )}
        </div>
        <div className="relative">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            {t('password')}
          </label>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            placeholder={t('enter_password')}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'password-error' : undefined}
            disabled={isLoading}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute text-gray-500 right-3 top-10"
            aria-label={showPassword ? t('hide_password') : t('show_password')}
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
          {errors.password && (
            <p id="password-error" className="mt-1 text-sm text-red-500">
            {errors.password}
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
        {isLoading ? t('logging_in') : t('login')}
      </button>
    </form>
    <div className="mt-4 text-center">
      <button
        onClick={() => navigate('/forgot-password')}
        className="text-teal-600 hover:underline"
        disabled={isLoading}
      >
        {t('forgot_password')}
      </button>
    </div>
    <div className="mt-2 text-center">
      <button
        onClick={() => navigate('/register')}
        className="text-teal-600 hover:underline"
        disabled={isLoading}
      >
        {t('dont_have_account')}
      </button>
    </div>
  </div>
);
};

export default Login;