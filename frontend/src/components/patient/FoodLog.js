import { useState } from 'react';
import api from '../../services/api';

const FoodLog = ({ setLogs }) => {
  const [food, setFood] = useState('');
  const [amount, setAmount] = useState('');
  const [fluid, setFluid] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await api.post(
        '/patient/log',
        { food, amount, fluid },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLogs((prev) => [...prev, res.data]);
      setFood('');
      setAmount('');
      setFluid('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white p-4 shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Log Food & Fluid Intake</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={food}
          onChange={(e) => setFood(e.target.value)}
          placeholder="Food (e.g., Injera)"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (e.g., 300g)"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={fluid}
          onChange={(e) => setFluid(e.target.value)}
          placeholder="Fluid (e.g., 200ml water)"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Add Log
        </button>
      </form>
    </div>
  );
};

export default FoodLog;