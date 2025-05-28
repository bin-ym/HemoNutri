// src/pages/Public/LoginPage.js
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Lock, Mail, AlertCircle, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState(location.state?.message || '');

  const onSubmit = async (data) => {
    setApiError('');
    try {
      const response = await login(data.identifier.trim(), data.password);
      console.log('LoginPage: Login response', response);

      if (response.isTempPassword) {
        navigate(`/reset-password?token=${response.resetToken}`, { replace: true });
        return;
      }

      let redirectPath;
      if (response.needsProviderSelection) {
        redirectPath = '/select-provider';
        navigate(redirectPath, {
          state: { providers: response.providers, userId: response.userId },
          replace: true,
        });
      } else {
        redirectPath =
          response.role === 'provider' ? '/provider' :
          response.role === 'admin' ? '/admin' :
          '/dashboard';
        navigate(redirectPath, { replace: true });
        toast.success(t('login_success'));
      }
    } catch (err) {
      console.error('LoginPage: Login error', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      const errorMessage = t(err.response?.data?.error || err.message || 'login_failed');
      setApiError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 via-white to-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-xl animate-fade-in">
        <div className="relative mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-blue-700">{t('welcome_back')}</h2>
          <p className="mt-2 text-sm text-gray-600">{t('sign_in_health_journey')}</p>
          <LogIn className="absolute top-0 right-0 w-8 h-8 text-blue-500 animate-pulse" />
        </div>

        {apiError && (
          <div className="flex items-center p-3 mb-6 text-red-600 rounded-lg bg-red-50">
            <AlertCircle className="w-5 h-5 mr-2" />
            <p className="text-sm font-medium">{apiError}</p>
            <button
              onClick={() => setApiError('')}
              className="ml-auto text-red-600 hover:text-red-800"
              aria-label={t('dismiss_error')}
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <div className="relative group">
            <label className="block mb-2 text-sm font-semibold text-gray-700 group-hover:text-blue-600">
              {t('email_or_username')}
            </label>
            <input
              id="identifier"
              {...register('identifier', { required: t('identifier_required') })}
              className={`w-full p-3 pl-10 border rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.identifier ? 'border-red-500' : 'border-blue-200'
              }`}
              placeholder={t('enter_email_or_username')}
              disabled={isSubmitting}
            />
            <Mail className="absolute w-5 h-5 text-blue-400 left-3 top-10 group-hover:text-blue-600" />
            {errors.identifier && <p className="mt-1 text-sm text-red-500">{errors.identifier.message}</p>}
          </div>

          <div className="relative group">
            <label className="block mb-2 text-sm font-semibold text-gray-700 group-hover:text-blue-600">
              {t('password')}
            </label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              {...register('password', { required: t('password_required') })}
              className={`w-full p-3 pl-10 pr-10 border rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-blue-200'
              }`}
              placeholder={t('enter_password')}
              disabled={isSubmitting}
            />
            <Lock className="absolute w-5 h-5 text-blue-400 left-3 top-10 group-hover:text-blue-600" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute text-blue-400 right-3 top-10 hover:text-blue-600"
              aria-label={showPassword ? t('hide_password') : t('show_password')}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            className={`w-full p-3 flex items-center justify-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting}
          >
            <LogIn className="w-5 h-5 mr-2" />
            {isSubmitting ? t('logging_in') : t('login')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/forgot-password')}
            className="text-sm text-blue-500 hover:text-blue-700 hover:underline"
            disabled={isSubmitting}
          >
            {t('forgot_password')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;