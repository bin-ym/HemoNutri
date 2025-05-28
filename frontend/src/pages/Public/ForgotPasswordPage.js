// src/pages/Public/ForgotPasswordPage.js
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import api from '../../services/api';

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/auth/forgot-password', { identifier: data.identifier });
      toast.success(t('reset_link_sent'));
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(t(err.response?.data?.error || 'reset_request_failed'));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 via-white to-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-xl animate-fade-in">
        <h2 className="mb-6 text-2xl font-bold text-center text-blue-600">{t('forgot_password')}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="relative group">
            <label className="block mb-2 text-sm font-semibold text-gray-700 group-hover:text-blue-600">
              {t('email_or_username')}
            </label>
            <input
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
          <button
            type="submit"
            className={`w-full p-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting}
          >
            {t('send_reset_link')}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-blue-500 hover:text-blue-700 hover:underline"
            disabled={isSubmitting}
          >
            {t('back_to_login')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;