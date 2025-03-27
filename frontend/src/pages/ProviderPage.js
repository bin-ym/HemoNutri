import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import Notifications from '../components/Notifications';

const ProviderPage = () => {
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Provider token:', token);
        if (!token || localStorage.getItem('role') !== 'provider') {
          console.error('Invalid token or role, redirecting to login');
          navigate('/login');
          return;
        }
        const res = await api.get('/provider/patients', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Patients response:', res.data);
        setPatients(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Fetch patients error:', err.response?.data || err.message);
        setError(err.response?.data?.error || 'Failed to load patients');
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.error('Auth failure, redirecting to login');
          navigate('/login');
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

  if (loading) return <p className="text-center mt-10">Loading patients...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar role="provider" />
      <div className="max-w-6xl mx-auto p-6 flex-grow">
        <h1 className="text-3xl font-bold mb-6 text-teal-600">Provider Dashboard</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Assigned Patients</h2>
          {patients.length === 0 ? (
            <p className="text-gray-500">No patients assigned yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-teal-500 text-white">
                    <th className="p-3 text-left">Username</th>
                    <th className="p-3 text-left">Last Log</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr
                      key={patient._id}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => handlePatientClick(patient._id)}
                    >
                      <td className="p-3">{patient.username}</td>
                      <td className="p-3">
                        {patient.foodLogs && patient.foodLogs.length > 0
                          ? new Date(patient.foodLogs[0].date).toLocaleDateString()
                          : 'No logs'}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePatientClick(patient._id);
                          }}
                          className="bg-teal-500 text-white px-3 py-1 rounded hover:bg-teal-600"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="mt-6">
          <Notifications />
        </div>
      </div>
    </div>
  );
};

export default ProviderPage;