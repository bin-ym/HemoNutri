// src/pages/Admin/AdminUsersPage.js
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { UserPlus, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import validator from 'validator';

const AdminUsersPage = () => {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();
  const [users, setUsers] = useState([]);
  const [apiError, setApiError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchUsers = async (pageNum = 1) => {
    try {
      const response = await api.get(`/admin/users?page=${pageNum}&limit=${limit}`);
      setUsers(response.data);
      setTotalPages(Math.ceil(response.headers['x-total-count'] / limit) || 1);
      setPage(pageNum);
      setApiError('');
    } catch (err) {
      const errorMessage = t(err.response?.data?.error || 'failed_fetch_users');
      setApiError(errorMessage);
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onSubmit = async (data) => {
    setApiError('');
    try {
      const response = await api.post('/admin/add-user', {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        role: data.role,
      });
      console.log('AdminUsersPage: Add user response', response.data);
      reset();
      setShowAddForm(false);
      fetchUsers(page);
      toast.success(t('user_added'));
    } catch (err) {
      const errorMessage = t(err.response?.data?.error || 'failed_add_user');
      setApiError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm(t('confirm_delete_user'))) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success(t('user_deleted'));
      fetchUsers(page);
    } catch (err) {
      const errorMessage = t(err.response?.data?.error || 'failed_delete_user');
      setApiError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-6 text-2xl font-bold text-blue-600">{t('manage_users')}</h1>

      {apiError && (
        <div className="flex items-center p-3 mb-6 text-red-600 rounded-lg bg-red-50">
          <p className="text-sm font-medium">{apiError}</p>
          <button
            onClick={() => setApiError('')}
            className="ml-auto text-red-600 hover:text-red-800"
            aria-label={t('dismiss_error')}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="flex items-center px-4 py-2 mb-6 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        <UserPlus className="w-5 h-5 mr-2" />
        {showAddForm ? t('cancel') : t('add_user')}
      </button>

      {showAddForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 mb-8 bg-white shadow-lg rounded-xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('first_name')}</label>
              <input
                {...register('firstName', { required: t('first_name_required'), minLength: { value: 2, message: t('first_name_too_short') } })}
                className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={t('enter_first_name')}
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('last_name')}</label>
              <input
                {...register('lastName', { required: t('last_name_required'), minLength: { value: 2, message: t('last_name_too_short') } })}
                className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={t('enter_last_name')}
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('email')}</label>
              <input
                {...register('email', {
                  required: t('email_required'),
                  validate: (value) => validator.isEmail(value.trim()) || t('invalid_email'),
                })}
                className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={t('enter_email')}
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('role')}</label>
              <select
                {...register('role', { required: t('role_required') })}
                className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.role ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">{t('select_role')}</option>
                <option value="patient">{t('patient')}</option>
                <option value="provider">{t('provider')}</option>
                <option value="admin">{t('admin')}</option>
              </select>
              {errors.role && <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>}
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full mt-4 p-2 flex items-center justify-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <UserPlus className="w-5 h-5 mr-2" />
            {isSubmitting ? t('adding') : t('add_user')}
          </button>
        </form>
      )}

      <div className="p-6 bg-white shadow-lg rounded-xl">
        <h2 className="mb-4 text-xl font-semibold text-gray-700">{t('users_list')}</h2>
        {users.length === 0 ? (
          <p className="text-gray-600">{t('no_users')}</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('username')}</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('email')}</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('role')}</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{user.username}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{t(user.role)}</td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="text-red-600 hover:text-red-800"
                          aria-label={t('delete_user')}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => fetchUsers(page - 1)}
                disabled={page === 1}
                className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                {t('previous')}
              </button>
              <span className="text-sm text-gray-600">
                {t('page')} {page} {t('of')} {totalPages}
              </span>
              <button
                onClick={() => fetchUsers(page + 1)}
                disabled={page === totalPages}
                className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                {t('next')}
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;