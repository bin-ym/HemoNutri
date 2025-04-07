import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, Clock, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';

const ProviderLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (!token || role !== 'provider') {
          navigate('/login');
          return;
        }
        const res = await api.get('/provider/logs');
        setLogs(Array.isArray(res.data) ? res.data : []);
        setError('');
      } catch (err) {
        console.error('Fetch logs error:', err.response?.data || err.message);
        const errorMsg = err.response?.data?.error || 'Failed to load patient logs';
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
    fetchLogs();
  }, [navigate]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-teal-50 to-gray-100">
        <Navbar role="provider" />
        <div className="flex items-center justify-center flex-grow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 border-4 border-teal-600 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-lg text-teal-700 animate-pulse">Loading logs...</p>
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
      <div className="flex-grow max-w-6xl p-6 mx-auto">
        {/* Header */}
        <div className="relative mb-12 text-center">
          <div className="absolute inset-0 h-32 bg-teal-600 rounded-b-full -top-8 opacity-10 blur-2xl"></div>
          <h1 className="relative text-4xl font-extrabold text-teal-700 md:text-5xl animate-fade-in">
            Patient Logs
          </h1>
          <p className="relative max-w-2xl mx-auto mt-3 text-lg text-gray-600">
            Track your patients’ food and fluid intake.
          </p>
          <Utensils className="relative w-12 h-12 mx-auto mt-4 text-teal-500 animate-bounce-slow" />
        </div>

        {/* Logs Section */}
        <section className="mb-12">
          <div className="p-6 bg-white shadow-lg rounded-xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-teal-100">
              <h2 className="text-2xl font-semibold text-teal-600">All Patient Logs</h2>
              <Utensils className="w-6 h-6 text-teal-500" />
            </div>
            {logs.length === 0 ? (
              <p className="text-center text-gray-500">No logs available yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {logs.map((log) => (
                  <div
                    key={log._id}
                    className="p-4 transition-all duration-300 border border-teal-100 rounded-lg shadow-md bg-teal-50 hover:shadow-xl"
                  >
                    <p className="font-medium text-gray-700">{log.patientUsername}</p>
                    <p className="text-gray-600">
                      {log.foodItem} - {log.quantity}
                      {log.isFluid ? 'ml' : 'g'}
                    </p>
                    <p className="flex items-center mt-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDate(log.date)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProviderLogsPage;