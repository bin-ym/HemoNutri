import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, Utensils, MessageSquare, BookOpen, AlertCircle, Clock } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';

const ProviderPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [logs, setLogs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (!token || role !== 'provider') {
          navigate('/login');
          return;
        }
        const [patientsRes, logsRes, messagesRes, resourcesRes] = await Promise.all([
          api.get('/provider/patients'),
          api.get('/provider/logs'),
          api.get('/provider/messages'),
          api.get('/provider/education'),
        ]);
        setPatients(Array.isArray(patientsRes.data) ? patientsRes.data : []);
        setLogs(Array.isArray(logsRes.data) ? logsRes.data.slice(0, 5) : []);
        setMessages(Array.isArray(messagesRes.data) ? messagesRes.data.slice(0, 5) : []);
        setResources(Array.isArray(resourcesRes.data) ? resourcesRes.data.slice(0, 3) : []);
        setError('');
      } catch (err) {
        console.error('Fetch data error:', err.response?.data || err.message);
        const errorMsg = err.response?.data?.error || t('dashboard_error_load');
        setError(errorMsg);
        if (errorMsg.includes('Token expired') || errorMsg.includes('Token verification error')) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          navigate('/login', { state: { message: t('session_expired') } });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? t('date_unavailable') : date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
        <Navbar role="provider" />
        <div className="flex items-center justify-center flex-grow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-lg text-black animate-pulse">{t('dashboard_loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
        <Navbar role="provider" />
        <div className="flex items-center justify-center flex-grow">
          <div className="max-w-md p-6 border border-red-200 rounded-lg shadow-md bg-red-50">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <p className="text-lg text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
      <Navbar role="provider" />
      <div className="flex-grow max-w-6xl p-6 mx-auto">
        {/* Header */}
        <div className="relative mb-12 text-center">
          <div className="absolute inset-0 h-32 bg-blue-600 rounded-b-full -top-8 opacity-10 blur-2xl"></div>
          <h1 className="relative text-3xl font-extrabold text-black sm:text-4xl md:text-5xl animate-fade-in">
            {t('dashboard_title')}
          </h1>
          <p className="relative max-w-2xl mx-auto mt-3 text-base text-gray-600 sm:text-lg">
            {t('dashboard_subtitle')}
          </p>
          <Users className="relative w-12 h-12 mx-auto mt-4 text-blue-500 animate-bounce-slow" />
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 gap-6 mb-12 sm:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-xl hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-black">{t('patients')}</h2>
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-black">{patients.length}</p>
          </div>
          <div className="p-6 transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-xl hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-black">{t('Logs')}</h2>
              <Utensils className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-black">{logs.length}</p>
          </div>
          <div className="p-6 transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-xl hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-black">{t('messages')}</h2>
              <MessageSquare className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-black">{messages.length}</p>
          </div>
        </div>
        {/* Quick Actions */}
        <div className="p-6 bg-white shadow-lg rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-black">{t('Quick Actions')}</h2>
            <BookOpen className="w-6 h-6 text-blue-500" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button
              onClick={() => navigate('/provider/patients')}
              className="p-4 font-semibold text-white transition duration-300 bg-blue-700 rounded-lg hover:bg-blue-900 hover:scale-105"
            >
              {t('manage_patients')}
            </button>
            <button
              onClick={() => navigate('/provider/education')}
              className="p-4 font-semibold text-white transition duration-300 bg-blue-700 rounded-lg hover:bg-blue-900 hover:scale-105"
            >
              {t('add_resource')}
            </button>
            <button
              onClick={() => navigate('/provider/messages')}
              className="p-4 font-semibold text-white transition duration-300 bg-blue-700 rounded-lg hover:bg-blue-900 hover:scale-105"
            >
              {t('send_message')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderPage;