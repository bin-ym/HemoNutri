import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Utensils,
  AlertCircle,
  Clock,
  Target,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import toast, { Toaster } from "react-hot-toast";
import localforage from "localforage";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import MealPlan from "../../components/MealPlan";

const MealPlanPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [tempConsumed, setTempConsumed] = useState(null);
  const [warnings, setWarnings] = useState([]);

  // Ethiopian food options
  const recommendedFoods = {
    breakfast: [
      {
        name: "Teff Porridge",
        carbohydrates: 20,
        proteins: 4,
        lipids: 2,
        quantity: 200,
      },
      {
        name: "Injera with Honey",
        carbohydrates: 30,
        proteins: 5,
        lipids: 3,
        quantity: 150,
      },
    ],
    lunch: [
      {
        name: "Misir Wot (Lentil Stew)",
        carbohydrates: 25,
        proteins: 8,
        lipids: 5,
        quantity: 200,
      },
      {
        name: "Vegetable Tibs",
        carbohydrates: 15,
        proteins: 3,
        lipids: 6,
        quantity: 150,
      },
    ],
    dinner: [
      {
        name: "Shiro with Injera",
        carbohydrates: 28,
        proteins: 7,
        lipids: 4,
        quantity: 200,
      },
      {
        name: "Boiled Yam",
        carbohydrates: 22,
        proteins: 2,
        lipids: 1,
        quantity: 100,
      },
    ],
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        if (!token || role !== "patient") {
          navigate("/login");
          return;
        }

        // Check offline cache
        const cachedMealPlan = await localforage.getItem("mealPlan");
        const cachedLogs = await localforage.getItem("foodLogs");
        if (cachedMealPlan) setMealPlan(cachedMealPlan);
        if (cachedLogs) setLogs(cachedLogs);

        const logsRes = await api.get("/patient/food-logs");
        const logsData = Array.isArray(logsRes.data) ? logsRes.data : [];
        setLogs(logsData);
        await localforage.setItem("foodLogs", logsData);

        const mealPlanRes = await api.get("/patient/meal-plan");
        setMealPlan(mealPlanRes.data);
        await localforage.setItem("mealPlan", mealPlanRes.data);
        setError("");

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
          newWarnings.push(
            t("potassium_exceed", {
              intake: totals.potassium,
              limit: limits.potassium,
            })
          );
        }
        if (totals.phosphorus > limits.phosphorus) {
          newWarnings.push(
            t("phosphorus_exceed", {
              intake: totals.phosphorus,
              limit: limits.phosphorus,
            })
          );
        }
        if (totals.sodium > limits.sodium) {
          newWarnings.push(
            t("sodium_exceed", { intake: totals.sodium, limit: limits.sodium })
          );
        }
        if (totals.fluid > limits.fluid) {
          newWarnings.push(
            t("fluid_exceed", { intake: totals.fluid, limit: limits.fluid })
          );
        }
        setWarnings(newWarnings);
      } catch (err) {
        setError(err.response?.data?.error || t("failed_load_data"));
        toast.error(err.response?.data?.error || t("failed_load_data"));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, t]);

  const handleLog = (newLog) => {
    setLogs((prev) => {
      const updatedLogs = [newLog, ...prev];
      localforage.setItem("foodLogs", updatedLogs);

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
        newWarnings.push(
          t("potassium_exceed", {
            intake: totals.potassium,
            limit: limits.potassium,
          })
        );
      }
      if (totals.phosphorus > limits.phosphorus) {
        newWarnings.push(
          t("phosphorus_exceed", {
            intake: totals.phosphorus,
            limit: limits.phosphorus,
          })
        );
      }
      if (totals.sodium > limits.sodium) {
        newWarnings.push(
          t("sodium_exceed", { intake: totals.sodium, limit: limits.sodium })
        );
      }
      if (totals.fluid > limits.fluid) {
        newWarnings.push(
          t("fluid_exceed", { intake: totals.fluid, limit: limits.fluid })
        );
      }
      setWarnings(newWarnings);
      toast.success(t("log_added"));
      return updatedLogs;
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? t("date_unavailable")
      : date.toLocaleString("am-ET", {
          dateStyle: "medium",
          timeStyle: "short",
        });
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
      const res = await api.put("/patient/meal-plan/consume", {
        mealType: selectedMeal,
        consumed: tempConsumed,
      });
      setMealPlan(res.data);
      await localforage.setItem("mealPlan", res.data);
      closeModal();
      toast.success(t("meal_updated"));
    } catch (err) {
      toast.error(err.response?.data?.error || t("failed_update_meal"));
    }
  };

  const quickLog = async (mealType) => {
    try {
      await api.put("/patient/meal-plan/consume", { mealType, consumed: true });
      const updatedMealPlan = {
        ...mealPlan,
        consumed: { ...mealPlan.consumed, [mealType]: true },
      };
      setMealPlan(updatedMealPlan);
      await localforage.setItem("mealPlan", updatedMealPlan);
      toast.success(t("meal_logged", { meal: t(mealType) }));
    } catch (err) {
      toast.error(t("failed_log_meal"));
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

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 font-noto-sans">
        <Navbar role="patient" />
        <div className="flex items-center justify-center flex-grow">
          <div className="relative w-24 h-24">
            <lottie-player
              src="https://assets.lottiefiles.com/packages/lf20_jcikwtux.json"
              background="transparent"
              speed="1"
              loop
              autoplay
            ></lottie-player>
            <p className="mt-4 text-lg font-semibold text-emerald-700">
              {t("loading_meal_plan")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !mealPlan) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 font-noto-sans">
        <Navbar role="patient" />
        <div className="flex-grow max-w-6xl p-6 mx-auto">
          <div className="relative mb-12 text-center">
            <h1 className="relative text-4xl font-extrabold text-emerald-800 md:text-5xl">
              {t("meal_plan_title")}
            </h1>
          </div>
          <div className="p-6 text-center bg-white shadow-lg rounded-2xl">
            <p className="text-rose-600">{error || t("no_meal_plan")}</p>
            <p className="mt-2 text-gray-700">{t("contact_provider")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-noto-sans">
      <Toaster position="top-right" />
      <Navbar role="patient" />
      <div className="flex-grow max-w-6xl p-6 mx-auto">
        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="p-6 mb-8 shadow-lg bg-rose-50 rounded-2xl">
            <h3 className="flex items-center text-lg font-semibold text-rose-700">
              <AlertCircle className="w-6 h-6 mr-2" />
              {t("warnings")}
            </h3>
            <ul className="mt-2 list-disc list-inside text-rose-600">
              {warnings.map((warning, index) => (
                <li key={index}>
                  {warning} - {t("suggest_low_potassium")}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Daily Targets */}
        <section className="mb-12">
          <div className="p-6 shadow-lg bg-gradient-to-br from-emerald-100 to-amber-100 rounded-2xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-emerald-200">
              <h2 className="text-3xl font-extrabold text-emerald-800">
                {t("daily_targets")}
              </h2>
              <Target className="w-8 h-8 text-amber-600 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {["breakfast", "lunch", "dinner"].map((mealType) => (
                <div
                  key={mealType}
                  className="p-6 transition-all duration-300 bg-white shadow-md cursor-pointer rounded-2xl hover:shadow-xl hover:scale-105"
                  onClick={() => openModal(mealType)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-emerald-700">
                      {t(mealType)}
                    </h3>
                    {mealPlan.consumed[mealType] ? (
                      <CheckCircle className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-rose-500" />
                    )}
                  </div>
                  <div className="space-y-1 text-gray-700">
                    <p>
                      <span className="font-medium">{t("carbs")}:</span>{" "}
                      {mealPlan[mealType].carbohydrates}g
                    </p>
                    <p>
                      <span className="font-medium">{t("proteins")}:</span>{" "}
                      {mealPlan[mealType].proteins}g
                    </p>
                    <p>
                      <span className="font-medium">{t("lipids")}:</span>{" "}
                      {mealPlan[mealType].lipids}g
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      quickLog(mealType);
                    }}
                    className="w-full py-2 mt-4 text-white transition-all rounded-lg bg-amber-600 hover:bg-amber-700"
                    aria-label={`Quick log ${t(mealType)}`}
                  >
                    {t("quick_log")}
                  </button>
                </div>
              ))}
            </div>
            <div className="p-6 mt-6 bg-white shadow-md rounded-2xl">
              <h3 className="mb-3 text-xl font-semibold text-emerald-700">
                {t("hemodialysis_limits")}
              </h3>
              <div className="grid grid-cols-1 gap-4 text-gray-700 sm:grid-cols-2">
                <p>
                  <span className="font-medium">{t("potassium")}:</span>{" "}
                  {mealPlan.hemodialysisLimits.potassium}mg
                </p>
                <p>
                  <span className="font-medium">{t("phosphorus")}:</span>{" "}
                  {mealPlan.hemodialysisLimits.phosphorus}mg
                </p>
                <p>
                  <span className="font-medium">{t("sodium")}:</span>{" "}
                  {mealPlan.hemodialysisLimits.sodium}mg
                </p>
                <p>
                  <span className="font-medium">{t("fluid")}:</span>{" "}
                  {mealPlan.hemodialysisLimits.fluid}ml
                </p>
              </div>
            </div>
            <h3 className="mt-8 mb-4 text-xl font-semibold text-emerald-700">
              {t("your_progress")}
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              {["carbohydrates", "proteins", "lipids", "fluid"].map(
                (nutrient) => {
                  const consumed = totalConsumed[nutrient];
                  const target = totalTargets[nutrient];
                  const percentage = Math.min(
                    (consumed / (target || 1)) * 100,
                    100
                  );
                  const isOver = consumed > target;
                  return (
                    <div key={nutrient} className="text-center">
                      <div className="w-24 h-24 mx-auto">
                        <CircularProgressbar
                          value={percentage}
                          text={`${Math.round(percentage)}%`}
                          styles={buildStyles({
                            pathColor: isOver ? "#e11d48" : "#10b981",
                            textColor: "#1f2937",
                            trailColor: "#e5e7eb",
                          })}
                        />
                      </div>
                      <p className="mt-2 font-medium text-gray-700">
                        {t(nutrient)}: {consumed.toFixed(1)}
                        {nutrient === "fluid" ? "ml" : "g"} / {target}
                        {nutrient === "fluid" ? "ml" : "g"}
                      </p>
                    </div>
                  );
                }
              )}
            </div>
            <p className="mt-6 text-sm text-gray-600">
              {t("nutrient_tracking_note")}
            </p>
          </div>
        </section>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-2xl">
              <h3 className="mb-4 text-2xl font-extrabold text-emerald-800">
                {t(`${selectedMeal}_details`)}
              </h3>
              <div className="space-y-4">
                {recommendedFoods[selectedMeal].map((food, index) => (
                  <div key={index} className="p-4 rounded-lg bg-emerald-50">
                    <p className="font-medium text-gray-800">
                      {food.name} - {food.quantity}g
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("carbs")}: {food.carbohydrates}g, {t("proteins")}:{" "}
                      {food.proteins}g, {t("lipids")}: {food.lipids}g
                    </p>
                  </div>
                ))}
                <div className="mt-4">
                  <h4 className="mb-2 text-lg font-semibold text-gray-800">
                    {t("consume_meal_question")}
                  </h4>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setTempConsumed(true)}
                      className={`flex-1 py-3 rounded-lg transition-all ${
                        tempConsumed
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      aria-label="Mark meal as consumed"
                    >
                      <CheckCircle
                        className={`w-6 h-6 mx-auto ${
                          tempConsumed ? "text-emerald-500" : "text-gray-500"
                        }`}
                      />
                      {t("yes")}
                    </button>
                    <button
                      onClick={() => setTempConsumed(false)}
                      className={`flex-1 py-3 rounded-lg transition-all ${
                        tempConsumed === false
                          ? "bg-rose-100 text-rose-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      aria-label="Mark meal as not consumed"
                    >
                      <XCircle
                        className={`w-6 h-6 mx-auto ${
                          tempConsumed === false
                            ? "text-rose-500"
                            : "text-gray-500"
                        }`}
                      />
                      {t("no")}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 text-gray-700 transition-all bg-gray-200 rounded-lg hover:bg-gray-300"
                  aria-label="Cancel"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={handleMealConsumption}
                  className="px-6 py-2 text-white transition-all rounded-lg bg-emerald-600 hover:bg-emerald-700"
                  aria-label="Submit meal consumption"
                >
                  {t("submit")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Food Logs */}
        <section>
          <div className="p-6 bg-white shadow-lg rounded-2xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-emerald-200">
              <h2 className="text-2xl font-extrabold text-emerald-800">
                {t("your_food_logs")}
              </h2>
              <Utensils className="w-7 h-7 text-amber-600 animate-pulse" />
            </div>
            {logs.length === 0 ? (
              <p className="flex items-center justify-center text-lg text-gray-600">
                <Utensils className="w-6 h-6 mr-2" /> {t("no_logs_available")}
              </p>
            ) : (
              <ul className="space-y-4">
                {logs.map((log) => (
                  <li
                    key={log._id}
                    className="p-4 transition-all rounded-lg shadow-sm bg-emerald-50 hover:bg-emerald-100"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-800">
                        {log.foodItem} - {log.quantity}{" "}
                        {log.isFluid ? "ml" : "g"} ({t("carbs")}:{" "}
                        {log.carbohydrates}g, {t("proteins")}: {log.proteins}g,{" "}
                        {t("lipids")}: {log.lipids}g, K: {log.potassium}mg, P:{" "}
                        {log.phosphorus}mg, Na: {log.sodium}mg)
                      </span>
                      <span className="flex items-center text-sm text-gray-600">
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
