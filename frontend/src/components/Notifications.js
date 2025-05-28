// frontend/src/components/Notifications.js
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Bell, CheckCircle, Trash2, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

const Notifications = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchNotifications = async (pageNum = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/notifications?page=${pageNum}&limit=${limit}`);
      setNotifications(response.data);
      setTotalPages(Math.ceil(response.headers['x-total-count'] / limit) || 1);
      setPage(pageNum);
    } catch (err) {
      const errorMessage = t(err.response?.data?.error || 'failed_fetch_notifications');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/notification/read`);
      setNotifications(notifications.map((n) => (n._id === id ? { ...n, read: true } : n)));
      toast.success(t('notification_read'));
    } catch (err) {
      toast.error(t(err.response?.data?.error || 'failed_mark_read'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirm_delete_notification'))) return;
    try {
      await api.delete(`/notifications/${id}/notification`);
      setNotifications(notifications.filter((n) => n._id !== id));
      toast.success(t('notification_deleted'));
    } catch (err) {
      toast.error(t(err.response?.data?.error || 'failed_delete_notification'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Bell className="w-6 h-6 text-blue-600 animate-spin" />
        <p className="ml-2 text-gray-600">{t('loading_notifications')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center p-3 border border-red-200 rounded-lg bg-red-50">
        <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
        <p className="text-sm text-gray-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">{t('notifications')}</h2>
      {notifications.length === 0 ? (
        <p className="text-gray-600">{t('no_notifications')}</p>
      ) : (
        <>
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 rounded-lg shadow-sm flex items-center justify-between ${
                notification.read ? 'bg-gray-50' : 'bg-blue-50'
              }`}
            >
              <div>
                <h3 className="text-sm font-medium text-gray-800">{notification.title}</h3>
                <p className="text-sm text-gray-600">{notification.description}</p>
                <p className="text-xs text-gray-500">
                  {t('from')}: {notification.sender?.username || t('system')} -{' '}
                  {new Date(notification.createdAt).toLocaleString('en-US', {
                    timeZone: 'Africa/Addis_Ababa',
                  })}
                </p>
              </div>
              <div className="flex space-x-2">
                {!notification.read && (
                  <button
                    onClick={() => handleMarkAsRead(notification._id)}
                    className="text-blue-600 hover:text-blue-800"
                    aria-label={t('mark_as_read')}
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                )}
                {localStorage.getItem('role') === 'admin' && (
                  <button
                    onClick={() => handleDelete(notification._id)}
                    className="text-red-600 hover:text-red-800"
                    aria-label={t('delete_notification')}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => fetchNotifications(page - 1)}
              disabled={page === 1}
              className="flex items-center px-3 py-1 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t('previous')}
            </button>
            <span className="text-sm text-gray-600">
              {t('page')} {page} {t('of')} {totalPages}
            </span>
            <button
              onClick={() => fetchNotifications(page + 1)}
              disabled={page === totalPages}
              className="flex items-center px-3 py-1 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              {t('next')}
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Notifications;