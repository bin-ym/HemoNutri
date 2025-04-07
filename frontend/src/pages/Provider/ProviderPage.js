import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Utensils, MessageSquare, BookOpen, AlertCircle, Clock } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';

const ProviderPage = () => {
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
        setLogs(Array.isArray(logsRes.data) ? logsRes.data.slice(0, 5) : []); // Top 5 logs
        setMessages(Array.isArray(messagesRes.data) ? messagesRes.data.slice(0, 5) : []); // Top 5 messages
        setResources(Array.isArray(resourcesRes.data) ? resourcesRes.data.slice(0, 3) : []); // Top 3 resources
        setError('');
      } catch (err) {
        console.error('Fetch data error:', err.response?.data || err.message);
        const errorMsg = err.response?.data?.error || 'Failed to load dashboard';
        setError(errorMsg);
        if (errorMsg.includes('Token expired') || errorMsg.includes('Token verification error')) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          navigate('/login', { state: { message: 'Your session has expired. Please log in again.' } });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-teal-50 to-gray-100">
        <Navbar role="provider" />
        <div className="flex items-center justify-center flex-grow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 border-4 border-teal-600 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-lg text-teal-700 animate-pulse">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-teal-50 to-gray-100">
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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-teal-50 to-gray-100">
      <Navbar role="provider" />
      <div className="flex-grow p-6 mx-auto max-w-7xl">
        {/* Header */}
        <div className="relative mb-12 text-center">
          <div className="absolute inset-0 h-32 bg-teal-600 rounded-b-full -top-8 opacity-10 blur-2xl"></div>
          <h1 className="relative text-4xl font-extrabold text-teal-700 md:text-5xl animate-fade-in">
            Provider Dashboard
          </h1>
          <p className="relative max-w-2xl mx-auto mt-3 text-lg text-gray-600">
            Monitor your patients, manage their nutrition, and communicate effectively.
          </p>
          <Users className="relative w-12 h-12 mx-auto mt-4 text-teal-500 animate-bounce-slow" />
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 gap-6 mb-12 md:grid-cols-3">
          <div className="p-6 transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-teal-600">Patients</h2>
              <Users className="w-6 h-6 text-teal-500" />
            </div>
            <p className="text-3xl font-bold text-gray-700">{patients.length}</p>
            <button
              onClick={() => navigate('/provider/patients')}
              className="mt-4 text-teal-600 hover:underline"
            >
              View All Patients
            </button>
          </div>
          <div className="p-6 transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-teal-600">Recent Logs</h2>
              <Utensils className="w-6 h-6 text-teal-500" />
            </div>
            <p className="text-3xl font-bold text-gray-700">{logs.length}</p>
            <button
              onClick={() => navigate('/provider/logs')}
              className="mt-4 text-teal-600 hover:underline"
            >
              See All Logs
            </button>
          </div>
          <div className="p-6 transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-teal-600">Messages</h2>
              <MessageSquare className="w-6 h-6 text-teal-500" />
            </div>
            <p className="text-3xl font-bold text-gray-700">{messages.length}</p>
            <button
              onClick={() => navigate('/provider/messages')}
              className="mt-4 text-teal-600 hover:underline"
            >
              View Messages
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 gap-6 mb-12 lg:grid-cols-2">
          {/* Recent Food Logs */}
          <div className="p-6 bg-white shadow-lg rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-teal-600">Recent Food Logs</h2>
              <Utensils className="w-6 h-6 text-teal-500" />
            </div>
            {logs.length === 0 ? (
              <p className="text-gray-500">No recent logs.</p>
            ) : (
              <ul className="space-y-3">
                {logs.map((log) => (
                  <li key={log._id} className="p-3 rounded-lg bg-teal-50">
                    <p className="text-gray-700">
                      {log.patientUsername}: {log.foodItem} - {log.quantity}
                      {log.isFluid ? 'ml' : 'g'}
                    </p>
                    <p className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDate(log.date)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent Messages */}
          <div className="p-6 bg-white shadow-lg rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-teal-600">Recent Messages</h2>
              <MessageSquare className="w-6 h-6 text-teal-500" />
            </div>
            {messages.length === 0 ? (
              <p className="text-gray-500">No recent messages.</p>
            ) : (
              <ul className="space-y-3">
                {messages.map((msg) => (
                  <li
                    key={msg._id}
                    className={`p-3 rounded-lg ${msg.isEmergency ? 'bg-red-50' : 'bg-teal-50'}`}
                  >
                    <p className="text-gray-700">
                      {msg.patientUsername}: {msg.content}
                    </p>
                    <p className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDate(msg.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 bg-white shadow-lg rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-teal-600">Quick Actions</h2>
            <BookOpen className="w-6 h-6 text-teal-500" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button
              onClick={() => navigate('/provider/patients')}
              className="p-4 text-white transition duration-300 bg-teal-600 rounded-lg hover:bg-teal-700"
            >
              Manage Patients
            </button>
            <button
              onClick={() => navigate('/provider/education')}
              className="p-4 text-white transition duration-300 bg-teal-600 rounded-lg hover:bg-teal-700"
            >
              Add Resource
            </button>
            <button
              onClick={() => navigate('/provider/messages')}
              className="p-4 text-white transition duration-300 bg-teal-600 rounded-lg hover:bg-teal-700"
            >
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderPage;