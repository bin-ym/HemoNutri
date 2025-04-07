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
          navigate('/login');
          return;
        }
        const [patientRes, logsRes, assessRes, messagesRes] = await Promise.all([
          api.get(`/provider/patient/${id}`),
          api.get(`/provider/patient/${id}/food-logs`),
          api.get(`/provider/patient/${id}/assessment`),
          api.get(`/provider/messages/${id}`),
        ]);
        setPatient(patientRes.data);
        setFoodLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
        setAssessment(
          assessRes.data || { weight: 'N/A', height: 'N/A', dietHabits: 'N/A' }
        );
        setMessages(Array.isArray(messagesRes.data) ? messagesRes.data : []);
        setError('');
      } catch (err) {
        const errorMsg = err.response?.data?.error || 'Failed to load patient data';
        console.error('Fetch patient data error:', err.response?.data || err.message);
        setError(errorMsg);
        if (errorMsg.includes('Token expired') || errorMsg.includes('Token verification error')) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('userId');
          navigate('/login', { state: { message: 'Your session has expired. Please log in again.' } });
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
      const errorMsg = err.response?.data?.error || 'Failed to update meal plan';
      console.error('Meal plan submit error:', err.response?.data || err.message);
      setError(errorMsg);
      if (errorMsg.includes('Token expired') || errorMsg.includes('Token verification error')) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        navigate('/login', { state: { message: 'Your session has expired. Please log in again.' } });
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/provider/message/${id}`, { content: message });
      setMessages([...messages, res.data]);
      setMessage('');
      setError('');
      alert('Message sent successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to send message';
      console.error('Send message error:', err.response?.data || err.message);
      setError(errorMsg);
      if (errorMsg.includes('Token expired') || errorMsg.includes('Token verification error')) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        navigate('/login', { state: { message: 'Your session has expired. Please log in again.' } });
      }
    }
  };

  const handleReply = async (msgId, recipientId) => {
    try {
      const content = replyContent[msgId] || '';
      if (!content.trim()) return;
      const res = await api.post(`/provider/message/${recipientId}`, { content });
      setMessages([...messages, res.data]);
      setReplyContent((prev) => ({ ...prev, [msgId]: '' }));
      setError('');
      alert('Reply sent successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reply');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-teal-50 to-gray-100">
        <Navbar role="provider" />
        <div className="flex items-center justify-center flex-grow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 border-4 border-teal-600 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-lg text-teal-700 animate-pulse">Loading patient details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !patient) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-teal-50 to-gray-100">
        <Navbar role="provider" />
        <div className="flex items-center justify-center flex-grow">
          <div className="max-w-md p-6 border border-red-200 rounded-lg shadow-md bg-red-50">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <p className="text-lg text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-teal-50 to-gray-100">
      <Navbar role="provider" />
      <div className="flex-grow max-w-6xl p-6 mx-auto">
        {/* Header */}
        <div className="relative mb-12 text-center">
          <div className="absolute inset-0 h-32 bg-teal-600 rounded-b-full -top-8 opacity-10 blur-2xl"></div>
          <h1 className="relative text-4xl font-extrabold text-teal-700 md:text-5xl animate-fade-in">
            Patient Details: {patient?.username || 'Unknown'}
          </h1>
          <p className="relative max-w-2xl mx-auto mt-3 text-lg text-gray-600">
            Manage your patient’s nutrition and communication.
          </p>
          <Clipboard className="relative w-12 h-12 mx-auto mt-4 text-teal-500 animate-bounce-slow" />
        </div>

        {error && (
          <div className="p-4 mb-6 text-center text-red-500 rounded-lg shadow-md bg-red-50">
            <div className="flex items-center justify-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Food Logs */}
        <section className="mb-12">
          <div className="p-6 bg-white shadow-lg rounded-xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-teal-100">
              <h2 className="text-2xl font-semibold text-teal-600">Food Logs</h2>
              <Utensils className="w-6 h-6 text-teal-500" />
            </div>
            {foodLogs.length === 0 ? (
              <p className="text-center text-gray-500">No logs available yet.</p>
            ) : (
              <ul className="space-y-4">
                {foodLogs.map((log) => (
                  <li
                    key={log._id}
                    className="p-4 transition-all duration-300 border border-teal-100 rounded-lg shadow-md bg-teal-50 hover:shadow-xl"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">
                        {log.foodItem} - {log.quantity} {log.isFluid ? 'ml' : 'g'}
                      </span>
                      <span className="flex items-center text-gray-500">
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

        {/* Nutritional Assessment */}
        <section className="mb-12">
          <div className="p-6 bg-white shadow-lg rounded-xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-teal-100">
              <h2 className="text-2xl font-semibold text-teal-600">Nutritional Assessment</h2>
              <Scale className="w-6 h-6 text-teal-500" />
            </div>
            <div className="grid grid-cols-1 gap-4 text-gray-700 sm:grid-cols-3">
              <p>
                <span className="font-medium">Weight:</span> {assessment?.weight || 'N/A'} kg
              </p>
              <p>
                <span className="font-medium">Height:</span> {assessment?.height || 'N/A'} cm
              </p>
              <p>
                <span className="font-medium">Diet Habits:</span> {assessment?.dietHabits || 'N/A'}
              </p>
            </div>
          </div>
        </section>

        {/* Set Meal Plan */}
        <section className="mb-12">
          <div className="p-6 bg-white shadow-lg rounded-xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-teal-100">
              <h2 className="text-2xl font-semibold text-teal-600">Set Meal Plan</h2>
              <Utensils className="w-6 h-6 text-teal-500" />
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
                        onChange={(e) =>
                          handleMealPlanChange(mealType, index, 'name', e.target.value)
                        }
                        placeholder="Food/Drink Name"
                        className="flex-1 p-2 border border-teal-200 rounded bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) =>
                          handleMealPlanChange(mealType, index, 'quantity', e.target.value)
                        }
                        placeholder="Quantity"
                        className="w-24 p-2 border border-teal-200 rounded bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <select
                        value={item.isFluid}
                        onChange={(e) =>
                          handleMealPlanChange(mealType, index, 'isFluid', e.target.value === 'true')
                        }
                        className="w-24 p-2 border border-teal-200 rounded bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                className="w-full p-3 text-white transition duration-300 bg-teal-600 rounded-lg shadow-md hover:bg-teal-700"
              >
                Save Meal Plan
              </button>
            </form>
          </div>
        </section>

        {/* Messages */}
        <section className="mb-12">
          <div className="p-6 bg-white shadow-lg rounded-xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-teal-100">
              <h2 className="text-2xl font-semibold text-teal-600">Messages</h2>
              <MessageSquare className="w-6 h-6 text-teal-500" />
            </div>
            <form onSubmit={handleSendMessage} className="mb-6 space-y-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full p-3 border border-teal-200 rounded bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows="4"
              />
              <button
                type="submit"
                className="flex items-center justify-center w-full p-3 text-white transition duration-300 bg-teal-600 rounded-lg shadow-md hover:bg-teal-700"
              >
                <Send className="w-5 h-5 mr-2" />
                Send Message
              </button>
            </form>
            <h3 className="mb-4 text-lg font-semibold text-teal-600">Conversation</h3>
            {messages.length === 0 ? (
              <p className="text-center text-gray-500">No messages yet.</p>
            ) : (
              <ul className="space-y-4">
                {messages.map((msg) => (
                  <li
                    key={msg._id}
                    className={`p-4 rounded-lg shadow-md border border-teal-100 transition-all duration-300 ${
                      msg.isEmergency ? 'bg-red-50' : 'bg-teal-50'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-gray-700">
                          <strong>{msg.sender._id === providerId ? 'To' : 'From'}:</strong>{' '}
                          {msg.patientUsername}
                        </p>
                        <span className="flex items-center text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                      <p className={msg.isEmergency ? 'text-red-600 font-medium' : 'text-gray-700'}>
                        {msg.content}
                      </p>
                      {msg.recipient._id === providerId && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleReply(msg._id, msg.sender._id);
                          }}
                          className="flex mt-2 space-x-2"
                        >
                          <input
                            type="text"
                            value={replyContent[msg._id] || ''}
                            onChange={(e) =>
                              setReplyContent({ ...replyContent, [msg._id]: e.target.value })
                            }
                            placeholder="Type your reply..."
                            className="flex-1 p-2 border border-teal-200 rounded bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                          <button
                            type="submit"
                            className="p-2 text-white transition duration-300 bg-teal-600 rounded hover:bg-teal-700"
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