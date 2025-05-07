import { useState, useEffect } from 'react';
import { Utensils, AlertCircle, PlusCircle } from 'lucide-react';
import api from '../services/api';

const FoodLog = ({ setLogs }) => {
  const [food, setFood] = useState('');
  const [amount, setAmount] = useState('');
  const [fluid, setFluid] = useState('');
  const [error, setError] = useState('');
  const [isFluidMode, setIsFluidMode] = useState(false);
  const [recommendedFoods, setRecommendedFoods] = useState([]);

  useEffect(() => {
    const fetchRecommendedFoods = async () => {
      try {
        const res = await api.get('/patient/meal-plan');
        const allRecommended = [
          ...(res.data.recommendedFoods.breakfast || []),
          ...(res.data.recommendedFoods.lunch || []),
          ...(res.data.recommendedFoods.dinner || []),
        ];
        setRecommendedFoods(allRecommended);
      } catch (err) {
        console.error('Failed to fetch recommended foods:', err);
      }
    };
    fetchRecommendedFoods();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const numericQuantity = parseFloat(isFluidMode ? fluid : amount);
      if (!food.trim() || !numericQuantity || numericQuantity <= 0) {
        throw new Error('Please enter a valid food item and quantity');
      }

      // Find the selected recommended food, if any
      const selectedFood = recommendedFoods.find((item) => item.name === food);
      const logData = {
        foodItem: food.trim(),
        quantity: numericQuantity,
        isFluid: isFluidMode,
        date: new Date().toISOString(),
        ...(selectedFood
          ? {
              carbohydrates: selectedFood.carbohydrates,
              proteins: selectedFood.proteins,
              lipids: selectedFood.lipids,
              potassium: selectedFood.potassium || 0,
              phosphorus: selectedFood.phosphorus || 0,
              sodium: selectedFood.sodium || 0,
            }
          : {
              carbohydrates: 0,
              proteins: 0,
              lipids: 0,
              potassium: 0,
              phosphorus: 0,
              sodium: 0,
            }),
      };

      const res = await api.post('/patient/food-logs', logData);
      setLogs((prev) => [...prev, res.data]);
      setFood('');
      setAmount('');
      setFluid('');
      setError('');
      alert('Log added successfully!');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to add log');
    }
  };

  return (
    <div className="p-6 transition-all duration-300 transform bg-white shadow-xl rounded-xl hover:shadow-2xl">
      <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-teal-100">
        <h2 className="text-2xl font-bold tracking-tight text-teal-700 animate-fade-in">
          Log Your Intake
        </h2>
        <Utensils className="text-teal-500 w-7 h-7 animate-pulse" />
      </div>

      {error && (
        <div className="flex items-center p-3 mb-6 space-x-2 text-red-600 rounded-lg shadow-md bg-red-50 animate-slide-down">
          <AlertCircle className="flex-shrink-0 w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative group">
          <label className="block mb-2 text-sm font-semibold text-gray-700 transition-colors group-hover:text-teal-600">
            Food Item
          </label>
          <select
            value={food}
            onChange={(e) => setFood(e.target.value)}
            className="w-full p-3 pl-10 transition-all duration-200 border border-teal-200 rounded-lg bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            required
          >
            <option value="">Select a food item...</option>
            {recommendedFoods.map((foodItem, index) => (
              <option key={index} value={foodItem.name}>
                {foodItem.name} (Carbs: {foodItem.carbohydrates}g, Proteins: {foodItem.proteins}g, Lipids: {foodItem.lipids}g per {foodItem.quantity}g)
              </option>
            ))}
            <option value="custom">Custom Food Item</option>
          </select>
          {food === 'custom' && (
            <input
              type="text"
              value={food === 'custom' ? '' : food}
              onChange={(e) => setFood(e.target.value)}
              placeholder="Enter custom food item"
              className="mt-2 w-full p-3 pl-10 transition-all duration-200 border border-teal-200 rounded-lg bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
          )}
          <Utensils className="absolute w-5 h-5 text-teal-400 transition-colors left-3 top-10 group-hover:text-teal-600" />
        </div>

        <div className="flex justify-center mb-4">
          <div className="relative inline-flex items-center p-1 bg-teal-100 rounded-full shadow-inner">
            <button
              type="button"
              onClick={() => setIsFluidMode(false)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                !isFluidMode ? 'bg-teal-500 text-white shadow-md' : 'text-teal-700'
              }`}
            >
              Solid (g)
            </button>
            <button
              type="button"
              onClick={() => setIsFluidMode(true)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                isFluidMode ? 'bg-teal-500 text-white shadow-md' : 'text-teal-700'
              }`}
            >
              Fluid (ml)
            </button>
          </div>
        </div>

        <div className="relative group">
          <label className="block mb-2 text-sm font-semibold text-gray-700 transition-colors group-hover:text-teal-600">
            {isFluidMode ? 'Fluid Amount (ml)' : 'Solid Amount (grams)'}
          </label>
          <input
            type="number"
            min="0"
            step="any"
            value={isFluidMode ? fluid : amount}
            onChange={(e) => (isFluidMode ? setFluid(e.target.value) : setAmount(e.target.value))}
            placeholder={isFluidMode ? 'e.g., 200' : 'e.g., 300'}
            className="w-full p-3 pl-10 transition-all duration-200 border border-teal-200 rounded-lg bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            required
          />
          <span className="absolute w-5 h-5 text-teal-400 transition-colors left-3 top-10 group-hover:text-teal-600">
            {isFluidMode ? '💧' : '🍽️'}
          </span>
        </div>

        <button
          type="submit"
          className="flex items-center justify-center w-full p-3 space-x-2 text-white transition-all duration-300 transform bg-teal-600 rounded-lg shadow-md hover:bg-teal-700 hover:scale-105 active:scale-95"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="font-semibold">Add Log</span>
        </button>
      </form>
    </div>
  );
};

export default FoodLog;