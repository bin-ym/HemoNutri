import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Utensils, Scale, MessageSquare, Clipboard, Send, Clock, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';

const ProviderPatientDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [patient, setPatient] = useState(null);
  const [foodLogs, setFoodLogs] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [messages, setMessages] = useState([]);
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
  const [message, setMessage] = useState('');
  const [replyContent, setReplyContent] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const providerId = localStorage.getItem('userId');
  const messagesRef = useRef(null);

  // Sample food items with approximate nutrient content per 100g (adjust as needed)
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
          navigate('/login', { state: { message: 'Please log in as a provider.' } });
          return;
        }
        console.log('Fetching data for patient ID:', id);
        const [patientRes, logsRes, assessRes, messagesRes] = await Promise.all([
          api.get(`/provider/patient/${id}`),
          api.get(`/provider/patient/${id}/food-logs`),
          api.get(`/provider/patient/${id}/assessment`),
          api.get(`/provider/messages/${id}`),
        ]);
        setPatient(patientRes.data);
        setFoodLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
        setAssessment(assessRes.data || { weight: 'N/A', height: 'N/A', dietHabits: 'N/A' });
        setMessages(Array.isArray(messagesRes.data) ? messagesRes.data : []);
        console.log('Fetched patient-specific messages:', messagesRes.data);
        setError('');
      } catch (err) {
        console.error('Fetch error:', err.response?.data || err.message);
        setError(err.response?.data?.error || 'Failed to load patient data');
        if (err.response?.data?.error.includes('Token expired') || err.response?.data?.error.includes('Token verification error')) {
          localStorage.clear();
          navigate('/login', { state: { message: 'Session expired. Please log in again.' } });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, [navigate, id]);

  useEffect(() => {
    if (location.state?.focusSection === 'messages' && messagesRef.current) {
      messagesRef.current.scrollIntoView({ behavior: 'smooth' });
      // Clear the state to prevent re-scrolling on navigation
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.state]);

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
      quantity: parseFloat(quantity) || 100, // Default to 100g if no quantity
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
        setError('Please enter valid non-negative numbers for all nutrient and hemodialysis limit fields');
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
      alert('Meal plan updated successfully!');
      setError('');
    } catch (err) {
      console.error('Meal plan submit error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to update meal plan');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      const res = await api.post(`/provider/message/${id}`, { content: message });
      console.log('Sent message:', res.data);
      setMessages([res.data, ...messages]);
      setMessage('');
      setError('');
      alert('Message sent successfully!');
    } catch (err) {
      console.error('Send error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to send message');
    }
  };

  const handleReply = async (msgId) => {
    const content = replyContent[msgId]?.trim();
    if (!content) return;
    try {
      const res = await api.post(`/provider/message/${id}`, { content });
      console.log('Reply sent:', res.data);
      setMessages([res.data, ...messages]);
      setReplyContent((prev) => ({ ...prev, [msgId]: '' }));
      setError('');
      alert('Reply sent successfully!');
    } catch (err) {
      console.error('Reply error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to send reply');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-teal-50 via-white to-gray-100">
        <Navbar role="provider" />
        <div className="flex items-center justify-center flex-grow">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 border-4 border-teal-600 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-xl font-semibold text-teal-700 animate-pulse">Loading patient details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !patient) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-teal-50 via-white to-gray-100">
        <Navbar role="provider" />
        <div className="flex items-center justify-center flex-grow">
          <div className="max-w-md p-6 shadow-lg bg-red-50 rounded-xl animate-slide-down">
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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-teal-50 via-white to-gray-100">
      <Navbar role="provider" />
      <div className="flex-grow max-w-6xl p-6 mx-auto">
        <div className="relative mb-12 text-center">
          <div className="absolute inset-0 h-40 bg-teal-600 rounded-b-full -top-12 opacity-10 blur-3xl"></div>
          <h1 className="relative text-4xl font-extrabold text-teal-700 md:text-5xl animate-fade-in">
            Patient Details: {patient?.username || 'Unknown'}
          </h1>
          <p className="relative max-w-2xl mx-auto mt-3 text-lg text-gray-600">
            Manage your patient’s nutrition and communication.
          </p>
          <Clipboard className="relative mx-auto mt-4 text-teal-500 w-14 h-14 animate-bounce-slow" />
        </div>

        {error && (
          <div className="p-4 mb-8 text-center text-red-600 rounded-lg shadow-md bg-red-50 animate-slide-down">
            <div className="flex items-center justify-center space-x-2">
              <AlertCircle className="w-6 h-6" />
              <p className="text-lg font-medium">{error}</p>
            </div>
          </div>
        )}

        <section className="mb-12">
          <div className="p-6 transition-all duration-300 transform bg-white shadow-xl rounded-xl hover:shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-teal-100">
              <h2 className="text-2xl font-bold tracking-tight text-teal-700 animate-fade-in">Food Logs</h2>
              <Utensils className="text-teal-500 w-7 h-7 animate-pulse" />
            </div>
            {foodLogs.length === 0 ? (
              <p className="flex items-center justify-center text-lg text-center text-gray-600">
                <Utensils className="w-6 h-6 mr-2" /> No logs available
              </p>
            ) : (
              <ul className="space-y-6">
                {foodLogs.map((log) => (
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

        <section className="mb-12">
          <div className="p-6 transition-all duration-300 transform bg-white shadow-xl rounded-xl hover:shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-teal-100">
              <h2 className="text-2xl font-bold tracking-tight text-teal-700 animate-fade-in">Nutritional Assessment</h2>
              <Scale className="text-teal-500 w-7 h-7 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 gap-4 text-gray-700 sm:grid-cols-3">
              <p><span className="font-medium">Weight:</span> {assessment?.weight || 'N/A'} kg</p>
              <p><span className="font-medium">Height:</span> {assessment?.height || 'N/A'} cm</p>
              <p><span className="font-medium">Diet Habits:</span> {assessment?.dietHabits || 'N/A'}</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="p-6 transition-all duration-300 transform bg-white shadow-xl rounded-xl hover:shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-teal-100">
              <h2 className="text-2xl font-bold tracking-tight text-teal-700 animate-fade-in">Set Meal Plan (Nutrient Targets)</h2>
              <Utensils className="text-teal-500 w-7 h-7 animate-pulse" />
            </div>
            <form onSubmit={handleMealPlanSubmit} className="space-y-6">
              {['breakfast', 'lunch', 'dinner'].map((mealType) => (
                <div key={mealType}>
                  <h3 className="mb-3 text-lg font-medium text-teal-700 capitalize">{mealType}</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Carbohydrates (g)</label>
                      <input
                        type="number"
                        min="0"
                        value={mealPlanForm[mealType].carbohydrates}
                        onChange={(e) => handleMealPlanChange(mealType, 'carbohydrates', e.target.value)}
                        placeholder="e.g., 50"
                        className="w-full p-3 border border-teal-200 rounded-lg bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Proteins (g)</label>
                      <input
                        type="number"
                        min="0"
                        value={mealPlanForm[mealType].proteins}
                        onChange={(e) => handleMealPlanChange(mealType, 'proteins', e.target.value)}
                        placeholder="e.g., 20"
                        className="w-full p-3 border border-teal-200 rounded-lg bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Lipids (g)</label>
                      <input
                        type="number"
                        min="0"
                        value={mealPlanForm[mealType].lipids}
                        onChange={(e) => handleMealPlanChange(mealType, 'lipids', e.target.value)}
                        placeholder="e.g., 15"
                        className="w-full p-3 border border-teal-200 rounded-lg bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <label className="block text-sm font-medium text-teal-700">Recommended Foods</label>
                    {['carbohydrates', 'proteins', 'lipids'].map((nutrientType) => (
                      <div key={nutrientType} className="p-3 bg-teal-50 rounded-lg">
                        <h4 className="mb-2 text-sm font-medium text-gray-800 capitalize">{nutrientType}</h4>
                        <select
                          onChange={(e) => {
                            const [foodName, quantity] = e.target.value.split('|');
                            const food = foodOptions[nutrientType].find(f => f.name === foodName);
                            if (food) handleFoodSelection(mealType, nutrientType, food, quantity || 100);
                          }}
                          className="w-full p-2 mb-2 border border-teal-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="">Select a food...</option>
                          {foodOptions[nutrientType].map((food) => (
                            <option key={food.name} value={`${food.name}|100`}>{food.name} (~{food[nutrientType]}g/100g)</option>
                          ))}
                        </select>
                        <ul className="text-sm text-gray-600">
                          {mealPlanForm.recommendedFoods[mealType].map((food, index) => (
                            <li key={index} className="flex items-center justify-between">
                              <span>{food.name} - {food.quantity}g ({food[nutrientType]}g {nutrientType})</span>
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
                                className="ml-2 text-red-500 hover:text-red-700"
                              >
                                Remove
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
                <h3 className="mb-3 text-lg font-medium text-teal-700">Hemodialysis Limits (Daily Targets)</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Potassium (mg)</label>
                    <input
                      type="number"
                      min="0"
                      value={mealPlanForm.hemodialysisLimits.potassium}
                      onChange={(e) => handleHemodialysisLimitsChange('potassium', e.target.value)}
                      placeholder="e.g., 2000"
                      className="w-full p-3 border border-teal-200 rounded-lg bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Phosphorus (mg)</label>
                    <input
                      type="number"
                      min="0"
                      value={mealPlanForm.hemodialysisLimits.phosphorus}
                      onChange={(e) => handleHemodialysisLimitsChange('phosphorus', e.target.value)}
                      placeholder="e.g., 800"
                      className="w-full p-3 border border-teal-200 rounded-lg bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Sodium (mg)</label>
                    <input
                      type="number"
                      min="0"
                      value={mealPlanForm.hemodialysisLimits.sodium}
                      onChange={(e) => handleHemodialysisLimitsChange('sodium', e.target.value)}
                      placeholder="e.g., 2000"
                      className="w-full p-3 border border-teal-200 rounded-lg bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Fluid (ml)</label>
                    <input
                      type="number"
                      min="0"
                      value={mealPlanForm.hemodialysisLimits.fluid}
                      onChange={(e) => handleHemodialysisLimitsChange('fluid', e.target.value)}
                      placeholder="e.g., 1000"
                      className="w-full p-3 border border-teal-200 rounded-lg bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="w-full p-3 text-white transition-all duration-300 transform bg-teal-600 rounded-lg shadow-md hover:bg-teal-700 hover:scale-105 active:scale-95"
              >
                Save Meal Plan
              </button>
            </form>
          </div>
        </section>

        <section ref={messagesRef} className="mb-12">
          <div className="p-6 transition-all duration-300 transform bg-white shadow-xl rounded-xl hover:shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-teal-100">
              <h2 className="text-2xl font-bold tracking-tight text-teal-700 animate-fade-in">Messages</h2>
              <MessageSquare className="text-teal-500 w-7 h-7 animate-pulse" />
            </div>
            <form onSubmit={handleSendMessage} className="mb-6 space-y-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full p-4 transition-all duration-200 border border-teal-200 rounded-lg resize-none bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows="4"
                required
              />
              <button
                type="submit"
                className="flex items-center justify-center w-full p-3 space-x-2 text-white transition-all duration-300 transform bg-teal-600 rounded-lg shadow-md hover:bg-teal-700 hover:scale-105 active:scale-95"
              >
                <Send className="w-5 h-5" />
                <span className="font-semibold">Send Message</span>
              </button>
            </form>
            <h3 className="mb-4 text-lg font-semibold text-teal-600">Conversation</h3>
            {messages.length === 0 ? (
              <p className="flex items-center justify-center text-lg text-center text-gray-600">
                <MessageSquare className="w-6 h-6 mr-2" /> No messages yet
              </p>
            ) : (
              <ul className="space-y-6">
                {messages.map((msg) => (
                  <li
                    key={msg._id}
                    className={`p-4 bg-teal-50 border ${msg.isEmergency ? 'border-red-300' : 'border-teal-200'} rounded-lg shadow-md hover:bg-teal-100 transition-all duration-300`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-800">
                          {String(msg.sender?._id || msg.sender) === String(providerId)
                            ? `You: ${msg.providerUsername}`
                            : `Patient: ${msg.patientUsername}`}
                          {msg.isEmergency && <span className="ml-2 font-bold text-red-500">🚨 Emergency</span>}
                        </p>
                        <span className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700">{msg.content}</p>
                      {String(msg.recipient?._id || msg.recipient) === String(providerId) && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleReply(msg._id);
                          }}
                          className="flex mt-3 space-x-3"
                        >
                          <input
                            type="text"
                            value={replyContent[msg._id] || ''}
                            onChange={(e) => setReplyContent({ ...replyContent, [msg._id]: e.target.value })}
                            placeholder="Reply to this message..."
                            className="flex-1 p-3 transition-all duration-200 bg-white border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                          <button
                            type="submit"
                            className="p-3 text-white transition-all duration-300 bg-teal-600 rounded-lg shadow-md hover:bg-teal-700 hover:scale-105"
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        </form>
                      )}
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

export default ProviderPatientDetailPage;