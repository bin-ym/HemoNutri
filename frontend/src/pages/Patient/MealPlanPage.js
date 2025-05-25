import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Utensils, AlertCircle, Clock, Target, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import MealPlan from '../../components/MealPlan';

const MealPlanPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [tempConsumed, setTempConsumed] = useState(null);
  const [warnings, setWarnings] = useState([]);

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
          newWarnings.push(t('potassium_exceed', { intake: totals.potassium, limit: limits.potassium }));
        }
        if (totals.phosphorus > limits.phosphorus) {
          newWarnings.push(t('phosphorus_exceed', { intake: totals.phosphorus, limit: limits.phosphorus }));
        }
        if (totals.sodium > limits.sodium) {
          newWarnings.push(t('sodium_exceed', { intake: totals.sodium, limit: limits.sodium }));
        }
        if (totals.fluid > limits.fluid) {
          newWarnings.push(t('fluid_exceed', { intake: totals.fluid, limit: limits.fluid }));
        }
        setWarnings(newWarnings);
      } catch (err) {
        setError(err.response?.data?.error || t('failed_load_data'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, t]);

  const handleLog = (newLog) => {
    setLogs((prev) => {
      const updatedLogs = [newLog, ...prev];
      
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
        newWarnings.push(t('potassium_exceed', { intake: totals.potassium, limit: limits.potassium }));
      }
      if (totals.phosphorus > limits.phosphorus) {
        newWarnings.push(t('phosphorus_exceed', { intake: totals.phosphorus, limit: limits.phosphorus }));
      }
      if (totals.sodium > limits.sodium) {
        newWarnings.push(t('sodium_exceed', { intake: totals.sodium, limit: limits.sodium }));
      }
      if (totals.fluid > limits.fluid) {
        newWarnings.push(t('fluid_exceed', { intake: totals.fluid, limit: limits.fluid }));
      }
      setWarnings(newWarnings);

      return updatedLogs;
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? t('date_unavailable') : date.toLocaleString();
  };

  const openModal = (mealType) => {
    setSelectedMeal(mealType);
    setTempConsumed(mealPlan.consumed[mealType]);
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
      setError(err.response?.data?.error || t('failed_update_meal'));
    }
  };

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
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
        <Navbar role="patient" />
        <div className="flex items-center justify-center flex-grow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 border-4 border-blue-700 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-lg text-blue-700 animate-pulse">{t('loading_meal_plan')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !mealPlan) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
        <Navbar role="patient" />
        <div className="flex-grow max-w-6xl p-6 mx-auto">
          <div className="relative mb-12 text-center">
            <h1 className="relative text-4xl font-extrabold text-blue-700 md:text-5xl animate-fade-in">
              {t('meal_plan_title')}
            </h1>
          </div>
          <div className="p-6 text-center bg-white shadow-lg rounded-xl">
            <p className="text-red-500">{error || t('no_meal_plan')}</p>
            <p className="mt-2 text-gray-600">{t('contact_provider')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
      <Navbar role="patient" />
      <div className="flex-grow max-w-6xl p-6 mx-auto">
        <div className="relative mb-12 text-center">
          <div className="absolute inset-0 h-32 bg-blue-700 rounded-b-full -top-8 opacity-10 blur-2xl"></div>
          <h1 className="relative text-4xl font-extrabold text-blue-700 md:text-5xl animate-fade-in">
            {t('meal_plan_title')}
          </h1>
          <p className="relative max-w-2xl mx-auto mt-3 text-lg text-gray-600">
            {t('meal_plan_subtitle')}
          </p>
          <Utensils className="relative w-12 h-12 mx-auto mt-4 text-blue-500 animate-bounce-slow" />
        </div>
        {warnings.length > 0 && (
          <div className="p-4 mb-8 rounded-lg shadow-md bg-red-50">
            <h3 className="flex items-center text-lg font-semibold text-red-700">
              <AlertCircle className="w-6 h-6 mr-2" />
              {t('warnings')}
            </h3>
            <ul className="mt-2 text-red-600 list-disc list-inside">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
        <section className="mb-12">
          <div className="p-6 shadow-lg bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-blue-200">
              <h2 className="text-3xl font-bold text-blue-800 animate-fade-in">{t('daily_targets')}</h2>
              <Target className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
              <div
                className="p-5 transition-all duration-300 transform bg-white rounded-lg shadow-md cursor-pointer hover:shadow-xl hover:-translate-y-1"
                onClick={() => openModal('breakfast')}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-blue-700">{t('breakfast')}</h3>
                  {mealPlan.consumed.breakfast ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>
                <div className="space-y-1 text-gray-700">
                  <p><span className="font-medium">{t('carbs')}:</span> {mealPlan.breakfast.carbohydrates}g</p>
                  <p><span className="font-medium">{t('proteins')}:</span> {mealPlan.breakfast.proteins}g</p>
                  <p><span className="font-medium">{t('lipids')}:</span> {mealPlan.breakfast.lipids}g</p>
                </div>
              </div>
              <div
                className="p-5 transition-all duration-300 transform bg-white rounded-lg shadow-md cursor-pointer hover:shadow-xl hover:-translate-y-1"
                onClick={() => openModal('lunch')}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-blue-700">{t('lunch')}</h3>
                  {mealPlan.consumed.lunch ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>
                <div className="space-y-1 text-gray-700">
                  <p><span className="font-medium">{t('carbs')}:</span> {mealPlan.lunch.carbohydrates}g</p>
                  <p><span className="font-medium">{t('proteins')}:</span> {mealPlan.lunch.proteins}g</p>
                  <p><span className="font-medium">{t('lipids')}:</span> {mealPlan.lunch.lipids}g</p>
                </div>
              </div>
              <div
                className="p-5 transition-all duration-300 transform bg-white rounded-lg shadow-md cursor-pointer hover:shadow-xl hover:-translate-y-1"
                onClick={() => openModal('dinner')}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-blue-700">{t('dinner')}</h3>
                  {mealPlan.consumed.dinner ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>
                <div className="space-y-1 text-gray-700">
                  <p><span className="font-medium">{t('carbs')}:</span> {mealPlan.dinner.carbohydrates}g</p>
                  <p><span className="font-medium">{t('proteins')}:</span> {mealPlan.dinner.proteins}g</p>
                  <p><span className="font-medium">{t('lipids')}:</span> {mealPlan.dinner.lipids}g</p>
                </div>
              </div>
            </div>
            <div className="p-5 mb-8 bg-white rounded-lg shadow-md">
              <h3 className="mb-3 text-xl font-semibold text-blue-700">{t('hemodialysis_limits')}</h3>
              <div className="grid grid-cols-1 gap-4 text-gray-700 sm:grid-cols-2">
                <p><span className="font-medium">{t('potassium')}:</span> {mealPlan.hemodialysisLimits.potassium}mg</p>
                <p><span className="font-medium">{t('phosphorus')}:</span> {mealPlan.hemodialysisLimits.phosphorus}mg</p>
                <p><span className="font-medium">{t('sodium')}:</span> {mealPlan.hemodialysisLimits.sodium}mg</p>
                <p><span className="font-medium">{t('fluid')}:</span> {mealPlan.hemodialysisLimits.fluid}ml</p>
              </div>
            </div>
            <h3 className="mb-4 text-xl font-semibold text-blue-700">{t('your_progress')}</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <p className="mb-1 font-medium text-gray-700">
                  {t('carbohydrates')}: {totalConsumed.carbohydrates.toFixed(1)}g / {totalTargets.carbohydrates}g
                </p>
                <div className="relative w-full h-6 overflow-hidden bg-gray-200 rounded-full">
                  <div
                    className="absolute top-0 left-0 h-full transition-all duration-500 bg-blue-500 rounded-full"
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
                <p className="mb-1 font-medium text-gray-700">
                  {t('proteins')}: {totalConsumed.proteins.toFixed(1)}g / {totalTargets.proteins}g
                </p>
                <div className="relative w-full h-6 overflow-hidden bg-gray-200 rounded-full">
                  <div
                    className="absolute top-0 left-0 h-full transition-all duration-500 bg-blue-500 rounded-full"
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
                <p className="mb-1 font-medium text-gray-700">
                  {t('lipids')}: {totalConsumed.lipids.toFixed(1)}g / {totalTargets.lipids}g
                </p>
                <div className="relative w-full h-6 overflow-hidden bg-gray-200 rounded-full">
                  <div
                    className="absolute top-0 left-0 h-full transition-all duration-500 bg-blue-500 rounded-full"
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
                <p className="mb-1 font-medium text-gray-700">
                  {t('fluid_intake')}: {totalConsumed.fluid.toFixed(1)}ml / {totalTargets.fluid}ml
                </p>
                <div className="relative w-full h-6 overflow-hidden bg-gray-200 rounded-full">
                  <div
                    className="absolute top-0 left-0 h-full transition-all duration-500 bg-blue-500 rounded-full"
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
              {t('nutrient_tracking_note')}
            </p>
          </div>
        </section>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
              <h3 className="mb-4 text-2xl font-bold text-blue-700">{t(`${selectedMeal}_details`)}</h3>
              <div className="space-y-4">
                {['carbohydrates', 'proteins', 'lipids'].map((nutrientType) => {
                  const recommendedFoods = mealPlan.recommendedFoods[selectedMeal] || [];
                  const groupedFoods = groupRecommendedFoods(recommendedFoods);
                  const foodsForNutrient = groupedFoods[nutrientType];

                  return (
                    <div key={nutrientType}>
                      <h4 className="text-lg font-semibold text-gray-800 capitalize">
                        {t(nutrientType)} ({mealPlan[selectedMeal][nutrientType]}g)
                      </h4>
                      <div className="mt-2">
                        {foodsForNutrient.length > 0 ? (
                          <>
                            <p className="flex items-center font-medium text-gray-700">
                              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                              {t('recommended')}
                            </p>
                            <ul className="text-gray-600 list-disc list-inside">
                              {foodsForNutrient.map((food, index) => (
                                <li key={index}>
                                  {food.name} - {food.quantity}g (
                                  {t('carbs')}: {food.carbohydrates}g, {t('proteins')}: {food.proteins}g, {t('lipids')}: {food.lipids}g)
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <p className="italic text-gray-600">{t('no_recommendations', { nutrient: t(nutrientType) })}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div className="mt-4">
                  <h4 className="mb-2 text-lg font-semibold text-gray-800">{t('consume_meal_question')}</h4>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setTempConsumed(true)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                        tempConsumed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <CheckCircle className={`w-5 h-5 ${tempConsumed ? 'text-green-500' : 'text-gray-500'}`} />
                      <span>{t('yes')}</span>
                    </button>
                    <button
                      onClick={() => setTempConsumed(false)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                        tempConsumed === false ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <XCircle className={`w-5 h-5 ${tempConsumed === false ? 'text-red-500' : 'text-gray-500'}`} />
                      <span>{t('no')}</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleMealConsumption}
                  className="px-4 py-2 text-white transition-colors bg-blue-700 rounded-lg hover:bg-blue-900"
                >
                  {t('submit')}
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="mb-12">
          <MealPlan onLog={handleLog} />
        </div>
        <section>
          <div className="p-6 bg-white shadow-lg rounded-xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-blue-100">
              <h2 className="text-2xl font-bold tracking-tight text-blue-700 animate-fade-in">{t('your_food_logs')}</h2>
              <Utensils className="text-blue-500 w-7 h-7 animate-pulse" />
            </div>
            {logs.length === 0 ? (
              <p className="flex items-center justify-center text-lg text-center text-gray-600">
                <Utensils className="w-6 h-6 mr-2" /> {t('no_logs_available')}
              </p>
            ) : (
              <ul className="space-y-6">
                {logs.map((log) => (
                  <li
                    key={log._id}
                    className="p-4 transition-all duration-300 border border-blue-200 rounded-lg shadow-md bg-blue-50 hover:bg-blue-100"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">
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
      </div>
    </div>
  );
};

export default MealPlanPage;