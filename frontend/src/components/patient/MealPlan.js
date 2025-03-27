import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom'; // Added for redirect

const MealPlan = ({ onLog }) => {
  const navigate = useNavigate(); // Added
  const [mealPlan, setMealPlan] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
  });
  const [loggedQuantities, setLoggedQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('MealPlan token:', token); // Debug
        if (!token) {
          console.error('No token found, redirecting to login');
          navigate('/login');
          return;
        }
        const res = await api.get('/patient/meal-plan', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('MealPlan response:', res.data); // Debug
        setMealPlan({
          breakfast: res.data?.breakfast || [],
          lunch: res.data?.lunch || [],
          dinner: res.data?.dinner || [],
        });
      } catch (err) {
        console.error('MealPlan fetch error:', err.response?.data || err.message);
        setError(err.response?.data?.error || 'Failed to load meal plan');
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.error('Auth failure, redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          navigate('/login');
        }
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
      const token = localStorage.getItem('token');
      console.log('Log token:', token); // Debug
      if (!token) {
        console.error('No token for logging, redirecting to login');
        navigate('/login');
        return;
      }
      const consumedQuantity = loggedQuantities[`${mealType}-${index}`] || '';
      if (!consumedQuantity) throw new Error('Enter a quantity to log');
      const logData = {
        foodItem: item.name,
        quantity: parseFloat(consumedQuantity),
        isFluid: item.isFluid || false,
      };
      console.log('Logging:', logData);
      const res = await api.post('/patient/food-logs', logData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onLog(res.data);
      setLoggedQuantities((prev) => ({ ...prev, [`${mealType}-${index}`]: '' }));
      alert(`${item.name} logged with ${logData.quantity}${item.isFluid ? 'ml' : 'g'}!`);
    } catch (err) {
      console.error('Log error:', err.response?.data || err.message);
      setError(err.response?.data?.error || err.message || 'Failed to log item');
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.error('Auth failure in log, redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
      }
    }
  };

  if (loading) return <p>Loading meal plan...</p>;

  return (
    <div className="bg-white p-4 shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Your Daily Meal Plan</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="space-y-6">
        {/* Breakfast */}
        <div>
          <h3 className="text-lg font-medium mb-2">Breakfast</h3>
          {mealPlan.breakfast.length === 0 ? (
            <p className="text-gray-500">No breakfast items planned.</p>
          ) : (
            <ul className="space-y-2">
              {mealPlan.breakfast.map((item, index) => (
                <li key={index} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                  <span>
                    {item.name} - {item.quantity}
                    {item.isFluid ? 'ml' : 'g'} (Planned)
                  </span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      value={loggedQuantities[`breakfast-${index}`] || ''}
                      onChange={(e) => handleQuantityChange('breakfast', index, e.target.value)}
                      placeholder="Consumed"
                      className="w-20 p-1 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <span>{item.isFluid ? 'ml' : 'g'}</span>
                    <button
                      onClick={() => handleLog('breakfast', item, index)}
                      className="bg-teal-500 text-white px-3 py-1 rounded hover:bg-teal-600"
                    >
                      Log
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Lunch */}
        <div>
          <h3 className="text-lg font-medium mb-2">Lunch</h3>
          {mealPlan.lunch.length === 0 ? (
            <p className="text-gray-500">No lunch items planned.</p>
          ) : (
            <ul className="space-y-2">
              {mealPlan.lunch.map((item, index) => (
                <li key={index} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                  <span>
                    {item.name} - {item.quantity}
                    {item.isFluid ? 'ml' : 'g'} (Planned)
                  </span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      value={loggedQuantities[`lunch-${index}`] || ''}
                      onChange={(e) => handleQuantityChange('lunch', index, e.target.value)}
                      placeholder="Consumed"
                      className="w-20 p-1 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <span>{item.isFluid ? 'ml' : 'g'}</span>
                    <button
                      onClick={() => handleLog('lunch', item, index)}
                      className="bg-teal-500 text-white px-3 py-1 rounded hover:bg-teal-600"
                    >
                      Log
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Dinner */}
        <div>
          <h3 className="text-lg font-medium mb-2">Dinner</h3>
          {mealPlan.dinner.length === 0 ? (
            <p className="text-gray-500">No dinner items planned.</p>
          ) : (
            <ul className="space-y-2">
              {mealPlan.dinner.map((item, index) => (
                <li key={index} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                  <span>
                    {item.name} - {item.quantity}
                    {item.isFluid ? 'ml' : 'g'} (Planned)
                  </span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      value={loggedQuantities[`dinner-${index}`] || ''}
                      onChange={(e) => handleQuantityChange('dinner', index, e.target.value)}
                      placeholder="Consumed"
                      className="w-20 p-1 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <span>{item.isFluid ? 'ml' : 'g'}</span>
                    <button
                      onClick={() => handleLog('dinner', item, index)}
                      className="bg-teal-500 text-white px-3 py-1 rounded hover:bg-teal-600"
                    >
                      Log
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealPlan;