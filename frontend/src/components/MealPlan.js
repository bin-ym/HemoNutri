import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, AlertCircle } from 'lucide-react';
import api from '../services/api';

const MealPlan = ({ onLog }) => {
  const navigate = useNavigate();
  const [mealPlan, setMealPlan] = useState({ breakfast: [], lunch: [], dinner: [] });
  const [loggedQuantities, setLoggedQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (!token || role !== 'patient') {
          navigate('/login');
          return;
        }
        const res = await api.get('/patient/meal-plan');
        const fetchedPlan = {
          breakfast: Array.isArray(res.data?.breakfast) ? res.data.breakfast : [],
          lunch: Array.isArray(res.data?.lunch) ? res.data.lunch : [],
          dinner: Array.isArray(res.data?.dinner) ? res.data.dinner : [],
        };
        setMealPlan(fetchedPlan);
        setError('');
      } catch (err) {
        console.error('Meal plan fetch error:', err.response?.data || err.message);
        setError(err.response?.data?.error || 'Failed to load meal plan.');
      } finally {
        setLoading(false);
      }
    };
    fetchMealPlan();
  }, [navigate]);

  const handleQuantityChange = (mealType, index, value) => {
    setLoggedQuantities((prev) => ({
      ...prev,
      [`${mealType}-${index}`]: value,
    }));
  };

  const handleLog = async (mealType, item, index) => {
    try {
      const consumedQuantity = loggedQuantities[`${mealType}-${index}`] || '';
      if (!consumedQuantity || parseFloat(consumedQuantity) <= 0) {
        throw new Error('Please enter a valid quantity to log');
      }
      const logData = {
        foodItem: item.name,
        quantity: parseFloat(consumedQuantity),
        isFluid: item.isFluid || false,
        date: new Date().toISOString(),
      };
      const res = await api.post('/patient/food-logs', logData);
      onLog(res.data);
      setLoggedQuantities((prev) => ({ ...prev, [`${mealType}-${index}`]: '' }));
      setError('');
      alert(`${item.name} logged with ${logData.quantity}${item.isFluid ? 'ml' : 'g'}!`);
    } catch (err) {
      console.error('Log error:', err.response?.data || err.message);
      setError(err.response?.data?.error || err.message || 'Failed to log item');
    }
  };

  if (loading) return <p className="mt-10 text-center text-gray-600">Loading your meal plan...</p>;
  if (error) return <p className="mt-10 text-center text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl">
      <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-teal-100">
        <h2 className="text-2xl font-semibold text-teal-600">Your Daily Meal Plan</h2>
        <Utensils className="w-6 h-6 text-teal-500" />
      </div>
      {Object.keys(mealPlan).every((key) => mealPlan[key].length === 0) ? (
        <div className="text-center">
          <p className="mb-4 text-gray-600">No meal plan assigned yet.</p>
          <button
            onClick={() => navigate('/messages')}
            className="px-4 py-2 text-white transition duration-300 bg-teal-600 rounded-lg shadow-md hover:bg-teal-700"
          >
            Contact Your Provider
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {['breakfast', 'lunch', 'dinner'].map((mealType) => (
            <div key={mealType}>
              <h3 className="pb-1 mb-3 text-lg font-medium text-teal-700 capitalize border-b border-teal-200">
                {mealType}
              </h3>
              {mealPlan[mealType].length === 0 ? (
                <p className="italic text-gray-500">No {mealType} items planned today.</p>
              ) : (
                <ul className="space-y-4">
                  {mealPlan[mealType].map((item, index) => (
                    <li
                      key={index}
                      className="flex flex-col items-start justify-between p-4 rounded-lg shadow-sm sm:flex-row sm:items-center bg-teal-50"
                    >
                      <span className="mb-2 font-medium text-gray-800 sm:mb-0">
                        {item.name} - {item.quantity}
                        {item.isFluid ? 'ml' : 'g'} (Planned)
                      </span>
                      <div className="flex items-center space-x-3">
                        <input
                          type="number"
                          min="0"
                          value={loggedQuantities[`${mealType}-${index}`] || ''}
                          onChange={(e) => handleQuantityChange(mealType, index, e.target.value)}
                          placeholder="Consumed"
                          className="w-24 p-2 border border-teal-200 rounded bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <span className="text-gray-600">{item.isFluid ? 'ml' : 'g'}</span>
                        <button
                          onClick={() => handleLog(mealType, item, index)}
                          className="px-4 py-1 text-white transition duration-300 bg-teal-600 rounded-lg hover:bg-teal-700"
                        >
                          Log
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
      {error && (
        <div className="flex items-center p-3 mt-4 space-x-2 text-red-500 rounded-lg bg-red-50">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default MealPlan;