import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Utensils, Scale, Clipboard, AlertCircle, Clock } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';

const ProviderPatientDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [foodLogs, setFoodLogs] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [mealPlanForm, setMealPlanForm] = useState({
    breakfast: { carbohydrates: '', proteins: '', lipids: '' },
    lunch: { carbohydrates: '', proteins: '', lipids: '' },
    dinner: { carbohydrates: '', proteins: '', lipids: '' },
    hemodialysisLimits: { potassium: '', phosphorus: '', sodium: '', fluid: '' },
    recommendedFoods: {
      breakfast: [],
      lunch: [],
      dinner: [],
    },
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const foodOptions = {
    carbohydrates: [
      { name: 'White Rice', carbohydrates: 28, proteins: 2.7, lipids: 0.3 },
      { name: 'Bread (White)', carbohydrates: 49, proteins: 9, lipids: 3.6 },
      { name: 'Pasta (Cooked)', carbohydrates: 25, proteins: 5, lipids: 1.1 },
      { name: 'Apple', carbohydrates: 14, proteins: 0.3, lipids: 0.2 },
    ],
    proteins: [
      { name: 'Chicken Breast (Skinless)', carbohydrates: 0, proteins: 31, lipids: 3.6 },
      { name: 'Egg Whites', carbohydrates: 0.7, proteins: 11, lipids: 0.2 },
      { name: 'Fish (Cod)', carbohydrates: 0, proteins: 18, lipids: 0.7 },
      { name: 'Tofu', carbohydrates: 1.9, proteins: 8, lipids: 4.8 },
    ],
    lipids: [
      { name: 'Olive Oil', carbohydrates: 0, proteins: 0, lipids: 100 },
      { name: 'Avocado', carbohydrates: 9, proteins: 2, lipids: 15 },
      { name: 'Almonds', carbohydrates: 22, proteins: 21, lipids: 50 },
      { name: 'Butter (Unsalted)', carbohydrates: 0.1, proteins: 0.9, lipids: 81 },
    ],
  };

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (!token || role !== 'provider') {
          navigate('/login', { state: { message: t('login_provider') } });
          return;
        }
        console.log('Fetching data for patient ID:', id);
        const [patientRes, logsRes, assessRes] = await Promise.all([
          api.get(`/provider/patient/${id}`),
          api.get(`/provider/patient/${id}/food-logs`),
          api.get(`/provider/patient/${id}/assessment`),
        ]);
        setPatient(patientRes.data);
        setFoodLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
        setAssessment(assessRes.data || { weight: t('not_available'), height: t('not_available'), dietHabits: t('not_available') });
        setError('');
      } catch (err) {
        console.error('Fetch error:', err.response?.data || err.message);
        setError(err.response?.data?.error || t('patient_detail_error_load'));
        if (err.response?.data?.error.includes('Token expired') || err.response?.data?.error.includes('Token verification error')) {
          localStorage.clear();
          navigate('/login', { state: { message: t('session_expired') } });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, [navigate, id, t]);

  const handleMealPlanChange = (mealType, nutrient, value) => {
    setMealPlanForm((prev) => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        [nutrient]: value,
      },
    }));
  };

  const handleHemodialysisLimitsChange = (field, value) => {
    setMealPlanForm((prev) => ({
      ...prev,
      hemodialysisLimits: {
        ...prev.hemodialysisLimits,
        [field]: value,
      },
    }));
  };

  const handleFoodSelection = (mealType, nutrientType, food, quantity) => {
    const newFood = {
      name: food.name,
      quantity: parseFloat(quantity) || 100,
      isFluid: false,
      carbohydrates: (food.carbohydrates * (parseFloat(quantity) || 100) / 100).toFixed(1),
      proteins: (food.proteins * (parseFloat(quantity) || 100) / 100).toFixed(1),
      lipids: (food.lipids * (parseFloat(quantity) || 100) / 100).toFixed(1),
    };
    setMealPlanForm((prev) => ({
      ...prev,
      recommendedFoods: {
        ...prev.recommendedFoods,
        [mealType]: [...prev.recommendedFoods[mealType], newFood],
      },
    }));
  };

  const handleMealPlanSubmit = async (e) => {
    e.preventDefault();
    try {
      const { breakfast, lunch, dinner, hemodialysisLimits, recommendedFoods } = mealPlanForm;
      const validateMeal = (meal) => {
        const carbs = parseFloat(meal.carbohydrates);
        const proteins = parseFloat(meal.proteins);
        const lipids = parseFloat(meal.lipids);
        return (
          !isNaN(carbs) && carbs >= 0 &&
          !isNaN(proteins) && proteins >= 0 &&
          !isNaN(lipids) && lipids >= 0
        );
      };
      const validateLimits = (limits) => {
        const potassium = parseFloat(limits.potassium);
        const phosphorus = parseFloat(limits.phosphorus);
        const sodium = parseFloat(limits.sodium);
        const fluid = parseFloat(limits.fluid);
        return (
          !isNaN(potassium) && potassium >= 0 &&
          !isNaN(phosphorus) && phosphorus >= 0 &&
          !isNaN(sodium) && sodium >= 0 &&
          !isNaN(fluid) && fluid >= 0
        );
      };
      if (!validateMeal(breakfast) || !validateMeal(lunch) || !validateMeal(dinner) || !validateLimits(hemodialysisLimits)) {
        setError(t('invalid_nutrient_fields'));
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await api.post(`/provider/meal-plan/${id}`, {
        breakfast: {
          carbohydrates: parseFloat(breakfast.carbohydrates),
          proteins: parseFloat(breakfast.proteins),
          lipids: parseFloat(breakfast.lipids),
        },
        lunch: {
          carbohydrates: parseFloat(lunch.carbohydrates),
          proteins: parseFloat(lunch.proteins),
          lipids: parseFloat(lunch.lipids),
        },
        dinner: {
          carbohydrates: parseFloat(dinner.carbohydrates),
          proteins: parseFloat(dinner.proteins),
          lipids: parseFloat(dinner.lipids),
        },
        hemodialysisLimits: {
          potassium: parseFloat(hemodialysisLimits.potassium),
          phosphorus: parseFloat(hemodialysisLimits.phosphorus),
          sodium: parseFloat(hemodialysisLimits.sodium),
          fluid: parseFloat(hemodialysisLimits.fluid),
        },
        date: today.toISOString(),
        recommendedFoods,
      });
      alert(t('meal_plan_updated'));
      setError('');
    } catch (err) {
      console.error('Meal plan submit error:', err.response?.data || err.message);
      setError(err.response?.data?.error || t('meal_plan_error'));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? t('date_unavailable') : date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100">
        <Navbar role="provider" />
        <div className="flex items-center justify-center flex-grow">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-xl font-semibold text-black animate-pulse">{t('patient_detail_loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !patient) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100">
        <Navbar role="provider" />
        <div className="flex items-center justify-center flex-grow">
          <div className="max-w-md p-6 bg-white shadow-lg rounded-xl animate-slide-down">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <p className="text-lg font-medium text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100">
      <Navbar role="provider" />
      <div className="flex-grow max-w-6xl p-6 mx-auto">
        <div className="relative mb-12 text-center">
          <div className="absolute inset-0 h-40 bg-blue-600 rounded-b-full -top-12 opacity-10 blur-3xl"></div>
          <h1 className="relative text-3xl font-extrabold text-black sm:text-4xl md:text-5xl animate-fade-in">
            {t('patient_detail_title', { username: patient?.username || t('unknown') })}
          </h1>
          <p className="relative max-w-2xl mx-auto mt-3 text-base text-gray-600 sm:text-lg">
            {t('patient_detail_subtitle')}
          </p>
          <Clipboard className="relative w-12 h-12 mx-auto mt-4 text-blue-500 sm:w-14 sm:h-14 animate-bounce-slow" />
        </div>

        {error && (
          <div className="p-4 mb-8 text-center text-red-600 bg-white shadow-lg rounded-xl animate-slide-down">
            <div className="flex items-center justify-center space-x-2">
              <AlertCircle className="w-6 h-6" />
              <p className="text-lg font-medium">{error}</p>
            </div>
          </div>
        )}

        <section className="mb-12">
          <div className="p-6 bg-white shadow-lg rounded-xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-blue-100">
              <h2 className="text-xl font-bold tracking-tight text-black sm:text-2xl animate-fade-in">{t('food_logs')}</h2>
              <Utensils className="w-6 h-6 text-blue-500 sm:w-7 sm:h-7 animate-pulse" />
            </div>
            {foodLogs.length === 0 ? (
              <p className="flex items-center justify-center text-lg text-center text-gray-600">
                <Utensils className="w-6 h-6 mr-2" /> {t('no_logs')}
              </p>
            ) : (
              <ul className="space-y-6">
                {foodLogs.map((log) => (
                  <li
                    key={log._id}
                    className="p-4 transition-all duration-300 border border-blue-200 rounded-lg shadow-md bg-blue-50 hover:bg-blue-100 hover:scale-105"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-black">
                        {log.foodItem} - {log.quantity} {log.isFluid ? 'ml' : 'g'} (
                        {t('carbs')}: {log.carbohydrates}g, {t('proteins')}: {log.proteins}g, {t('lipids')}: {log.lipids}g,
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

        <section className="mb-12">
          <div className="p-6 bg-white shadow-lg rounded-xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-blue-100">
              <h2 className="text-xl font-bold tracking-tight text-black sm:text-2xl animate-fade-in">{t('nutritional_assessment')}</h2>
              <Scale className="w-6 h-6 text-blue-500 sm:w-7 sm:h-7 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 gap-4 text-black sm:grid-cols-3">
              <p><span className="font-medium">{t('weight')}:</span> {assessment?.weight || t('not_available')} kg</p>
              <p><span className="font-medium">{t('height')}:</span> {assessment?.height || t('not_available')} cm</p>
              <p><span className="font-medium">{t('diet_habits')}:</span> {assessment?.dietHabits || t('not_available')}</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="p-6 bg-white shadow-lg rounded-xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-blue-100">
              <h2 className="text-xl font-bold tracking-tight text-black sm:text-2xl animate-fade-in">{t('set_meal_plan')}</h2>
              <Utensils className="w-6 h-6 text-blue-500 sm:w-7 sm:h-7 animate-pulse" />
            </div>
            <form onSubmit={handleMealPlanSubmit} className="space-y-6">
              {['breakfast', 'lunch', 'dinner'].map((mealType) => (
                <div key={mealType}>
                  <h3 className="mb-3 text-lg font-medium text-black capitalize">{t(mealType)}</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">{t('carbohydrates')} (g)</label>
                      <input
                        type="number"
                        min="0"
                        value={mealPlanForm[mealType].carbohydrates}
                        onChange={(e) => handleMealPlanChange(mealType, 'carbohydrates', e.target.value)}
                        placeholder={t('carbohydrates_placeholder')}
                        className="w-full p-3 border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">{t('proteins')} (g)</label>
                      <input
                        type="number"
                        min="0"
                        value={mealPlanForm[mealType].proteins}
                        onChange={(e) => handleMealPlanChange(mealType, 'proteins', e.target.value)}
                        placeholder={t('proteins_placeholder')}
                        className="w-full p-3 border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">{t('lipids')} (g)</label>
                      <input
                        type="number"
                        min="0"
                        value={mealPlanForm[mealType].lipids}
                        onChange={(e) => handleMealPlanChange(mealType, 'lipids', e.target.value)}
                        placeholder={t('lipids_placeholder')}
                        className="w-full p-3 border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <label className="block text-sm font-medium text-black">{t('recommended_foods')}</label>
                    {['carbohydrates', 'proteins', 'lipids'].map((nutrientType) => (
                      <div key={nutrientType} className="p-3 rounded-lg bg-blue-50">
                        <h4 className="mb-2 text-sm font-medium text-black capitalize">{t(nutrientType)}</h4>
                        <select
                          onChange={(e) => {
                            const [foodName, quantity] = e.target.value.split('|');
                            const food = foodOptions[nutrientType].find(f => f.name === foodName);
                            if (food) handleFoodSelection(mealType, nutrientType, food, quantity || 100);
                          }}
                          className="w-full p-2 mb-2 bg-white border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">{t('select_food')}</option>
                          {foodOptions[nutrientType].map((food) => (
                            <option key={food.name} value={`${food.name}|100`}>{food.name} (~{food[nutrientType]}g/100g)</option>
                          ))}
                        </select>
                        <ul className="text-sm text-gray-600">
                          {mealPlanForm.recommendedFoods[mealType].map((food, index) => (
                            <li key={index} className="flex items-center justify-between">
                              <span>{food.name} - {food.quantity}g ({food[nutrientType]}g {t(nutrientType)})</span>
                              <button
                                onClick={() => {
                                  setMealPlanForm((prev) => ({
                                    ...prev,
                                    recommendedFoods: {
                                      ...prev.recommendedFoods,
                                      [mealType]: prev.recommendedFoods[mealType].filter((_, i) => i !== index),
                                    },
                                  }));
                                }}
                                className="px-2 py-1 ml-2 text-sm text-white transition duration-300 bg-blue-700 rounded hover:bg-blue-900"
                              >
                                {t('remove')}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div>
                <h3 className="mb-3 text-lg font-medium text-black">{t('hemodialysis_limits')}</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">{t('potassium')} (mg)</label>
                    <input
                      type="number"
                      min="0"
                      value={mealPlanForm.hemodialysisLimits.potassium}
                      onChange={(e) => handleHemodialysisLimitsChange('potassium', e.target.value)}
                      placeholder={t('potassium_placeholder')}
                      className="w-full p-3 border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">{t('phosphorus')} (mg)</label>
                    <input
                      type="number"
                      min="0"
                      value={mealPlanForm.hemodialysisLimits.phosphorus}
                      onChange={(e) => handleHemodialysisLimitsChange('phosphorus', e.target.value)}
                      placeholder={t('phosphorus_placeholder')}
                      className="w-full p-3 border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">{t('sodium')} (mg)</label>
                    <input
                      type="number"
                      min="0"
                      value={mealPlanForm.hemodialysisLimits.sodium}
                      onChange={(e) => handleHemodialysisLimitsChange('sodium', e.target.value)}
                      placeholder={t('sodium_placeholder')}
                      className="w-full p-3 border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">{t('fluid')} (ml)</label>
                    <input
                      type="number"
                      min="0"
                      value={mealPlanForm.hemodialysisLimits.fluid}
                      onChange={(e) => handleHemodialysisLimitsChange('fluid', e.target.value)}
                      placeholder={t('fluid_placeholder')}
                      className="w-full p-3 border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="w-full p-3 font-semibold text-white transition-all duration-300 bg-blue-700 rounded-lg shadow-md hover:bg-blue-900 hover:scale-105"
              >
                {t('save_meal_plan')}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProviderPatientDetailPage;