import { useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { useTranslation } from 'react-i18next';
    import { FiEye, FiEyeOff } from 'react-icons/fi';
    import api from '../../services/api';

    const Register = () => {
      const { t } = useTranslation();
      const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'patient', // Default role
      });
      const [errors, setErrors] = useState({});
      const [isLoading, setIsLoading] = useState(false);
      const [apiError, setApiError] = useState('');
      const [showPassword, setShowPassword] = useState(false);
      const navigate = useNavigate();

      const validateForm = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!formData.firstName) newErrors.firstName = t('first_name_required');
        if (!formData.lastName) newErrors.lastName = t('last_name_required');
        if (!formData.email) {
          newErrors.email = t('email_required');
        } else if (!emailRegex.test(formData.email)) {
          newErrors.email = t('invalid_email');
        }
        if (!formData.password) {
          newErrors.password = t('password_required');
        } else if (!passwordRegex.test(formData.password)) {
          newErrors.password = t('password_requirements');
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = t('passwords_must_match');
        }
        if (!formData.role) newErrors.role = t('role_required');

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        if (!validateForm()) return;

        console.log('Sending registration data:', formData);
        setIsLoading(true);
        try {
          await api.post('/auth/register', {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          });
          navigate('/activate', { state: { email: formData.email } });
        } catch (err) {
          console.error('Registration error:', err.response?.data);
          setApiError(t(err.response?.data?.error || 'registration_failed'));
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
        <div className="space-y-6">
          {apiError && (
            <div
              className="flex items-center justify-between p-4 text-red-700 bg-red-100 rounded-lg"
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
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                {t('first_name')}
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                placeholder={t('enter_first_name')}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-invalid={errors.firstName ? 'true' : 'false'}
                aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                disabled={isLoading}
              />
              {errors.firstName && (
                <p id="firstName-error" className="mt-1 text-sm text-red-500">
                  {errors.firstName}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                {t('last_name')}
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                placeholder={t('enter_last_name')}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-invalid={errors.lastName ? 'true' : 'false'}
                aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                disabled={isLoading}
              />
              {errors.lastName && (
                <p id="lastName-error" className="mt-1 text-sm text-red-500">
                  {errors.lastName}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('enter_email')}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
                disabled={isLoading}
              />
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-500">
                  {errors.email}
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
            <div className="relative">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t('confirm_password')}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t('confirm_password')}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="mt-1 text-sm text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                {t('role')}
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.role ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-invalid={errors.role ? 'true' : 'false'}
                aria-describedby={errors.role ? 'role-error' : undefined}
                disabled={isLoading}
              >
                <option value="patient">{t('patient')}</option>
                <option value="provider">{t('provider')}</option>
                <option value="admin">{t('admin')}</option>
              </select>
              {errors.role && (
                <p id="role-error" className="mt-1 text-sm text-red-500">
                  {errors.role}
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
              {isLoading ? t('registering') : t('register')}
            </button>
          </form>
          <div className="text-center">
            <button
              onClick={() => navigate('/login')}
              className="w-full p-3 text-teal-600 transition duration-300 rounded-lg bg-teal-50 hover:bg-teal-100"
              disabled={isLoading}
            >
              {t('already_have_account')}
            </button>
          </div>
        </div>
      );
    };

    export default Register;