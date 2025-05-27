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

  const recommendedFoods = {
    breakfast: [
      { name: "Teff Porridge", carbohydrates: 20, proteins: 4, lipids: 2, quantity: 200 },
      { name: "Injera with Honey", carbohydrates: 30, proteins: 5, lipids: 3, quantity: 150 },
    ],
    lunch: [
      { name: "Misir Wot (Lentil Stew)", carbohydrates: 25, proteins: 8, lipids: 5, quantity: 200 },
      { name: "Vegetable Tibs", carbohydrates: 15, proteins: 3, lipids: 6, quantity: 150 },
    ],
    dinner: [
      { name: "Shiro with Injera", carbohydrates: 28, proteins: 7, lipids: 4, quantity: 200 },
      { name: "Boiled Yam", carbohydrates: 22, proteins: 2, lipids: 1, quantity: 100 },
    ],
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        if (!token || role !== "patient") {
          navigate("/login", { state: { message: t("login_patient") } });
          return;
        }

        const [cachedMealPlan, cachedLogs] = await Promise.all([
          localforage.getItem("meal_plan"),
          localforage.getItem("food_logs"),
        ]);
        if (cachedMealPlan) setMealPlan(cachedMealPlan);
        if (cachedLogs) setLogs(cachedLogs);

        const [logsRes, mealPlanRes] = await Promise.all([
          api.get("/patient/food-logs").catch((err) => ({
            error: err.response?.data?.error || "Food logs not found",
            data: [],
          })),
          api.get("/patient/meal-plan").catch((err) => ({
            error: err.response?.data?.error || "Meal plan not found",
            data: null,
          })),
        ]);

        if (logsRes.error) console.warn(logsRes.error);
        if (mealPlanRes.error) console.warn(mealPlanRes.error);

        const logsData = Array.isArray(logsRes.data) ? logsRes.data : [];
        setLogs(logsData);
        await localforage.setItem("food_logs", logsData);

        setMealPlan(mealPlanRes.data);
        await localforage.setItem("meal_plan", mealPlanRes.data);
        setError("");

        if (mealPlanRes.data) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todaysLogs = logsData.filter((log) => {
            const logDate = new Date(log.date);
            logDate.setHours(0, 0, 0, 0);
            return logDate.getTime() === today.getTime();
          });

          const totals = todaysLogs.reduce(
            (acc, log) => ({
              potassium: acc.potassium + Number(log.potassium || 0),
              phosphorus: acc.phosphorus + Number(log.phosphorus || 0),
              sodium: acc.sodium + Number(log.sodium || 0),
              fluid: acc.fluid + (log.isFluid ? Number(log.quantity || 0) : 0),
            }),
            { potassium: 0, phosphorus: 0, sodium: 0, fluid: 0 }
          );

          const limits = mealPlanRes.data.hemodialysisLimits || {};
          const newWarnings = [];
          if (totals.potassium > (limits.potassium || 2000)) {
            newWarnings.push(
              t("potassium_exceed", {
                intake: totals.potassium,
                limit: limits.potassium || 2000,
              })
            );
          }
          if (totals.phosphorus > (limits.phosphorus || 800)) {
            newWarnings.push(
              t("phosphorus_exceed", {
                intake: totals.phosphorus,
                limit: limits.phosphorus || 800,
              })
            );
          }
          if (totals.sodium > (limits.sodium || 2000)) {
            newWarnings.push(
              t("sodium_exceed", { intake: totals.sodium, limit: limits.sodium || 2000 })
            );
          }
          if (totals.fluid > (limits.fluid || 1000)) {
            newWarnings.push(
              t("fluid_exceed", { intake: totals.fluid, limit: limits.fluid || 1000 })
            );
          }
          setWarnings(newWarnings);
        }
      } catch (err) {
        const errorMsg = err.response?.data?.error || t("failed_load_data");
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, t]);

  const handleLog = (newLog) => {
    setLogs((prev) => {
      const updatedLogs = [newLog, ...prev];
      localforage.setItem("food_logs", updatedLogs);

      if (mealPlan) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaysLogs = updatedLogs.filter((log) => {
          const logDate = new Date(log.date);
          logDate.setHours(0, 0, 0, 0);
          return logDate.getTime() === today.getTime();
        });

        const totals = todaysLogs.reduce(
          (acc, log) => ({
            potassium: acc.potassium + Number(log.potassium || 0),
            phosphorus: acc.phosphorus + Number(log.phosphorus || 0),
            sodium: acc.sodium + Number(log.sodium || 0),
            fluid: acc.fluid + (log.isFluid ? Number(log.quantity || 0) : 0),
          }),
          { potassium: 0, phosphorus: 0, sodium: 0, fluid: 0 }
        );

        const limits = mealPlan.hemodialysisLimits || {};
        const newWarnings = [];
        if (totals.potassium > (limits.potassium || 2000)) {
          newWarnings.push(
            t("potassium_exceed", {
              intake: totals.potassium,
              limit: limits.potassium || 2000,
            })
          );
        }
        if (totals.phosphorus > (limits.phosphorus || 800)) {
          newWarnings.push(
            t("phosphorus_exceed", {
              intake: totals.phosphorus,
              limit: limits.phosphorus || 800,
            })
          );
        }
        if (totals.sodium > (limits.sodium || 2000)) {
          newWarnings.push(
            t("sodium_exceed", { intake: totals.sodium, limit: limits.sodium || 2000 })
          );
        }
        if (totals.fluid > (limits.fluid || 1000)) {
          newWarnings.push(
            t("fluid_exceed", { intake: totals.fluid, limit: limits.fluid || 1000 })
          );
        }
        setWarnings(newWarnings);
      }
      toast.success(t("log_added"));
      return updatedLogs;
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? t("date_unavailable")
      : date.toLocaleString("am-ET", { dateStyle: "medium", timeStyle: "short" });
  };

  const openModal = (mealType) => {
    setSelectedMeal(mealType);
    setTempConsumed(mealPlan?.consumed?.[mealType] || false);
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
      await localforage.setItem("meal_plan", res.data);
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
        consumed: { ...mealPlan?.consumed, [mealType]: true },
      };
      setMealPlan(updatedMealPlan);
      await localforage.setItem("meal_plan", updatedMealPlan);
      toast.success(t("meal_logged", { meal: t(mealType) }));
    } catch (err) {
      toast.error(err.response?.data?.error || t("failed_log_meal"));
    }
  };

  const todayLogs = mealPlan
    ? logs.filter((log) => {
        const logDate = new Date(log.date);
        const today = new Date();
        logDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        return logDate.getTime() === today.getTime();
      })
    : [];

  const totalConsumed = mealPlan
    ? todayLogs.reduce(
        (acc, log) => ({
          carbohydrates: acc.carbohydrates + Number(log.carbohydrates || 0),
          proteins: acc.proteins + Number(log.proteins || 0),
          lipids: acc.lipids + Number(log.lipids || 0),
          fluid: acc.fluid + (log.isFluid ? Number(log.quantity || 0) : 0),
        }),
        { carbohydrates: 0, proteins: 0, lipids: 0, fluid: 0 }
      )
    : { carbohydrates: 0, proteins: 0, lipids: 0, fluid: 0 };

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
      <div className="flex flex-col min-h-screen font-sans bg-gray-100">
        <Navbar role="patient" />
        <div className="flex items-center justify-center flex-grow">
          <div className="relative w-24 h-24 animate-fadeIn">
            <lottie-player
              src="/animations/loading.json"
              background="transparent"
              speed="1"
              loop
              autoplay
            ></lottie-player>
            <p className="mt-4 text-lg font-medium text-blue-600">{t("loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !mealPlan) {
    return (
      <div className="flex flex-col min-h-screen font-sans bg-gray-100">
        <Navbar role="patient" />
        <div className="flex-grow max-w-6xl p-6 mx-auto">
          <div className="relative mb-12 text-center animate-fadeIn">
            <h1 className="relative text-4xl font-bold text-blue-800 md:text-5xl">
              {t("meal_plan_title")}
            </h1>
          </div>
          <div className="p-6 text-center bg-white rounded-lg shadow-lg">
            <p className="text-red-600">{error || t("no_meal_plan")}</p>
            <p className="mt-2 text-gray-600">{t("contact_provider")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-100">
      <Toaster position="top-right" />
      <Navbar role="patient" />
      <div className="flex-grow max-w-6xl p-6 mx-auto">
        {warnings.length > 0 && (
          <div className="p-6 mb-6 bg-white rounded-lg shadow-lg">
            <h3 className="flex items-center mb-2 text-lg font-semibold text-blue-700">
              <AlertCircle className="w-6 h-6 mr-2 text-red-600" />
              {t("warnings")}
            </h3>
            <ul className="mt-2 text-red-600 list-disc list-inside">
              {warnings.map((warning, index) => (
                <li key={index}>{warning} - {t("suggest_low")}</li>
              ))}
            </ul>
          </div>
        )}

        <section className="mb-8">
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4 border-b-2 border-blue-200">
              <h2 className="text-3xl font-bold text-blue-800">{t("daily_targets")}</h2>
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {["breakfast", "lunch", "dinner"].map((mealType) => (
                <div
                  key={mealType}
                  className="p-4 transition-all duration-200 border border-blue-200 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100"
                  onClick={() => openModal(mealType)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-blue-700">{t(mealType)}</h3>
                    {mealPlan.consumed?.[mealType] ? (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="space-y-1 text-gray-600">
                    <p>
                      <span className="font-medium">{t("carbs")}:</span>{" "}
                      {mealPlan[mealType]?.carbohydrates || 0}g
                    </p>
                    <p>
                      <span className="font-medium">{t("proteins")}:</span>{" "}
                      {mealPlan[mealType]?.proteins || 0}g
                    </p>
                    <p>
                      <span className="font-medium">{t("lipids")}:</span>{" "}
                      {mealPlan[mealType]?.lipids || 0}g
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      quickLog(mealType);
                    }}
                    className="w-full py-2 mt-4 text-white bg-blue-700 rounded-lg hover:bg-blue-800"
                    aria-label={`Quick log ${t(mealType)}`}
                  >
                    {t("quick_log")}
                  </button>
                </div>
              ))}
            </div>
            <div className="p-6 mt-6 bg-white rounded-lg shadow-md">
              <h3 className="mb-3 text-lg font-semibold text-blue-700">{t("hemo_limits")}</h3>
              <div className="grid grid-cols-1 gap-4 text-gray-600 sm:grid-cols-2">
                <p>
                  <span className="font-medium">{t("potassium")}:</span>{" "}
                  {mealPlan.hemodialysisLimits?.potassium || 2000}mg
                </p>
                <p>
                  <span className="font-medium">{t("phosphorus")}:</span>{" "}
                  {mealPlan.hemodialysisLimits?.phosphorus || 800}mg
                </p>
                <p>
                  <span className="font-medium">{t("sodium")}:</span>{" "}
                  {mealPlan.hemodialysisLimits?.sodium || 2000}mg
                </p>
                <p>
                  <span className="font-medium">{t("fluid")}:</span>{" "}
                  {mealPlan.hemodialysisLimits?.fluid || 1000}ml
                </p>
              </div>
            </div>
            <h3 className="mt-6 mb-4 text-lg font-semibold text-blue-700">
              {t("your_progress")}
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
              {["carbohydrates", "proteins", "lipids", "fluid"].map((nutrient) => {
                const consumed = totalConsumed[nutrient];
                const target = totalTargets[nutrient];
                const percentage = Math.min((consumed / (target || 1)) * 100, 100);
                const isOver = consumed > target;
                return (
                  <div key={nutrient} className="text-center">
                    <div className="w-20 h-20 mx-auto">
                      <CircularProgressbar
                        value={percentage}
                        text={`${Math.round(percentage)}%`}
                        styles={buildStyles({
                          pathColor: isOver ? "#ef4444" : "#2563eb",
                          textColor: "#1f2937",
                          trailColor: "#e5e7eb",
                        })}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {t(nutrient)}: {consumed.toFixed(1)}
                      {nutrient === "fluid" ? "ml" : "g"} / {target}
                      {nutrient === "fluid" ? "ml" : "g"}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-sm text-gray-500">{t("nutrient_log_note")}</p>
          </div>
        </section>

        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
              <h3 className="mb-3 text-xl font-bold text-blue-800">
                {t(`${selectedMeal}_details`)}
              </h3>
              <div className="space-y-3">
                {recommendedFoods[selectedMeal]?.map((food, index) => (
                  <div key={index} className="p-3 rounded-lg bg-blue-50">
                    <p className="font-medium text-blue-700">
                      {food.name} - {food.quantity}g
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("carbs")}: {food.carbohydrates}g, {t("proteins")}: {food.proteins}g,{" "}
                      {t("lipids")}: {food.lipids}g
                    </p>
                  </div>
                ))}
                <div className="mt-3">
                  <h4 className="mb-2 text-base font-medium text-gray-700">
                    {t("consume_meal_question")}
                  </h4>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setTempConsumed(true)}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center ${
                        tempConsumed
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      aria-label="Mark meal as consumed"
                    >
                      <CheckCircle
                        className={`w-5 h-5 mr-1 ${
                          tempConsumed ? "text-blue-600" : "text-gray-500"
                        }`}
                      />
                      {t("yes")}
                    </button>
                    <button
                      onClick={() => setTempConsumed(false)}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center ${
                        tempConsumed === false
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      aria-label="Mark meal as not consumed"
                    >
                      <XCircle
                        className={`w-5 h-5 mr-1 ${
                          tempConsumed === false ? "text-red-600" : "text-gray-500"
                        }`}
                      />
                      {t("no")}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                  aria-label="Cancel"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={handleMealConsumption}
                  className="px-4 py-2 text-white bg-blue-700 rounded-lg hover:bg-blue-800"
                  aria-label="Submit meal consumption"
                >
                  {t("submit")}
                </button>
              </div>
            </div>
          </div>
        )}

        <section>
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4 border-b-2 border-blue-200">
              <h2 className="text-2xl font-bold text-blue-800">{t("your_food_logs")}</h2>
              <Utensils className="w-6 h-6 text-blue-600" />
            </div>
            {logs.length === 0 ? (
              <p className="flex items-center justify-center text-lg text-gray-600">
                <Utensils className="w-5 h-5 mr-2" />
                {t("no_logs")}
              </p>
            ) : (
              <ul className="space-y-3">
                {logs.map((log) => (
                  <li
                    key={log._id}
                    className="p-3 transition-colors rounded-lg bg-blue-50 hover:bg-blue-100"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">
                        {log.foodItem} - {log.quantity} {log.isFluid ? "ml" : "g"} (
                        {t("carbs")}: {log.carbohydrates || 0}g, {t("proteins")}:{" "}
                        {log.proteins || 0}g, {t("lipids")}: {log.lipids || 0}g, K:{" "}
                        {log.potassium || 0}mg, P: {log.phosphorus || 0}mg, Na:{" "}
                        {log.sodium || 0}mg)
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