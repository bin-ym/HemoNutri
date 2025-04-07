import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Navbar from "../../components/Navbar";

const ProviderMealPlansPage = () => {
  const [mealPlans, setMealPlans] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [mealPlanForm, setMealPlanForm] = useState({
    breakfast: [{ name: "", quantity: "", isFluid: false }],
    lunch: [{ name: "", quantity: "", isFluid: false }],
    dinner: [{ name: "", quantity: "", isFluid: false }],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || localStorage.getItem("role") !== "provider") {
          navigate("/login");
          return;
        }
        const [plansRes, patientsRes] = await Promise.all([
          api.get("/provider/meal-plans"),
          api.get("/provider/patients"),
        ]);
        setMealPlans(Array.isArray(plansRes.data) ? plansRes.data : []);
        setPatients(Array.isArray(patientsRes.data) ? patientsRes.data : []);
      } catch (err) {
        console.error("Fetch data error:", err.response?.data || err.message);
        setError(err.response?.data?.error || "Failed to load meal plans");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

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
      [mealType]: [
        ...prev[mealType],
        { name: "", quantity: "", isFluid: false },
      ],
    }));
  };

  const handleMealPlanSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return setError("Select a patient first");
    try {
      const res = await api.post(
        `/provider/meal-plan/${selectedPatient}`,
        mealPlanForm
      );
      setMealPlans([...mealPlans, res.data]);
      setMealPlanForm({
        breakfast: [{ name: "", quantity: "", isFluid: false }],
        lunch: [{ name: "", quantity: "", isFluid: false }],
        dinner: [{ name: "", quantity: "", isFluid: false }],
      });
      setError("");
      alert("Meal plan saved successfully!");
    } catch (err) {
      console.error(
        "Meal plan submit error:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.error || "Failed to save meal plan");
    }
  };

  if (loading)
    return <p className="mt-10 text-center">Loading meal plans...</p>;
  if (error && !mealPlans.length)
    return <p className="mt-10 text-center text-red-500">{error}</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar role="provider" />
      <div className="flex-grow max-w-6xl p-6 mx-auto">
        <h1 className="mb-6 text-3xl font-bold text-teal-600">Meal Plans</h1>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Current Meal Plans
            </h2>
            {mealPlans.length === 0 ? (
              <p className="text-gray-500">No meal plans set yet.</p>
            ) : (
              <ul className="space-y-4">
                {mealPlans.map((plan) => (
                  <li key={plan._id} className="p-3 bg-gray-100 rounded">
                    <p>
                      <strong>Patient:</strong> {plan.patientUsername}
                    </p>
                    <p>
                      <strong>Breakfast:</strong>{" "}
                      {plan.breakfast
                        .map(
                          (b) =>
                            `${b.name} (${b.quantity}${b.isFluid ? "ml" : "g"})`
                        )
                        .join(", ")}
                    </p>
                    <p>
                      <strong>Lunch:</strong>{" "}
                      {plan.lunch
                        .map(
                          (l) =>
                            `${l.name} (${l.quantity}${l.isFluid ? "ml" : "g"})`
                        )
                        .join(", ")}
                    </p>
                    <p>
                      <strong>Dinner:</strong>{" "}
                      {plan.dinner
                        .map(
                          (d) =>
                            `${d.name} (${d.quantity}${d.isFluid ? "ml" : "g"})`
                        )
                        .join(", ")}
                    </p>
                    <p className="text-sm text-gray-500">
                      Updated: {new Date(plan.updatedAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Set New Meal Plan
            </h2>
            {error && <p className="mb-4 text-red-500">{error}</p>}
            <form onSubmit={handleMealPlanSubmit} className="space-y-4">
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select Patient</option>
                {patients.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.username}
                  </option>
                ))}
              </select>
              {["breakfast", "lunch", "dinner"].map((mealType) => (
                <div key={mealType}>
                  <h3 className="mb-2 text-lg font-medium capitalize">
                    {mealType}
                  </h3>
                  {mealPlanForm[mealType].map((item, index) => (
                    <div key={index} className="flex mb-2 space-x-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          handleMealPlanChange(
                            mealType,
                            index,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="Food/Drink Name"
                        className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) =>
                          handleMealPlanChange(
                            mealType,
                            index,
                            "quantity",
                            e.target.value
                          )
                        }
                        placeholder="Quantity"
                        className="w-24 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <select
                        value={item.isFluid}
                        onChange={(e) =>
                          handleMealPlanChange(
                            mealType,
                            index,
                            "isFluid",
                            e.target.value === "true"
                          )
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
                    className="mb-2 text-teal-500 hover:underline"
                  >
                    + Add Item
                  </button>
                </div>
              ))}
              <button
                type="submit"
                className="w-full p-2 text-white bg-teal-500 rounded hover:bg-teal-600"
              >
                Save Meal Plan
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderMealPlansPage;
