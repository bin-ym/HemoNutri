import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import Notifications from '../components/Notifications';

const DashboardPage = () => {
  const [foodLogs, setFoodLogs] = useState([]);
  const [newLog, setNewLog] = useState({ foodItem: '', quantity: '', date: '' });

  useEffect(() => {
    const fetchFoodLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/patient/food-logs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFoodLogs(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFoodLogs();
  }, []);

  const handleAddLog = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await api.post('/patient/food-logs', newLog, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFoodLogs([...foodLogs, res.data]);
      setNewLog({ foodItem: '', quantity: '', date: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar role="patient" />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Patient Dashboard</h1>
        <form onSubmit={handleAddLog} className="mb-6 space-y-4">
          <input
            type="text"
            value={newLog.foodItem}
            onChange={(e) => setNewLog({ ...newLog, foodItem: e.target.value })}
            placeholder="Food Item"
            className="w-full p-2 border rounded"
          />
          <input
            type="number"
            value={newLog.quantity}
            onChange={(e) => setNewLog({ ...newLog, quantity: e.target.value })}
            placeholder="Quantity (g)"
            className="w-full p-2 border rounded"
          />
          <input
            type="date"
            value={newLog.date}
            onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Add Food Log
          </button>
        </form>
        <ul className="space-y-2">
          {foodLogs.map((log) => (
            <li key={log._id} className="p-2 bg-white rounded shadow-sm">
              {log.foodItem} - {log.quantity}g on {new Date(log.date).toLocaleDateString()}
            </li>
          ))}
        </ul>
        <Notifications /> {/* Add notifications here */}
      </div>
    </div>
  );
};

export default DashboardPage;