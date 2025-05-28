// frontend/src/pages/Admin/AdminBackupPage.js
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Database, Download, AlertCircle } from 'lucide-react';

const AdminBackupPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastBackup, setLastBackup] = useState(null);
  const [backupHistory, setBackupHistory] = useState([]);

  useEffect(() => {
    const fetchBackupHistory = async () => {
      try {
        const res = await api.get('/admin/backup/history');
        setBackupHistory(res.data);
      } catch (err) {
        const errorMessage = t(err.response?.data?.error || 'failed_fetch_backup_history');
        setError(errorMessage);
        toast.error(errorMessage);
        if (err.response?.status === 401) {
          window.location.href = '/login?session_expired=true';
        }
      }
    };
    fetchBackupHistory();
  }, [t]);

  const handleBackup = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/backup', { responseType: 'blob' });
      const contentDisposition = res.headers['content-disposition'];
      let filename = `HemoNutri_Backup_${new Date().toISOString().split('T')[0]}.json`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) filename = filenameMatch[1];
      }

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setLastBackup(new Date().toLocaleString());
      toast.success(t('backup_created'));

      const historyRes = await api.get('/admin/backup/history');
      setBackupHistory(historyRes.data);
    } catch (err) {
      const errorMessage = t(err.response?.data?.error || 'failed_create_backup');
      setError(errorMessage);
      toast.error(errorMessage);
      if (err.response?.status === 401) window.location.href = '/login?session_expired=true';
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = async (backupId, filename) => {
    try {
      const res = await api.get(`/admin/backup/${backupId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(t('backup_downloaded'));
    } catch (err) {
      const errorMessage = t(err.response?.data?.error || 'failed_download_backup');
      setError(errorMessage);
      toast.error(errorMessage);
      if (err.response?.status === 401) window.location.href = '/login?session_expired=true';
    }
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-center text-blue-600">{t('database_backup')}</h1>
      <p className="mb-8 text-lg text-center text-gray-600">{t('create_manage_backups')}</p>

      <div className="p-6 bg-white shadow-lg rounded-xl">
        <div className="space-y-6">
          <button
            onClick={handleBackup}
            disabled={loading}
            className={`flex items-center justify-center w-full sm:w-auto px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? <Database className="w-5 h-5 mr-2 animate-spin" /> : <Database className="w-5 h-5 mr-2" />}
            {loading ? t('creating_backup') : t('create_backup')}
          </button>

          {error && (
            <div className="flex items-center p-3 border border-red-200 rounded-lg bg-red-50">
              <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
              <p className="text-sm text-gray-800">{error}</p>
            </div>
          )}

          {lastBackup && (
            <div className="p-4 rounded-lg bg-blue-50">
              <p className="text-gray-800">{t('last_backup')}: {lastBackup}</p>
            </div>
          )}

          {backupHistory.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-gray-800">{t('backup_history')}</h2>
              <div className="space-y-3">
                {backupHistory.map((backup) => (
                  <div
                    key={backup._id}
                    className="flex items-center justify-between p-4 rounded-lg bg-blue-50 hover:bg-blue-100"
                  >
                    <div>
                      <p className="text-gray-800">{backup.filename}</p>
                      <p className="text-sm text-gray-600">{new Date(backup.timestamp).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => handleDownloadBackup(backup._id, backup.filename)}
                      className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t('download')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBackupPage;