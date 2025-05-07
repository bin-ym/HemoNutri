import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, AlertCircle, Plus } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import FoodLog from '../../components/FoodLog';

const FoodLogsPage = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddLog, setShowAddLog] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (!token || role !== 'patient') {
          navigate('/login');
          return;
        }
        const res = await api.get('/patient/food-logs');
        setLogs(Array.isArray(res.data) ? res.data : []);
        setError('');
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-teal-50 to-gray-100">
        <Navbar role="patient" />
        <div className="flex items-center justify-center flex-grow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 border-4 border-teal-600 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-lg text-teal-700 animate-pulse">Loading food logs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-teal-50 to-gray-100">
      <Navbar role="patient" />
      <div className="flex-grow max-w-6xl p-6 mx-auto">
        <div className="relative mb-12 text-center">
          <div className="absolute inset-0 h-32 bg-teal-600 rounded-b-full -top-8 opacity-10 blur-2xl"></div>
          <h1 className="relative text-4xl font-extrabold text-teal-700 md:text-5xl animate-fade-in">
            Food Logs
          </h1>
          <p className="relative max-w-2xl mx-auto mt-3 text-lg text-gray-600">
            Track your daily food and fluid intake.
          </p>
          <Utensils className="relative w-12 h-12 mx-auto mt-4 text-teal-500 animate-bounce-slow" />
        </div>
        {error && (
          <div className="p-4 mb-6 text-center text-red-500 rounded-lg shadow-md bg-red-50 animate-fade-in">
            <div className="flex items-center justify-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        )}
        <div className="p-6 bg-white shadow-xl rounded-xl">
          <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-teal-100">
            <h2 className="text-2xl font-semibold text-teal-600">Your Food Logs</h2>
            <button
              onClick={() => setShowAddLog(true)}
              className="flex items-center px-4 py-2 text-white bg-gradient-to-r from-teal-500 to-teal-700 rounded-full shadow-lg hover:from-teal-600 hover:to-teal-800 transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Log
            </button>
          </div>
          <FoodLog setLogs={setLogs} showAddLog={showAddLog} setShowAddLog={setShowAddLog} />
          {logs.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-4 text-xl font-semibold text-teal-600">Recent Logs</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {logs.map((log, index) => (
                  <div key={index} className="p-4 bg-teal-50 border border-teal-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
                    <span className="block text-gray-800">
                      {log.foodItem} - {log.quantity} {log.isFluid ? 'ml' : 'g'}
                    </span>
                    <span className="block mt-1 text-sm text-gray-600">
                      Carbs: {log.carbohydrates}g, Proteins: {log.proteins}g, Lipids: {log.lipids}g
                    </span>
                    <span className="block mt-1 text-sm text-gray-600">
                      K: {log.potassium}mg, P: {log.phosphorus}mg, Na: {log.sodium}mg
                    </span>
                    <span className="block mt-2 text-xs text-gray-500">
                      {new Date(log.date).toLocaleString()}
                    </span>
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

export default FoodLogsPage;