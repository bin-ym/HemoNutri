import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';

const ProviderPatientsPage = () => {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (!token || role !== 'provider') {
          navigate('/login');
          return;
        }
        const res = await api.get('/provider/patients');
        setPatients(Array.isArray(res.data) ? res.data : []);
        setError('');
      } catch (err) {
        console.error('Fetch patients error:', err.response?.data || err.message);
        const errorMsg = err.response?.data?.error || t('patients_error_load');
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
    fetchPatients();
  }, [navigate]);

  const handlePatientClick = (patientId) => {
    navigate(`/provider/patient/${patientId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
        <Navbar role="provider" />
        <div className="flex items-center justify-center flex-grow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-lg text-blue-700 animate-pulse">{t('patients_loading')}</p>
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
          <h1 className="relative text-4xl font-extrabold text-black md:text-5xl animate-fade-in">
            {t('patients_title')}
          </h1>
          <p className="relative max-w-2xl mx-auto mt-3 text-lg text-gray-600 sm:text-xl">
            {t('patients_subtitle')}
          </p>
          <Users className="relative w-12 h-12 mx-auto mt-4 text-blue-500 animate-bounce-slow" />
        </div>

        {/* Patients Section */}
        <section className="mb-12">
          <div className="p-6 bg-white shadow-lg rounded-xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-blue-100">
              <h2 className="text-2xl font-semibold text-black">{t('assigned_patients')}</h2>
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            {patients.length === 0 ? (
              <p className="text-center text-gray-500">{t('no_patients')}</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {patients.map((patient) => (
                  <div
                    key={patient._id}
                    className="p-4 transition-all duration-300 border border-blue-100 rounded-lg shadow-md cursor-pointer bg-blue-50 hover:shadow-xl hover:scale-105"
                    onClick={() => handlePatientClick(patient._id)}
                  >
                    <p className="font-medium text-gray-700">{patient.username}</p>
                    <p className="text-gray-600">{patient.email}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePatientClick(patient._id);
                      }}
                      className="px-3 py-1 mt-2 font-semibold text-white transition duration-300 bg-blue-700 rounded hover:bg-blue-900"
                    >
                      {t('view_details')}
                    </button>
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

export default ProviderPatientsPage;