import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api'; // Adjusted path if needed
import Navbar from '../Navbar'; // Adjusted path

const ProviderPage = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [foodLogs, setFoodLogs] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [mealPlanForm, setMealPlanForm] = useState({
    breakfast: [{ name: '', quantity: '', isFluid: false }],
    lunch: [{ name: '', quantity: '', isFluid: false }],
    dinner: [{ name: '', quantity: '', isFluid: false }],
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch patients on mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Fetching patients with token:', token);
        if (!token || localStorage.getItem('role') !== 'provider') {
          console.error('Invalid token or role, redirecting to login');
          navigate('/login');
          return;
        }
        console.log('Sending request to /provider/patients');
        const res = await Promise.race([
          api.get('/provider/patients'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), 5000)),
        ]);
        console.log('Received response:', res.data);
        setPatients(Array.isArray(res.data) ? res.data : []);
        setError(''); // Clear error on success
      } catch (err) {
        console.error('Fetch patients error:', err.message);
        setError(err.message || 'Failed to load patients');
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };
    fetchPatients();
  }, [navigate]);

  // Fetch patient data when selected
  const handlePatientSelect = async (patientId) => {
    try {
      setLoading(true);
      setError('');
      const [logsRes, assessRes] = await Promise.all([
        api.get(`/provider/patient/${patientId}/food-logs`),
        api.get(`/provider/patient/${patientId}/assessment`),
      ]);
      setSelectedPatient(patients.find((p) => p._id === patientId));
      setFoodLogs(logsRes.data);
      setAssessment(assessRes.data || { weight: 'N/A', height: 'N/A', dietHabits: 'N/A' });
    } catch (err) {
      console.error('Fetch patient data error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  // Handle meal plan input changes
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

  // Submit meal plan
  const handleMealPlanSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return setError('Select a patient first');
    try {
      await api.post(`/provider/meal-plan/${selectedPatient._id}`, mealPlanForm);
      alert('Meal plan updated successfully!');
    } catch (err) {
      console.error('Meal plan submit error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to update meal plan');
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return setError('Select a patient first');
    try {
      await api.post(`/provider/message/${selectedPatient._id}`, { content: message }); // Changed 'message' to 'content' to match backend
      setMessage('');
      alert('Message sent successfully!');
    } catch (err) {
      console.error('Send message error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to send message');
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar role="provider" />
      <div className="max-w-6xl mx-auto p-6 flex-grow">
        <h1 className="text-4xl font-bold mb-8 text-center text-teal-600">Provider Dashboard</h1>

        {/* Patient List */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">My Patients</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            {patients.length === 0 ? (
              <p className="text-gray-500">No patients assigned.</p>
            ) : (
              <ul className="space-y-2">
                {patients.map((patient) => (
                  <li
                    key={patient._id}
                    className={`p-2 rounded cursor-pointer hover:bg-teal-100 ${
                      selectedPatient?._id === patient._id ? 'bg-teal-200' : 'bg-gray-100'
                    }`}
                    onClick={() => handlePatientSelect(patient._id)}
                  >
                    {patient.username} ({patient.email})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {selectedPatient && (
          <>
            {/* Patient Food Logs */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">
                Food Logs for {selectedPatient.username}
              </h2>
              <div className="bg-white p-4 rounded-lg shadow-md">
                {foodLogs.length === 0 ? (
                  <p className="text-gray-500">No logs available.</p>
                ) : (
                  <ul className="space-y-2">
                    {foodLogs.map((log) => (
                      <li key={log._id} className="p-2 bg-gray-100 rounded">
                        {log.foodItem} - {log.quantity}
                        {log.isFluid ? 'ml' : 'g'} on {new Date(log.date).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* Patient Nutritional Assessment */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">
                Nutritional Assessment for {selectedPatient.username}
              </h2>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <p>Weight: {assessment?.weight} kg</p>
                <p>Height: {assessment?.height} cm</p>
                <p>Diet Habits: {assessment?.dietHabits}</p>
              </div>
            </section>

            {/* Set Meal Plan */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">
                Set Meal Plan for {selectedPatient.username}
              </h2>
              <form onSubmit={handleMealPlanSubmit} className="bg-white p-4 rounded-lg shadow-md space-y-4">
                {['breakfast', 'lunch', 'dinner'].map((mealType) => (
                  <div key={mealType}>
                    <h3 className="text-lg font-medium capitalize mb-2">{mealType}</h3>
                    {mealPlanForm[mealType].map((item, index) => (
                      <div key={index} className="flex space-x-2 mb-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleMealPlanChange(mealType, index, 'name', e.target.value)}
                          placeholder="Food/Drink Name"
                          className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <input
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) =>
                            handleMealPlanChange(mealType, index, 'quantity', e.target.value)
                          }
                          placeholder="Quantity"
                          className="w-24 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <select
                          value={item.isFluid}
                          onChange={(e) =>
                            handleMealPlanChange(mealType, index, 'isFluid', e.target.value === 'true')
                          }
                          className="w-24 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="false">g</option>
                          <option value="true">ml</option>
                        </select>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addMealItem(mealType)}
                      className="text-teal-500 hover:underline"
                    >
                      + Add Item
                    </button>
                  </div>
                ))}
                <button
                  type="submit"
                  className="w-full bg-teal-500 text-white p-2 rounded hover:bg-teal-600"
                >
                  Save Meal Plan
                </button>
              </form>
            </section>

            {/* Send Message */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">
                Message {selectedPatient.username}
              </h2>
              <form onSubmit={handleSendMessage} className="bg-white p-4 rounded-lg shadow-md space-y-4">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows="4"
                />
                <button
                  type="submit"
                  className="w-full bg-teal-500 text-white p-2 rounded hover:bg-teal-600"
                >
                  Send Message
                </button>
              </form>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default ProviderPage;