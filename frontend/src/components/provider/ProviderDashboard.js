import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import Notifications from '../components/Notifications';

const ProviderPage = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/provider/patients', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatients(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPatients();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar role="provider" />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Provider Dashboard</h1>
        <h2 className="text-xl font-semibold mb-4">Patients</h2>
        <ul className="space-y-2">
          {patients.map((patient) => (
            <li key={patient._id} className="p-2 bg-white rounded shadow-sm">
              {patient.username} - Last Log: {patient.foodLogs.length > 0 ? new Date(patient.foodLogs[0].date).toLocaleDateString() : 'No logs'}
            </li>
          ))}
        </ul>
        <Notifications /> {/* Add notifications here */}
      </div>
    </div>
  );
};

export default ProviderPage;