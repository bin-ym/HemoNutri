import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Utensils, Scale, MessageSquare, Clipboard, Send, Clock, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';

const ProviderPatientDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [foodLogs, setFoodLogs] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [messages, setMessages] = useState([]);
  const [mealPlanForm, setMealPlanForm] = useState({
    breakfast: [{ name: '', quantity: '', isFluid: false }],
    lunch: [{ name: '', quantity: '', isFluid: false }],
    dinner: [{ name: '', quantity: '', isFluid: false }],
  });
  const [message, setMessage] = useState('');
  const [replyContent, setReplyContent] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const providerId = localStorage.getItem('userId');

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

  const handleMealPlanChange = (mealType, index, field, value) => {
    setMealPlanForm((prev) => {
      const updatedMeal = [...prev[mealType]];
      updatedMeal[index] = { ...updatedMeal[index], [field]: value };
      return { ...prev, [mealType]: updatedMeal };
    });
  };

  const addMealItem = (mealType) => {
    setMealPlanForm((prev) => ({
      ...prev,
      [mealType]: [...prev[mealType], { name: '', quantity: '', isFluid: false }],
    }));
  };

  const handleMealPlanSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/provider/meal-plan/${id}`, mealPlanForm);
      alert('Meal plan updated successfully!');
      setError('');
    } catch (err) {
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
                        {log.foodItem} - {log.quantity} {log.isFluid ? 'ml' : 'g'}
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
              <h2 className="text-2xl font-bold tracking-tight text-teal-700 animate-fade-in">Set Meal Plan</h2>
              <Utensils className="text-teal-500 w-7 h-7 animate-pulse" />
            </div>
            <form onSubmit={handleMealPlanSubmit} className="space-y-6">
              {['breakfast', 'lunch', 'dinner'].map((mealType) => (
                <div key={mealType}>
                  <h3 className="mb-3 text-lg font-medium text-teal-700 capitalize">{mealType}</h3>
                  {mealPlanForm[mealType].map((item, index) => (
                    <div key={index} className="flex mb-3 space-x-3">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleMealPlanChange(mealType, index, 'name', e.target.value)}
                        placeholder="Food/Drink Name"
                        className="flex-1 p-3 border border-teal-200 rounded-lg bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => handleMealPlanChange(mealType, index, 'quantity', e.target.value)}
                        placeholder="Quantity"
                        className="w-24 p-3 border border-teal-200 rounded-lg bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <select
                        value={item.isFluid}
                        onChange={(e) => handleMealPlanChange(mealType, index, 'isFluid', e.target.value === 'true')}
                        className="w-24 p-3 border border-teal-200 rounded-lg bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="false">g</option>
                        <option value="true">ml</option>
                      </select>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addMealItem(mealType)}
                    className="text-teal-600 transition-colors duration-200 hover:text-teal-800"
                  >
                    + Add Item
                  </button>
                </div>
              ))}
              <button
                type="submit"
                className="w-full p-3 text-white transition-all duration-300 transform bg-teal-600 rounded-lg shadow-md hover:bg-teal-700 hover:scale-105 active:scale-95"
              >
                Save Meal Plan
              </button>
            </form>
          </div>
        </section>

        <section className="mb-12">
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