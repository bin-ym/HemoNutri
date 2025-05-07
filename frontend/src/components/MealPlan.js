import { useState, useEffect } from 'react';
import api from '../services/api';

const MealPlan = ({ onLog }) => {
  const [foodItem, setFoodItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isFluid, setIsFluid] = useState(false);
  const [recommendedFoods, setRecommendedFoods] = useState([]);

  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        const res = await api.get('/patient/meal-plan');
        // Combine recommended foods from all meals
        const allRecommended = [
          ...(res.data.recommendedFoods.breakfast || []),
          ...(res.data.recommendedFoods.lunch || []),
          ...(res.data.recommendedFoods.dinner || []),
        ];
        setRecommendedFoods(allRecommended);
      } catch (err) {
        console.error('Failed to fetch meal plan:', err);
      }
    };
    fetchMealPlan();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const numericQuantity = parseFloat(quantity);
      if (!foodItem || numericQuantity <= 0) {
        alert('Please enter a valid food item and quantity');
        return;
      }

      const res = await api.post('/patient/food-logs', {
        foodItem,
        quantity: numericQuantity,
        isFluid,
      });
      onLog(res.data);
      setFoodItem('');
      setQuantity('');
      setIsFluid(false);
    } catch (err) {
      console.error('Food log error:', err.response?.data || err.message);
      alert('Failed to log food');
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-teal-700 mb-4">Log Your Food</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Food Item</label>
          <select
            value={foodItem}
            onChange={(e) => setFoodItem(e.target.value)}
            className="w-full p-3 border border-teal-200 rounded-lg bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Select a food item...</option>
            {recommendedFoods.map((food, index) => (
              <option key={index} value={food.name}>
                {food.name} (Carbs: {food.carbohydrates}g, Proteins: {food.proteins}g, Lipids: {food.lipids}g per {food.quantity}g)
              </option>
            ))}
            <option value="custom">Custom Food Item</option>
          </select>
          {foodItem === 'custom' && (
            <input
              type="text"
              value={foodItem === 'custom' ? '' : foodItem}
              onChange={(e) => setFoodItem(e.target.value)}
              placeholder="Enter custom food item"
              className="mt-2 w-full p-3 border border-teal-200 rounded-lg bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          )}
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Quantity ({isFluid ? 'ml' : 'g'})</label>
          <input
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={`e.g., ${isFluid ? '200' : '100'}`}
            className="w-full p-3 border border-teal-200 rounded-lg bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isFluid}
            onChange={(e) => setIsFluid(e.target.checked)}
            className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
          />
          <label className="ml-2 text-sm text-gray-700">Is this a fluid?</label>
        </div>
        <button
          type="submit"
          className="w-full p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Log Food
        </button>
      </form>
    </div>
  );
};

export default MealPlan;