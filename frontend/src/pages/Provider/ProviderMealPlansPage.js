import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';

const ProviderMealPlansPage = () => {
  const navigate = useNavigate();
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMealPlans = async () => {
      try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (!token || role !== 'provider') {
          navigate('/login');
          return;
        }
        const res = await api.get('/provider/meal-plans');
        setMealPlans(Array.isArray(res.data) ? res.data : []);
        setError('');
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load meal plans');
      } finally {
        setLoading(false);
      }
    };
    fetchMealPlans();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-teal-50 to-gray-100">
        <Navbar role="provider" />
        <div className="flex items-center justify-center flex-grow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 border-4 border-teal-600 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-lg text-teal-700 animate-pulse">Loading meal plans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-teal-50 to-gray-100">
      <Navbar role="provider" />
      <div className="flex-grow max-w-6xl p-6 mx-auto">
        <div className="relative mb-12 text-center">
          <div className="absolute inset-0 h-32 bg-teal-600 rounded-b-full -top-8 opacity-10 blur-2xl"></div>
          <h1 className="relative text-4xl font-extrabold text-teal-700 md:text-5xl animate-fade-in">
            Meal Plans
          </h1>
          <p className="relative max-w-2xl mx-auto mt-3 text-lg text-gray-600">
            Manage meal plans for your patients.
          </p>
          <Utensils className="relative w-12 h-12 mx-auto mt-4 text-teal-500 animate-bounce-slow" />
        </div>
        {error && (
          <div className="p-4 mb-6 text-center text-red-500 rounded-lg shadow-md bg-red-50">
            <div className="flex items-center justify-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        )}
        <section>
          <div className="p-6 transition-all duration-300 transform bg-white shadow-xl rounded-xl hover:shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-teal-100">
              <h2 className="text-2xl font-bold tracking-tight text-teal-700 animate-fade-in">Patient Meal Plans</h2>
              <Utensils className="text-teal-500 w-7 h-7 animate-pulse" />
            </div>
            {mealPlans.length === 0 ? (
              <p className="flex items-center justify-center text-lg text-center text-gray-600">
                <Utensils className="w-6 h-6 mr-2" /> No meal plans available
              </p>
            ) : (
              <ul className="space-y-6">
                {mealPlans.map((plan) => (
                  <li
                    key={plan._id} // Use meal plan's unique _id, not patientId
                    className="p-4 transition-all duration-300 border border-teal-200 rounded-lg shadow-md bg-teal-50 hover:bg-teal-100"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">
                        Patient: {plan.patientId?.username || 'Unknown'}
                      </span>
                      <div>
                        <button
                          onClick={() => navigate(`/provider/patient/${plan.patientId?._id}`)}
                          className="px-3 py-1 text-sm text-white bg-teal-600 rounded-md hover:bg-teal-700"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Breakfast: {plan.breakfast.carbohydrates}g Carbs, {plan.breakfast.proteins}g Proteins, {plan.breakfast.lipids}g Lipids</p>
                      <p>Lunch: {plan.lunch.carbohydrates}g Carbs, {plan.lunch.proteins}g Proteins, {plan.lunch.lipids}g Lipids</p>
                      <p>Dinner: {plan.dinner.carbohydrates}g Carbs, {plan.dinner.proteins}g Proteins, {plan.dinner.lipids}g Lipids</p>
                      <p>Hemodialysis Limits: {plan.hemodialysisLimits.potassium}mg Potassium, {plan.hemodialysisLimits.phosphorus}mg Phosphorus, {plan.hemodialysisLimits.sodium}mg Sodium, {plan.hemodialysisLimits.fluid}ml Fluid</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProviderMealPlansPage;