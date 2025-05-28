// frontend/src/pages/Admin/AdminPage.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { AlertCircle, RefreshCw, Send } from 'lucide-react';
import { TextField, Button, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import Notifications from '../../components/Notifications';

const AdminPage = () => {
  const { t } = useTranslation();
  const [adminData, setAdminData] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      if (!token || role !== 'admin') {
        toast.error(t('please_login_admin'));
        navigate('/login', { state: { message: t('please_login_admin') } });
        return;
      }

      const [usersRes, contactsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/contacts'),
      ]);

      setAdminData(Array.isArray(usersRes.data) ? usersRes.data : []);
      setContacts(Array.isArray(contactsRes.data) ? contactsRes.data : []);
    } catch (err) {
      const errorMessage = t(err.response?.data?.error || 'failed_load_admin_data');
      setError(errorMessage);
      toast.error(errorMessage);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.clear();
        navigate('/login', { state: { message: t('session_expired') } });
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      await api.post('/notifications', {
        title: data.title,
        description: data.message,
        recipientType: data.recipientType,
      });
      toast.success(t('notification_created'));
      reset();
    } catch (err) {
      toast.error(t(err.response?.data?.error || 'failed_send_notification'));
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex items-center space-x-4">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-lg font-semibold text-gray-700">{t('loading_admin_data')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md p-4 mx-auto mt-8 border border-red-200 rounded-lg shadow-md bg-red-50">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <p className="text-lg font-medium text-gray-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-center text-blue-600">{t('admin_dashboard')}</h1>
      <p className="mb-8 text-lg text-center text-gray-600">{t('manage_users_resources_notifications')}</p>

      <div className="space-y-8">
        {/* Send Notification Form */}
        <div className="p-6 bg-white shadow-lg rounded-xl">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">{t('send_notification')}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TextField
              {...register('title', { required: t('title_required') })}
              label={t('notification_title')}
              fullWidth
              error={!!errors.title}
              helperText={errors.title?.message}
              variant="outlined"
            />
            <TextField
              {...register('message', { required: t('message_required') })}
              label={t('notification_message')}
              fullWidth
              multiline
              rows={4}
              error={!!errors.message}
              helperText={errors.message?.message}
              variant="outlined"
            />
            <FormControl fullWidth>
              <InputLabel>{t('recipient_type')}</InputLabel>
              <Select
                {...register('recipientType', { required: t('recipient_type_required') })}
                label={t('recipient_type')}
                defaultValue="all"
                error={!!errors.recipientType}
              >
                <MenuItem value="all">{t('all_users')}</MenuItem>
                <MenuItem value="patients">{t('patients')}</MenuItem>
                <MenuItem value="providers">{t('providers')}</MenuItem>
              </Select>
            </FormControl>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<Send />}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {t('send')}
            </Button>
          </form>
        </div>

        {/* Users Overview */}
        <div className="p-6 bg-white shadow-lg rounded-xl">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">{t('users_overview')}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('username')}</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('role')}</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('email')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {adminData.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{user.username}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{t(user.role)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contact Submissions */}
        <div className="p-6 bg-white shadow-lg rounded-xl">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">{t('contact_submissions')}</h2>
          {contacts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('email')}</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('message')}</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('submitted_at')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contacts.map((contact) => (
                    <tr key={contact._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{contact.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{contact.message}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {new Date(contact.createdAt).toLocaleString('en-US', { timeZone: 'Africa/Addis_Ababa' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">{t('no_contacts_yet')}</p>
          )}
        </div>

        {/* Notifications */}
        <div className="p-6 bg-white shadow-lg rounded-xl">
          <Notifications />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;