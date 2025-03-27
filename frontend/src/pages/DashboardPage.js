import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import FoodLog from "../components/patient/FoodLog";
import Education from "../components/patient/Education";
import MealPlan from "../components/patient/MealPlan";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [foodLogs, setFoodLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [assessment, setAssessment] = useState({
    weight: "",
    height: "",
    dietHabits: "",
  });
  const [message, setMessage] = useState("");
  const [goals, setGoals] = useState({ dailyWater: 2000, logsToday: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Dashboard token:", token); // Debug
        if (!token) {
          console.error("No token found, redirecting to login");
          navigate("/login");
          return;
        }
        const [logsRes, notificationsRes] = await Promise.all([
          api.get("/patient/food-logs", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/patient/notifications", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setFoodLogs(logsRes.data);
        setNotifications(notificationsRes.data);
        setGoals((prev) => ({
          ...prev,
          logsToday: logsRes.data.filter(
            (log) =>
              new Date(log.date).toDateString() === new Date().toDateString()
          ).length,
        }));
      } catch (err) {
        console.error("Fetch error:", err.response?.data || err.message);
        setError(
          err.response?.data?.error || err.message || "Failed to load data"
        );
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.error("Auth failure, redirecting to login");
          navigate("/login");
        }
      }
    };
    fetchData();
  }, [navigate]);

  const handleAssessmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not logged in");
      const res = await api.post("/patient/assessment", assessment, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssessment({ weight: "", height: "", dietHabits: "" });
      alert("Assessment submitted successfully!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit assessment");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not logged in");
      await api.post(
        "/patient/message",
        { message },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("");
      alert("Message sent to your healthcare provider!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send message");
    }
  };

  const handleUrgentContact = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not logged in");
      await api.post(
        "/patient/urgent-contact",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Emergency contact notified!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send urgent message");
    }
  };

  const handleNewLog = (newLog) => {
    setFoodLogs((prev) => [...prev, newLog]);
    setGoals((prev) => ({
      ...prev,
      logsToday:
        prev.logsToday +
        (new Date(newLog.date).toDateString() === new Date().toDateString()
          ? 1
          : 0),
    }));
  };

  const chartData = {
    labels: foodLogs.map((log) => new Date(log.date).toLocaleDateString()),
    datasets: [
      {
        label: "Food/Fluid Quantity",
        data: foodLogs.map((log) => log.quantity || log.amount),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Your Intake Trend" },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar role="patient" />
      <div className="max-w-6xl mx-auto p-6 flex-grow">
        <h1 className="text-4xl font-bold mb-8 text-center text-teal-600">
          Your HemoNutri Dashboard
        </h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Nutritional Assessment */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Nutritional Assessment
          </h2>
          <form
            onSubmit={handleAssessmentSubmit}
            className="bg-white p-6 rounded-lg shadow-md space-y-4"
          >
            <input
              type="number"
              value={assessment.weight}
              onChange={(e) =>
                setAssessment({ ...assessment, weight: e.target.value })
              }
              placeholder="Weight (kg)"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
            <input
              type="number"
              value={assessment.height}
              onChange={(e) =>
                setAssessment({ ...assessment, height: e.target.value })
              }
              placeholder="Height (cm)"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
            <textarea
              value={assessment.dietHabits}
              onChange={(e) =>
                setAssessment({ ...assessment, dietHabits: e.target.value })
              }
              placeholder="Describe your daily diet (e.g., I eat injera often)"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
            <button
              type="submit"
              className="w-full bg-teal-500 text-white p-3 rounded-lg hover:bg-teal-600 transition"
            >
              Submit Assessment
            </button>
          </form>
        </section>

        {/* Food/Fluid Log */}
        <section id="food-log" className="mb-12">
          <FoodLog setLogs={setFoodLogs} />
          <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h3 className="text-xl font-medium mb-4">Recent Logs</h3>
            {foodLogs.length === 0 ? (
              <p className="text-gray-500">No logs yet.</p>
            ) : (
              <ul className="space-y-3">
                {foodLogs.slice(0, 5).map((log) => (
                  <li key={log._id} className="p-3 bg-gray-100 rounded-lg">
                    {log.foodItem || log.food} - {log.quantity || log.amount}
                    {log.isFluid ? 'ml' : 'g'} on {new Date(log.date).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Meal Plan */}
        <section className="mb-12">
          <MealPlan onLog={handleNewLog} />
        </section>

        {/* Chart */}
        <section className="mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Line data={chartData} options={chartOptions} />
          </div>
        </section>

        {/* Educational Resources */}
        <section className="mb-12">
          <Education />
        </section>

        {/* Communication */}
        <section id="contact" className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Contact Your Provider
          </h2>
          <form
            onSubmit={handleSendMessage}
            className="bg-white p-6 rounded-lg shadow-md space-y-4"
          >
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask a question or request advice..."
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
            <button
              type="submit"
              className="w-full bg-teal-500 text-white p-3 rounded-lg hover:bg-teal-600 transition"
            >
              Send Message
            </button>
          </form>
          <button
            onClick={handleUrgentContact}
            className="mt-4 w-full bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition"
          >
            🚨 Urgent Contact
          </button>
        </section>

        {/* Goals & Rewards */}
        <section id="goals">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Goals & Rewards
          </h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p>
              Daily Water Goal: {goals.dailyWater}ml (
              {foodLogs
                .filter(
                  (log) =>
                    log.isFluid &&
                    new Date(log.date).toDateString() ===
                      new Date().toDateString()
                )
                .reduce(
                  (sum, log) => sum + parseInt(log.quantity || log.amount || 0),
                  0
                )}
              ml logged)
            </p>
            <p>
              Logs Today: {goals.logsToday}/5{" "}
              {goals.logsToday >= 5 && "🎉 Badge Earned!"}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Log 5 items daily to earn a reward!
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PatientDashboard;
