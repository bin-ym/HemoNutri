import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import {
  User,
  Utensils,
  Droplet,
  Scale,
  Clipboard,
  AlertCircle,
  Calendar,
  Save,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import localforage from "localforage";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import api from "../../services/api";
import Navbar from "../../components/Navbar";

const ProviderPatientDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [foodLogs, setFoodLogs] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [consultationDate, setConsultationDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  });
  const [consultationTime, setConsultationTime] = useState("");
  const [consultationNotes, setConsultationNotes] = useState("");

  const {
    register: registerAssessment,
    handleSubmit: handleAssessmentSubmit,
    formState: { errors: assessmentErrors },
    reset: resetAssessment,
  } = useForm();
  const {
    register: registerMealPlan,
    handleSubmit: handleMealPlanSubmit,
    formState: { errors: mealPlanErrors },
    reset: resetMealPlan,
  } = useForm();

  // Predefined time slots (8:00 AM to 5:00 PM, 30-minute intervals)
  const timeSlots = Array.from({ length: 18 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = i % 2 === 0 ? "00" : "30";
    const time = `${hour.toString().padStart(2, "0")}:${minute}`;
    return {
      value: time,
      label: new Date(`2025-05-29T${time}:00`).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    };
  });

  const foodOptions = {
    carbohydrates: [
      {
        name: "Injera",
        carbohydrates: 45,
        proteins: 5,
        lipids: 1,
        potassium: 100,
        phosphorus: 80,
        sodium: 10,
        lowSodium: true,
      },
      {
        name: "Teff Porridge",
        carbohydrates: 30,
        proteins: 6,
        lipids: 2,
        potassium: 90,
        phosphorus: 70,
        sodium: 5,
        lowSodium: true,
      },
      {
        name: "Boiled Yam",
        carbohydrates: 27,
        proteins: 1.5,
        lipids: 0.2,
        potassium: 670,
        phosphorus: 50,
        sodium: 8,
        lowSodium: true,
      },
      {
        name: "Shiro (Chickpea Flour)",
        carbohydrates: 20,
        proteins: 7,
        lipids: 2,
        potassium: 300,
        phosphorus: 100,
        sodium: 15,
        lowSodium: true,
      },
    ],
    proteins: [
      {
        name: "Lentil Stew (Misir Wot)",
        carbohydrates: 20,
        proteins: 9,
        lipids: 3,
        potassium: 350,
        phosphorus: 120,
        sodium: 30,
        lowSodium: true,
      },
      {
        name: "Fish Tibs",
        carbohydrates: 3,
        proteins: 20,
        lipids: 5,
        potassium: 400,
        phosphorus: 120,
        sodium: 50,
        lowSodium: true,
      },
      {
        name: "Egg Whites",
        carbohydrates: 0.7,
        proteins: 11,
        lipids: 0.2,
        potassium: 160,
        phosphorus: 15,
        sodium: 160,
        lowSodium: false,
      },
      {
        name: "Doro Wot (Chicken Stew)",
        carbohydrates: 5,
        proteins: 25,
        lipids: 10,
        potassium: 255,
        phosphorus: 180,
        sodium: 100,
        lowSodium: false,
      },
    ],
    lipids: [
      {
        name: "Niter Kibbeh (Butter)",
        carbohydrates: 0,
        proteins: 0,
        lipids: 90,
        potassium: 0,
        phosphorus: 0,
        sodium: 10,
        lowSodium: true,
      },
      {
        name: "Avocado",
        carbohydrates: 9,
        proteins: 2,
        lipids: 15,
        potassium: 485,
        phosphorus: 52,
        sodium: 7,
        lowSodium: true,
      },
      {
        name: "Sunflower Seeds",
        carbohydrates: 24,
        proteins: 21,
        lipids: 51,
        potassium: 645,
        phosphorus: 380,
        sodium: 9,
        lowSodium: true,
      },
      {
        name: "Flaxseed Oil",
        carbohydrates: 0,
        proteins: 0,
        lipids: 100,
        potassium: 0,
        phosphorus: 0,
        sodium: 0,
        lowSodium: true,
      },
    ],
  };

  const fluidOptions = [
    {
      name: "Water",
      fluidPerUnit: 1000,
      potassium: 0,
      phosphorus: 0,
      sodium: 0,
    },
    {
      name: "Herbal Tea (Unsweetened)",
      fluidPerUnit: 240,
      potassium: 20,
      phosphorus: 5,
      sodium: 2,
    },
    {
      name: "Clear Broth",
      fluidPerUnit: 240,
      potassium: 50,
      phosphorus: 10,
      sodium: 50,
    },
    {
      name: "Coffee (Black, Unsweetened)",
      fluidPerUnit: 240,
      potassium: 116,
      phosphorus: 7,
      sodium: 5,
    },
  ];

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        if (!token || role !== "provider") {
          throw new Error(t("login_provider"));
        }

        const [
          cachedPatient,
          cachedLogs,
          cachedAssessment,
          cachedMealPlan,
          cachedConsultations,
        ] = await Promise.all([
          localforage.getItem(`patient_${id}`),
          localforage.getItem(`food_logs_${id}`),
          localforage.getItem(`assessment_${id}`),
          localforage.getItem(`meal_plan_${id}`),
          localforage.getItem(`consultations_${id}`),
        ]);
        if (cachedPatient) setPatient(cachedPatient);
        if (cachedLogs) setFoodLogs(cachedLogs);
        if (cachedAssessment) setAssessment(cachedAssessment);
        if (cachedMealPlan) setMealPlan(cachedMealPlan);
        if (cachedConsultations) setConsultations(cachedConsultations);

        const apiCalls = [
          { name: "patient", promise: api.get(`provider/patient/${id}`) },
          {
            name: "food-logs",
            promise: api.get(`provider/patient/${id}/food-logs`),
          },
          {
            name: "assessment",
            promise: api.get(`provider/patient/${id}/assessment`),
          },
          { name: "meal-plan", promise: api.get(`provider/meal-plan/${id}`) },
          {
            name: "consultations",
            promise: api.get(`provider/consultation/${id}`),
          },
        ];

        const results = await Promise.allSettled(
          apiCalls.map((call) => call.promise)
        );
        const responses = results.map((result, index) => ({
          name: apiCalls[index].name,
          status: result.status,
          data: result.value?.data,
          error: result.reason?.response?.data?.error || result.reason?.message,
        }));

        responses.forEach(({ name, status, data, error }) => {
          console.log(`API ${name}:`, { status, data, error });
          if (status === "rejected" || error) {
            console.error(`Error in ${name}:`, error);
            if (name === "patient")
              throw new Error(error || "Patient not found");
          }
        });

        const patientRes = responses.find((r) => r.name === "patient");
        const logsRes = responses.find((r) => r.name === "food-logs");
        const assessRes = responses.find((r) => r.name === "assessment");
        const mealPlanRes = responses.find((r) => r.name === "meal-plan");
        const consultationsRes = responses.find(
          (r) => r.name === "consultations"
        );

        if (patientRes.error) throw new Error(patientRes.error);
        if (logsRes.error) console.warn(logsRes.error);
        if (assessRes.error) console.warn(assessRes.error);
        if (mealPlanRes.error) console.warn(mealPlanRes.error);
        if (consultationsRes.error) console.warn(consultationsRes.error);

        setPatient(patientRes.data);
        setFoodLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
        setAssessment(
          assessRes.data || { weight: "", height: "", dietHabits: "" }
        );
        setMealPlan(mealPlanRes.data || null);
        setConsultations(
          Array.isArray(consultationsRes.data) ? consultationsRes.data : []
        );
        setError("");

        await Promise.all([
          localforage.setItem(`patient_${id}`, patientRes.data),
          localforage.setItem(`food_logs_${id}`, logsRes.data),
          localforage.setItem(
            `assessment_${id}`,
            assessRes.data || { weight: "", height: "", dietHabits: "" }
          ),
          localforage.setItem(`meal_plan_${id}`, mealPlanRes.data),
          localforage.setItem(`consultations_${id}`, consultationsRes.data),
        ]);
      } catch (err) {
        const errorMsg = err.message || t("failed_load_data");
        setError(errorMsg);
        toast.error(errorMsg);
        console.error("fetchPatientData error:", err);
        if (
          err.message.includes("Token") ||
          err.message.includes("Patient not found")
        ) {
          localStorage.clear();
          navigate("/login", { state: { message: t("session_expired") } });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, [navigate, id, t]);

  const onAssessmentSubmit = async (data) => {
    try {
      const updatedAssessment = {
        weight: parseFloat(data.weight) || null,
        height: parseFloat(data.height) || null,
        dietHabits: data.dietHabits || null,
      };
      await api.put(`provider/patient/${id}/assessment`, updatedAssessment);
      setAssessment(updatedAssessment);
      await localforage.setItem(`assessment_${id}`, updatedAssessment);
      toast.success(t("assessment_updated"));
      resetAssessment();
    } catch (err) {
      toast.error(err.response?.data?.error || t("failed_update_assessment"));
    }
  };

  const recommendIntake = (targets, limits) => {
    const { carbohydrates, proteins, lipids } = targets;
    const { fluid, potassium = 2000, phosphorus = 800, sodium = 2000 } = limits;
    const recommended = { foods: [], fluids: [] };
    let remainingCarbs = parseFloat(carbohydrates) || 0;
    let remainingProteins = parseFloat(proteins) || 0;
    let remainingLipids = parseFloat(lipids) || 0;
    let remainingFluid = parseFloat(fluid) || 0;
    const isLowSodium = assessment?.dietHabits
      ?.toLowerCase()
      .includes("low-sodium");

    const filterFoods = (foods) =>
      isLowSodium ? foods.filter((food) => food.lowSodium) : foods;

    ["carbohydrates", "proteins", "lipids"].forEach((nutrient) => {
      const options = filterFoods(foodOptions[nutrient]);
      options.forEach((food) => {
        let remainingNutrient =
          nutrient === "carbohydrates"
            ? remainingCarbs
            : nutrient === "proteins"
            ? remainingProteins
            : remainingLipids;
        if (remainingNutrient <= 0) return;
        const quantity = Math.min(
          remainingNutrient / (food[nutrient] / 100),
          500
        );
        if (
          quantity > 0 &&
          (food.potassium * quantity) / 100 <= potassium &&
          (food.phosphorus * quantity) / 100 <= phosphorus &&
          (food.sodium * quantity) / 100 <= sodium
        ) {
          recommended.foods.push({
            name: food.name,
            quantity: quantity.toFixed(1),
            carbohydrates: ((food.carbohydrates * quantity) / 100).toFixed(1),
            proteins: ((food.proteins * quantity) / 100).toFixed(1),
            lipids: ((food.lipids * quantity) / 100).toFixed(1),
            potassium: ((food.potassium * quantity) / 100).toFixed(1),
            phosphorus: ((food.phosphorus * quantity) / 100).toFixed(1),
            sodium: ((food.sodium * quantity) / 100).toFixed(1),
          });
          remainingCarbs -= (food.carbohydrates * quantity) / 100;
          remainingProteins -= (food.proteins * quantity) / 100;
          remainingLipids -= (food.lipids * quantity) / 100;
        }
      });
    });

    fluidOptions.forEach((fluid) => {
      if (remainingFluid <= 0) return;
      const units = Math.floor(remainingFluid / fluid.fluidPerUnit);
      if (
        units > 0 &&
        fluid.potassium * units <= potassium &&
        fluid.phosphorus * units <= phosphorus &&
        fluid.sodium * units <= sodium
      ) {
        recommended.fluids.push({
          name: fluid.name,
          units,
          totalFluid: (units * fluid.fluidPerUnit).toFixed(1),
          potassium: (fluid.potassium * units).toFixed(1),
          phosphorus: (fluid.phosphorus * units).toFixed(1),
          sodium: (fluid.sodium * units).toFixed(1),
        });
        remainingFluid -= units * fluid.fluidPerUnit;
      }
    });

    return recommended;
  };

  const onMealPlanSubmit = async (data) => {
    try {
      const total = {
        carbohydrates: parseFloat(data.carbohydrates),
        proteins: parseFloat(data.proteins),
        lipids: parseFloat(data.lipids),
      };
      const hemodialysisLimits = {
        fluid: parseFloat(data.fluid),
        potassium: parseFloat(data.potassium) || 2000,
        phosphorus: parseFloat(data.phosphorus) || 800,
        sodium: parseFloat(data.sodium) || 2000,
      };

      if (
        Object.values(total).some((val) => isNaN(val) || val < 0) ||
        Object.values(hemodialysisLimits).some((val) => isNaN(val) || val < 0)
      ) {
        toast.error(t("invalid_inputs"));
        return;
      }

      const recommended = recommendIntake(total, hemodialysisLimits);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mealPlanData = {
        breakfast: {
          carbohydrates: (total.carbohydrates / 3).toFixed(1),
          proteins: (total.proteins / 3).toFixed(1),
          lipids: (total.lipids / 3).toFixed(1),
        },
        lunch: {
          carbohydrates: (total.carbohydrates / 3).toFixed(1),
          proteins: (total.proteins / 3).toFixed(1),
          lipids: (total.lipids / 3).toFixed(1),
        },
        dinner: {
          carbohydrates: (total.carbohydrates / 3).toFixed(1),
          proteins: (total.proteins / 3).toFixed(1),
          lipids: (total.lipids / 3).toFixed(1),
        },
        hemodialysisLimits,
        date: today.toISOString(),
        recommendedFoods: recommended.foods,
        recommendedFluids: recommended.fluids, // Fixed: Added recommendedFluids
      };

      const response = await api.post(`provider/meal-plan/${id}`, mealPlanData);
      setMealPlan(response.data);
      await localforage.setItem(`meal_plan_${id}`, response.data);
      toast.success(t("meal_plan_updated"));
      resetMealPlan();
    } catch (err) {
      toast.error(err.response?.data?.error || t("failed_save_meal_plan"));
    }
  };

  const handleScheduleConsultation = async (e) => {
    e.preventDefault();
    if (!consultationTime) {
      toast.error(t("time_required"));
      return;
    }
    try {
      const dateTime = new Date(consultationDate);
      const [hours, minutes] = consultationTime.split(":");
      dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const now = new Date();
      if (dateTime < now) {
        toast.error(t("past_date_error"));
        return;
      }

      const response = await api.post(`provider/consultation/${id}`, {
        date: dateTime.toISOString(),
        notes: consultationNotes,
      });
      setConsultations([...consultations, response.data]);
      await localforage.setItem(`consultations_${id}`, [
        ...consultations,
        response.data,
      ]);
      setShowCalendar(false);
      setConsultationTime("");
      setConsultationNotes("");
      toast.success(t("consultation_scheduled"));
    } catch (err) {
      toast.error(
        err.response?.data?.error || t("failed_schedule_consultation")
      );
    }
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

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen font-sans bg-gray-100">
        <Navbar role="provider" />
        <div className="flex items-center justify-center flex-grow">
          <div className="relative w-24 h-24 animate-fadeIn">
            <lottie-player
              src="https://assets.lottiefiles.com/packages/lf20_jcikwtux.json"
              background="transparent"
              speed="1"
              loop
              autoplay
            ></lottie-player>
            <p className="mt-4 text-lg font-semibold text-blue-700">
              {t("loading")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !patient) {
    return (
      <div className="flex flex-col min-h-screen font-sans bg-gray-100">
        <Navbar role="provider" />
        <div className="flex items-center justify-center flex-grow">
          <div className="max-w-md p-6 bg-white rounded-lg shadow-lg animate-card-enter">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-100">
      <Toaster position="top-right" />
      <Navbar role="provider" />
      <div className="flex-grow max-w-6xl p-6 mx-auto">
        <div className="relative mb-12 text-center animate-fadeIn">
          <div className="absolute inset-0 h-32 bg-gradient-to-r from-blue-200 to-blue-300 rounded-b-3xl -top-8 opacity-30 blur-2xl"></div>
          <h1 className="relative text-4xl font-extrabold text-blue-800 md:text-5xl">
            {t("patient_details", {
              username: patient?.username || t("unknown"),
            })}
          </h1>
          <p className="relative max-w-2xl mx-auto mt-2 text-lg text-gray-700">
            {t("manage_patient")}
          </p>
          <button
            onClick={() => navigate("/provider/patients")}
            className="px-6 py-2 mt-4 text-white transition-all bg-blue-700 rounded-lg hover:bg-blue-900"
            aria-label={t("back_to_patients")}
          >
            {t("back_to_patients")}
          </button>
        </div>

        <Tabs className="space-y-8">
          <TabList className="flex space-x-4 border-b-2 border-blue-200 animate-slide-down">
            <Tab
              className="px-4 py-2 font-semibold text-blue-700 rounded-t-lg cursor-pointer hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              selectedClassName="bg-blue-100 text-blue-900 border-b-4 border-blue-800"
            >
              {t("profile")}
            </Tab>
            <Tab
              className="px-4 py-2 font-semibold text-blue-700 rounded-t-lg cursor-pointer hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              selectedClassName="bg-blue-100 text-blue-900 border-b-4 border-blue-800"
            >
              {t("food_logs")}
            </Tab>
            <Tab
              className="px-4 py-2 font-semibold text-blue-700 rounded-t-lg cursor-pointer hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              selectedClassName="bg-blue-100 text-blue-900 border-b-4 border-blue-800"
            >
              {t("assessment")}
            </Tab>
            <Tab
              className="px-4 py-2 font-semibold text-blue-700 rounded-t-lg cursor-pointer hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              selectedClassName="bg-blue-100 text-blue-900 border-b-4 border-blue-800"
            >
              {t("meal_plan")}
            </Tab>
            <Tab
              className="px-4 py-2 font-semibold text-blue-700 rounded-t-lg cursor-pointer hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              selectedClassName="bg-blue-100 text-blue-900 border-b-4 border-blue-800"
            >
              {t("consultations")}
            </Tab>
          </TabList>

          <TabPanel>
            <section className="p-6 bg-white rounded-lg shadow-lg animate-card-enter">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold text-blue-800">
                  {t("profile")}
                </h2>
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="font-semibold text-gray-700">{t("name")}:</p>
                  <p className="text-gray-800">
                    {patient?.username || t("unknown")}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">{t("email")}:</p>
                  <p className="text-gray-800">
                    {patient?.email || t("unknown")}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">
                    {t("medical_history")}:
                  </p>
                  <ul className="text-gray-800">
                    <li>
                      {t("weight")}:{" "}
                      {assessment?.weight
                        ? `${assessment.weight} kg`
                        : t("not_available")}
                    </li>
                    <li>
                      {t("height")}:{" "}
                      {assessment?.height
                        ? `${assessment.height} cm`
                        : t("not_available")}
                    </li>
                    <li>
                      {t("diet_habits")}:{" "}
                      {assessment?.dietHabits || t("not_available")}
                    </li>
                  </ul>
                </div>
                <div>
                  <button
                    onClick={() => {
                      console.log(
                        "Opening calendar modal, showCalendar:",
                        true
                      );
                      setShowCalendar(true);
                    }}
                    className="flex items-center px-6 py-2 text-white transition-all bg-blue-700 rounded-lg hover:bg-blue-900"
                    aria-label={t("schedule_consultation")}
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    {t("schedule_consultation")}
                  </button>
                </div>
              </div>
            </section>
          </TabPanel>

          <TabPanel>
            <section className="p-6 bg-white rounded-lg shadow-lg animate-card-enter">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold text-blue-800">
                  {t("food_logs")}
                </h2>
                <Utensils className="w-6 h-6 text-blue-600" />
              </div>
              {foodLogs.length === 0 ? (
                <p className="flex items-center text-lg text-gray-600">
                  <Utensils className="w-6 h-6 mr-2" /> {t("no_logs")}
                </p>
              ) : (
                <ul className="space-y-4">
                  {foodLogs.map((log) => (
                    <li
                      key={log._id}
                      className="p-4 transition-all rounded-lg bg-blue-50 hover:bg-blue-100"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-800">
                          {log.foodItem} - {log.quantity}{" "}
                          {log.isFluid ? "ml" : "g"} ({t("carbs")}:{" "}
                          {log.carbohydrates ?? 0}g, {t("proteins")}:{" "}
                          {log.proteins ?? 0}g, {t("lipids")}: {log.lipids ?? 0}
                          g, K: {log.potassium ?? 0}mg, P: {log.phosphorus ?? 0}
                          mg, Na: {log.sodium ?? 0}mg)
                        </span>
                        <span className="flex items-center text-sm text-gray-600">
                          <Clipboard className="w-4 h-4 mr-1" />
                          {formatDate(log.date)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </TabPanel>

          <TabPanel>
            <section className="p-6 bg-white rounded-lg shadow-lg animate-card-enter">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold text-blue-800">
                  {t("assessment")}
                </h2>
                <Scale className="w-6 h-6 text-blue-600" />
              </div>
              <form
                onSubmit={handleAssessmentSubmit(onAssessmentSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      {t("weight")} (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      {...registerAssessment("weight", {
                        required: t("required_field"),
                        min: { value: 0, message: t("negative_value") },
                      })}
                      placeholder={t("weight")}
                      className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-offset-2 focus:ring-offset-gray-100"
                      aria-describedby="weight-error"
                    />
                    <span className="sr-only" id="weight-error">
                      {t("weight")}
                    </span>
                    {assessmentErrors.weight && (
                      <p className="mt-1 text-sm text-red-500">
                        {assessmentErrors.weight.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      {t("height")} (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      {...registerAssessment("height", {
                        required: t("required_field"),
                        min: { value: 0, message: t("negative_value") },
                      })}
                      placeholder={t("height")}
                      className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      aria-describedby="height-error"
                    />
                    <span className="sr-only" id="height-error">
                      {t("height")}
                    </span>
                    {assessmentErrors.height && (
                      <p className="mt-1 text-sm text-red-500">
                        {assessmentErrors.height.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      {t("diet_habits")}
                    </label>
                    <input
                      type="text"
                      {...registerAssessment("dietHabits")}
                      placeholder={t("diet_habits")}
                      className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      aria-describedby="diet-habits-error"
                    />
                    <span id="diet-habits-error" className="sr-only">
                      {t("diet_habits")}
                    </span>
                  </div>
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center w-full p-4 text-white bg-blue-600 rounded-lg hover:bg-blue-800"
                  aria-label={t("save_assessment")}
                >
                  <Save className="w-5 h-5 mr-2" />
                  {t("save_assessment")}
                </button>
              </form>
            </section>
          </TabPanel>

          <TabPanel>
            <section className="p-6 bg-white rounded-lg shadow-lg animate-card-enter">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold text-blue-800">
                  {t("meal_plan")}
                </h2>
                <Utensils className="w-6 h-6 text-blue-600" />
              </div>
              <form
                onSubmit={handleMealPlanSubmit(onMealPlanSubmit)}
                className="space-y-6"
              >
                <div>
                  <h3 className="mb-4 text-xl font-semibold text-blue-700">
                    {t("daily_targets")}
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-blue-700">
                        {t("carbs")} (g)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        {...registerMealPlan("carbohydrates", {
                          required: t("required_field"),
                          min: { value: 0, message: t("negative_value") },
                        })}
                        placeholder={t("carbs")}
                        className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        aria-describedby="carbs-error"
                      />
                      <span className="sr-only" id="carbs-error">
                        {t("carbs")}
                      </span>
                      {mealPlanErrors.carbohydrates && (
                        <p className="mt-1 text-sm text-red-500">
                          {mealPlanErrors.carbohydrates.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-blue-700">
                        {t("proteins")} (g)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        {...registerMealPlan("proteins", {
                          required: t("required_field"),
                          min: { value: 0, message: t("negative_value") },
                        })}
                        placeholder={t("proteins")}
                        className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        aria-describedby="proteins-error"
                      />
                      <span className="sr-only" id="proteins-error">
                        {t("proteins")}
                      </span>
                      {mealPlanErrors.proteins && (
                        <p className="mt-1 text-sm text-red-500">
                          {mealPlanErrors.proteins.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-blue-700">
                        {t("lipids")} (g)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        {...registerMealPlan("lipids", {
                          required: t("required_field"),
                          min: { value: 0, message: t("negative_value") },
                        })}
                        placeholder={t("lipids")}
                        className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        aria-describedby="lipids-error"
                      />
                      <span className="sr-only" id="lipids-error">
                        {t("lipids")}
                      </span>
                      {mealPlanErrors.lipids && (
                        <p className="mt-1 text-sm text-red-500">
                          {mealPlanErrors.lipids.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="mb-4 text-xl font-semibold text-blue-700">
                    {t("hemo_limits")}
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-blue-700">
                        {t("fluid")} (ml)
                      </label>
                      <input
                        type="number"
                        step="1"
                        {...registerMealPlan("fluid", {
                          required: t("required_field"),
                          min: { value: 0, message: t("negative_value") },
                        })}
                        placeholder={t("fluid")}
                        className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        aria-describedby="fluid-error"
                      />
                      <span className="sr-only" id="fluid-error">
                        {t("fluid")}
                      </span>
                      {mealPlanErrors.fluid && (
                        <p className="mt-1 text-sm text-red-500">
                          {mealPlanErrors.fluid.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-blue-700">
                        {t("potassium")} (mg)
                      </label>
                      <input
                        type="number"
                        step="1"
                        {...registerMealPlan("potassium")}
                        placeholder={t("potassium")}
                        className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        aria-describedby="potassium-error"
                      />
                      <span className="sr-only" id="potassium-error">
                        {t("potassium")}
                      </span>
                      {mealPlanErrors.potassium && (
                        <p className="mt-1 text-sm text-red-500">
                          {mealPlanErrors.potassium.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-blue-700">
                        {t("phosphorus")} (mg)
                      </label>
                      <input
                        type="number"
                        step="1"
                        {...registerMealPlan("phosphorus")}
                        placeholder={t("phosphorus")}
                        className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        aria-describedby="phosphorus-error"
                      />
                      <span className="sr-only" id="phosphorus-error">
                        {t("phosphorus")}
                      </span>
                      {mealPlanErrors.phosphorus && (
                        <p className="mt-1 text-sm text-red-500">
                          {mealPlanErrors.phosphorus.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-blue-700">
                        {t("sodium")} (mg)
                      </label>
                      <input
                        type="number"
                        step="1"
                        {...registerMealPlan("sodium")}
                        placeholder={t("sodium")}
                        className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        aria-describedby="sodium-error"
                      />
                      <span className="sr-only" id="sodium-error">
                        {t("sodium")}
                      </span>
                      {mealPlanErrors.sodium && (
                        <p className="mt-1 text-sm text-red-500">
                          {mealPlanErrors.sodium.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center w-full p-3 text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-800"
                  aria-label={t("save_meal_plan")}
                >
                  <Save className="w-5 h-5 mr-2" />
                  {t("save_meal_plan")}
                </button>
              </form>
              {mealPlan && (
                <div className="mt-8">
                  <h3 className="mb-4 text-xl font-semibold text-blue-700">
                    {t("recommended")}
                  </h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <h4 className="flex items-center mb-2 text-lg font-medium text-gray-600">
                        <Utensils className="w-5 h-5 mr-2 text-blue-600" />{" "}
                        {t("foods")}
                      </h4>
                      {Array.isArray(mealPlan.recommendedFoods) &&
                      mealPlan.recommendedFoods.length > 0 ? (
                        <ul className="space-y-2">
                          {mealPlan.recommendedFoods.map((food, index) => (
                            <li
                              key={index}
                              className="p-3 bg-white border rounded-md border-blue-200"
                            >
                              <span className="text-gray-800">
                                {food.name} - {food.quantity}g ({t("carbs")}:{" "}
                                {food.carbohydrates}g, {t("proteins")}:{" "}
                                {food.proteins}g,
                                {t("lipids")}: {food.lipids}g, K:{" "}
                                {food.potassium}mg, P: {food.phosphorus}mg, Na:{" "}
                                {food.sodium}mg)
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600">
                          {t("no_recommendations")}
                        </p>
                      )}
                    </div>
                    <div>
                      <h4 className="flex items-center mb-2 text-lg font-medium text-gray-600">
                        <Droplet className="w-5 h-5 mr-2 text-blue-600" />{" "}
                        {t("fluids")}
                      </h4>
                      {Array.isArray(mealPlan.recommendedFluids) &&
                      mealPlan.recommendedFluids.length > 0 ? (
                        <ul className="space-y-2">
                          {mealPlan.recommendedFluids.map((fluid, index) => (
                            <li
                              key={index}
                              className="p-3 bg-white border rounded-md border-blue-200"
                            >
                              <span className="text-gray-800">
                                {fluid.name} - {fluid.units}{" "}
                                {fluid.name === "Water" ? "liters" : "cups"} (
                                {fluid.totalFluid}ml, K: {fluid.potassium}mg, P:{" "}
                                {fluid.phosphorus}mg, Na: {fluid.sodium}mg)
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600">
                          {t("no_recommendations")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </TabPanel>

          <TabPanel>
            <section className="p-6 bg-white rounded-lg shadow-lg animate-card-enter">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold text-blue-800">
                  {t("consultations")}
                </h2>
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              {consultations.length === 0 ? (
                <p className="flex items-center text-lg text-gray-600">
                  <Calendar className="w-6 h-6 mr-2" /> {t("no_consultations")}
                </p>
              ) : (
                <ul className="space-y-4">
                  {consultations.map((consultation) => (
                    <li
                      key={consultation._id}
                      className="p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-800">
                          {t("consultation")} - {formatDate(consultation.date)}{" "}
                          ({t(consultation.status)})
                        </span>
                        {consultation.notes && (
                          <span className="text-sm text-gray-600">
                            {t("notes")}: {consultation.notes}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </TabPanel>
        </Tabs>

        {showCalendar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full transition-all duration-300">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4">
                {t("schedule_consultation")}
              </h3>
              <div className="mb-6">
                <ReactCalendar
                  onChange={(date) => {
                    console.log("Selected date:", date.toISOString());
                    setConsultationDate(date);
                  }}
                  value={consultationDate}
                  minDate={(() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(0, 0, 0, 0);
                    return tomorrow;
                  })()}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="mb-6">
                <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t("select_time")}
                </label>
                <select
                  value={consultationTime}
                  onChange={(e) => setConsultationTime(e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-colors duration-200"
                  required
                >
                  <option value="" disabled>
                    {t("select_time")}
                  </option>
                  {timeSlots.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t("notes")}
                </label>
                <textarea
                  value={consultationNotes}
                  onChange={(e) => setConsultationNotes(e.target.value)}
                  placeholder={t("enter_notes")}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none resize-none h-24 transition-colors"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    console.log("Closing calendar modal");
                    setShowCalendar(false);
                  }}
                  className="px-5 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={handleScheduleConsultation}
                  className="px-5 py-2 text-white font-semibold bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 transition-colors"
                >
                  {t("schedule")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderPatientDetailPage;