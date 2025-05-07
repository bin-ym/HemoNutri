import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, AlertCircle, Clock, Target, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import MealPlan from '../../components/MealPlan';

const MealPlanPage = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [tempConsumed, setTempConsumed] = useState(null); // Temporary state for consumption status
  const [warnings, setWarnings] = useState([]); // For hemodialysis limit warnings

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (!token || role !== 'patient') {
          navigate('/login');
          return;
        }

        const logsRes = await api.get('/patient/food-logs');
        const logsData = Array.isArray(logsRes.data) ? logsRes.data : [];
        setLogs(logsData);

        const mealPlanRes = await api.get('/patient/meal-plan');
        setMealPlan(mealPlanRes.data);
        setError('');

        // Check for hemodialysis limit exceedances
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaysLogs = logsData.filter((log) => {
          const logDate = new Date(log.date);
          logDate.setHours(0, 0, 0, 0);
          return logDate.getTime() === today.getTime();
        });

        const totals = todaysLogs.reduce(
          (acc, log) => ({
            potassium: acc.potassium + Number(log.potassium),
            phosphorus: acc.phosphorus + Number(log.phosphorus),
            sodium: acc.sodium + Number(log.sodium),
            fluid: acc.fluid + (log.isFluid ? Number(log.quantity) : 0),
          }),
          { potassium: 0, phosphorus: 0, sodium: 0, fluid: 0 }
        );

        const limits = mealPlanRes.data.hemodialysisLimits;
        const newWarnings = [];
        if (totals.potassium > limits.potassium) {
          newWarnings.push(`Potassium intake (${totals.potassium}mg) exceeds limit (${limits.potassium}mg)`);
        }
        if (totals.phosphorus > limits.phosphorus) {
          newWarnings.push(`Phosphorus intake (${totals.phosphorus}mg) exceeds limit (${limits.phosphorus}mg)`);
        }
        if (totals.sodium > limits.sodium) {
          newWarnings.push(`Sodium intake (${totals.sodium}mg) exceeds limit (${limits.sodium}mg)`);
        }
        if (totals.fluid > limits.fluid) {
          newWarnings.push(`Fluid intake (${totals.fluid}ml) exceeds limit (${limits.fluid}ml)`);
        }
        setWarnings(newWarnings);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleLog = (newLog) => {
    setLogs((prev) => {
      const updatedLogs = [newLog, ...prev];
      
      // Recalculate warnings after adding a new log
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaysLogs = updatedLogs.filter((log) => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === today.getTime();
      });

      const totals = todaysLogs.reduce(
        (acc, log) => ({
          potassium: acc.potassium + Number(log.potassium),
          phosphorus: acc.phosphorus + Number(log.phosphorus),
          sodium: acc.sodium + Number(log.sodium),
          fluid: acc.fluid + (log.isFluid ? Number(log.quantity) : 0),
        }),
        { potassium: 0, phosphorus: 0, sodium: 0, fluid: 0 }
      );

      const limits = mealPlan.hemodialysisLimits;
      const newWarnings = [];
      if (totals.potassium > limits.potassium) {
        newWarnings.push(`Potassium intake (${totals.potassium}mg) exceeds limit (${limits.potassium}mg)`);
      }
      if (totals.phosphorus > limits.phosphorus) {
        newWarnings.push(`Phosphorus intake (${totals.phosphorus}mg) exceeds limit (${limits.phosphorus}mg)`);
      }
      if (totals.sodium > limits.sodium) {
        newWarnings.push(`Sodium intake (${totals.sodium}mg) exceeds limit (${limits.sodium}mg)`);
      }
      if (totals.fluid > limits.fluid) {
        newWarnings.push(`Fluid intake (${totals.fluid}ml) exceeds limit (${limits.fluid}ml)`);
      }
      setWarnings(newWarnings);

      return updatedLogs;
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString();
  };

  const openModal = (mealType) => {
    setSelectedMeal(mealType);
    setTempConsumed(mealPlan.consumed[mealType]); // Initialize with current status
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedMeal(null);
    setTempConsumed(null);
  };

  const handleMealConsumption = async () => {
    try {
      const res = await api.put('/patient/meal-plan/consume', { mealType: selectedMeal, consumed: tempConsumed });
      setMealPlan(res.data);
      closeModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update meal consumption');
    }
  };

  // Calculate total consumed nutrients from food logs
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysLogs = logs.filter((log) => {
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);
    return logDate.getTime() === today.getTime();
  });

  const totalConsumed = todaysLogs.reduce(
    (acc, log) => ({
      carbohydrates: acc.carbohydrates + Number(log.carbohydrates),
      proteins: acc.proteins + Number(log.proteins),
      lipids: acc.lipids + Number(log.lipids),
      fluid: acc.fluid + (log.isFluid ? Number(log.quantity) : 0),
    }),
    { carbohydrates: 0, proteins: 0, lipids: 0, fluid: 0 }
  );

  const totalTargets = mealPlan
    ? {
        carbohydrates:
          Number(mealPlan.breakfast?.carbohydrates || 0) +
          Number(mealPlan.lunch?.carbohydrates || 0) +
          Number(mealPlan.dinner?.carbohydrates || 0),
        proteins:
          Number(mealPlan.breakfast?.proteins || 0) +
          Number(mealPlan.lunch?.proteins || 0) +
          Number(mealPlan.dinner?.proteins || 0),
        lipids:
          Number(mealPlan.breakfast?.lipids || 0) +
          Number(mealPlan.lunch?.lipids || 0) +
          Number(mealPlan.dinner?.lipids || 0),
        fluid: Number(mealPlan.hemodialysisLimits?.fluid || 0),
      }
    : { carbohydrates: 0, proteins: 0, lipids: 0, fluid: 0 };

  // Group recommended foods by nutrient type based on dominant nutrient
  const groupRecommendedFoods = (foods) => {
    const grouped = { carbohydrates: [], proteins: [], lipids: [] };
    foods.forEach((food) => {
      const nutrients = [
        { type: 'carbohydrates', value: Number(food.carbohydrates) },
        { type: 'proteins', value: Number(food.proteins) },
        { type: 'lipids', value: Number(food.lipids) },
      ];
      const dominant = nutrients.reduce((max, nutrient) => (nutrient.value > max.value ? nutrient : max), nutrients[0]);
      grouped[dominant.type].push(food);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-teal-50 to-gray-100">
        <Navbar role="patient" />
        <div className="flex items-center justify-center flex-grow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 border-4 border-teal-600 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-lg text-teal-700 animate-pulse">Loading meal plan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !mealPlan) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-teal-50 to-gray-100">
        <Navbar role="patient" />
        <div className="flex-grow max-w-6xl p-6 mx-auto">
          <div className="relative mb-12 text-center">
            <h1 className="relative text-4xl font-extrabold text-teal-700 md:text-5xl animate-fade-in">
              Your Daily Meal Plan
            </h1>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-lg text-center">
            <p className="text-red-500">{error || 'No meal plan data available.'}</p>
            <p className="text-gray-600 mt-2">Please contact your provider for assistance.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-teal-50 to-gray-100">
      <Navbar role="patient" />
      <div className="flex-grow max-w-6xl p-6 mx-auto">
        <div className="relative mb-12 text-center">
          <div className="absolute inset-0 h-32 bg-teal-600 rounded-b-full -top-8 opacity-10 blur-2xl"></div>
          <h1 className="relative text-4xl font-extrabold text-teal-700 md:text-5xl animate-fade-in">
            Your Daily Meal Plan
          </h1>
          <p className="relative max-w-2xl mx-auto mt-3 text-lg text-gray-600">
            Follow your daily nutrient targets and log your intake.
          </p>
          <Utensils className="relative w-12 h-12 mx-auto mt-4 text-teal-500 animate-bounce-slow" />
        </div>
        {warnings.length > 0 && (
          <div className="mb-8 p-4 bg-red-50 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-red-700 flex items-center">
              <AlertCircle className="w-6 h-6 mr-2" />
              Warnings
            </h3>
            <ul className="mt-2 text-red-600 list-disc list-inside">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
        <section className="mb-12">
          <div className="p-6 bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl shadow-lg">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-teal-200">
              <h2 className="text-3xl font-bold text-teal-800 animate-fade-in">Your Daily Targets</h2>
              <Target className="text-teal-600 w-8 h-8 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div
                className="bg-white p-5 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                onClick={() => openModal('breakfast')}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-teal-700">Breakfast</h3>
                  {mealPlan.consumed.breakfast ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>
                <div className="text-gray-700 space-y-1">
                  <p><span className="font-medium">Carbs:</span> {mealPlan.breakfast.carbohydrates}g</p>
                  <p><span className="font-medium">Proteins:</span> {mealPlan.breakfast.proteins}g</p>
                  <p><span className="font-medium">Lipids:</span> {mealPlan.breakfast.lipids}g</p>
                </div>
              </div>
              <div
                className="bg-white p-5 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                onClick={() => openModal('lunch')}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-teal-700">Lunch</h3>
                  {mealPlan.consumed.lunch ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>
                <div className="text-gray-700 space-y-1">
                  <p><span className="font-medium">Carbs:</span> {mealPlan.lunch.carbohydrates}g</p>
                  <p><span className="font-medium">Proteins:</span> {mealPlan.lunch.proteins}g</p>
                  <p><span className="font-medium">Lipids:</span> {mealPlan.lunch.lipids}g</p>
                </div>
              </div>
              <div
                className="bg-white p-5 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                onClick={() => openModal('dinner')}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-teal-700">Dinner</h3>
                  {mealPlan.consumed.dinner ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>
                <div className="text-gray-700 space-y-1">
                  <p><span className="font-medium">Carbs:</span> {mealPlan.dinner.carbohydrates}g</p>
                  <p><span className="font-medium">Proteins:</span> {mealPlan.dinner.proteins}g</p>
                  <p><span className="font-medium">Lipids:</span> {mealPlan.dinner.lipids}g</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-md mb-8">
              <h3 className="text-xl font-semibold text-teal-700 mb-3">Hemodialysis Limits</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                <p><span className="font-medium">Potassium:</span> {mealPlan.hemodialysisLimits.potassium}mg</p>
                <p><span className="font-medium">Phosphorus:</span> {mealPlan.hemodialysisLimits.phosphorus}mg</p>
                <p><span className="font-medium">Sodium:</span> {mealPlan.hemodialysisLimits.sodium}mg</p>
                <p><span className="font-medium">Fluid:</span> {mealPlan.hemodialysisLimits.fluid}ml</p>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-teal-700 mb-4">Your Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-700 font-medium mb-1">
                  Carbohydrates: {totalConsumed.carbohydrates.toFixed(1)}g / {totalTargets.carbohydrates}g
                </p>
                <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-teal-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((totalConsumed.carbohydrates / (totalTargets.carbohydrates || 1)) * 100, 100)}%`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                    {Math.round((totalConsumed.carbohydrates / (totalTargets.carbohydrates || 1)) * 100)}%
                  </div>
                </div>
              </div>
              <div>
                <p className="text-gray-700 font-medium mb-1">
                  Proteins: {totalConsumed.proteins.toFixed(1)}g / {totalTargets.proteins}g
                </p>
                <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-teal-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((totalConsumed.proteins / (totalTargets.proteins || 1)) * 100, 100)}%`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                    {Math.round((totalConsumed.proteins / (totalTargets.proteins || 1)) * 100)}%
                  </div>
                </div>
              </div>
              <div>
                <p className="text-gray-700 font-medium mb-1">
                  Lipids: {totalConsumed.lipids.toFixed(1)}g / {totalTargets.lipids}g
                </p>
                <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-teal-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((totalConsumed.lipids / (totalTargets.lipids || 1)) * 100, 100)}%`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                    {Math.round((totalConsumed.lipids / (totalTargets.lipids || 1)) * 100)}%
                  </div>
                </div>
              </div>
              <div>
                <p className="text-gray-700 font-medium mb-1">
                  Fluid Intake: {totalConsumed.fluid.toFixed(1)}ml / {totalTargets.fluid}ml
                </p>
                <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-teal-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((totalConsumed.fluid / (totalTargets.fluid || 1)) * 100, 100)}%`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                    {Math.round((totalConsumed.fluid / (totalTargets.fluid || 1)) * 100)}%
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              Note: Nutrient tracking is based on your logged food intake. Please consult your provider for precise dietary advice.
            </p>
          </div>
        </section>
        {/* Modal for Meal Details */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-xl">
              <h3 className="text-2xl font-bold text-teal-700 mb-4">{selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)} Details</h3>
              <div className="space-y-4">
                {['carbohydrates', 'proteins', 'lipids'].map((nutrientType) => {
                  const recommendedFoods = mealPlan.recommendedFoods[selectedMeal] || [];
                  const groupedFoods = groupRecommendedFoods(recommendedFoods);
                  const foodsForNutrient = groupedFoods[nutrientType];

                  return (
                    <div key={nutrientType}>
                      <h4 className="text-lg font-semibold text-gray-800 capitalize">
                        {nutrientType} ({mealPlan[selectedMeal][nutrientType]}g)
                      </h4>
                      <div className="mt-2">
                        {foodsForNutrient.length > 0 ? (
                          <>
                            <p className="text-gray-700 font-medium flex items-center">
                              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                              Recommended:
                            </p>
                            <ul className="list-disc list-inside text-gray-600">
                              {foodsForNutrient.map((food, index) => (
                                <li key={index}>
                                  {food.name} - {food.quantity}g (
                                  Carbs: {food.carbohydrates}g, Proteins: {food.proteins}g, Lipids: {food.lipids}g)
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <p className="text-gray-600 italic">No {nutrientType} recommendations provided.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div className="mt-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Did you consume this meal?</h4>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setTempConsumed(true)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                        tempConsumed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <CheckCircle className={`w-5 h-5 ${tempConsumed ? 'text-green-500' : 'text-gray-500'}`} />
                      <span>Yes</span>
                    </button>
                    <button
                      onClick={() => setTempConsumed(false)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                        tempConsumed === false ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <XCircle className={`w-5 h-5 ${tempConsumed === false ? 'text-red-500' : 'text-gray-500'}`} />
                      <span>No</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMealConsumption}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="mb-12">
          <MealPlan onLog={handleLog} />
        </div>
        <section>
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-teal-100">
              <h2 className="text-2xl font-bold tracking-tight text-teal-700 animate-fade-in">Your Food Logs</h2>
              <Utensils className="text-teal-500 w-7 h-7 animate-pulse" />
            </div>
            {logs.length === 0 ? (
              <p className="flex items-center justify-center text-lg text-center text-gray-600">
                <Utensils className="w-6 h-6 mr-2" /> No logs available
              </p>
            ) : (
              <ul className="space-y-6">
                {logs.map((log) => (
                  <li
                    key={log._id}
                    className="p-4 transition-all duration-300 border border-teal-200 rounded-lg shadow-md bg-teal-50 hover:bg-teal-100"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">
                        {log.foodItem} - {log.quantity} {log.isFluid ? 'ml' : 'g'} (
                        Carbs: {log.carbohydrates}g, Proteins: {log.proteins}g, Lipids: {log.lipids}g,
                        K: {log.potassium}mg, P: {log.phosphorus}mg, Na: {log.sodium}mg)
                      </span>
                      <span className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDate(log.date)}
                      </span>
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

export default MealPlanPage;