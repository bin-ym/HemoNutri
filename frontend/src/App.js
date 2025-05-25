import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useAuth from "./hooks/useAuth";
import Navbar from "./components/Navbar"; // Import Navbar

// Components
import ProtectedRoute from "./components/ProtectedRoute";

// Public Pages
import HomePage from "./pages/Public/HomePage";
import AboutPage from "./pages/Public/AboutPage";
import LoginPage from "./pages/Public/LoginPage";
import RegisterPage from "./pages/Public/RegisterPage";
import ChangePassword from "./pages/Public/ChangePassword";
import ContactPage from "./pages/Public/ContactPage";
import ForgotPasswordPage from "./pages/Public/ForgotPasswordPage";
import ResetPasswordPage from "./pages/Public/ResetPasswordPage";
import ActivationPage from "./pages/Public/ActivationPage";
import SelectProvider from "./components/auth/SelectProvider";
import Footer from "./pages/Public/Footer";

// Patient Pages
import PatientDashboard from "./pages/Patient/PatientDashboard";
import PatientEducation from "./pages/Patient/PatientEducation";
import FoodLogsPage from "./pages/Patient/FoodLogsPage";
import MealPlanPage from "./pages/Patient/MealPlanPage";
import PatientMessagesPage from "./pages/Patient/PatientMessagesPage";

// Provider Pages
import ProviderPage from "./pages/Provider/ProviderPage";
import ProviderPatientsPage from "./pages/Provider/ProviderPatientsPage";
// import ProviderLogsPage from "./pages/Provider/ProviderLogsPage";
import ProviderMessagesPage from "./pages/Provider/ProviderMessagesPage";
// import ProviderMealPlansPage from "./pages/Provider/ProviderMealPlansPage";
import ProviderPatientDetailPage from "./pages/Provider/ProviderPatientDetailPage";
import ProviderEducation from "./pages/Provider/ProviderEducation";

// Admin Pages
import AdminPage from "./pages/Admin/AdminPage";
import AdminUsersPage from "./pages/Admin/AdminUsersPage";
import AdminResourcesPage from "./pages/Admin/AdminResourcesPage";
import AdminReportPage from "./pages/Admin/AdminReportPage";
import AdminBackupPage from "./pages/Admin/AdminBackupPage";

// Profile Page
import ProfilePage from "./pages/Public/ProfilePage";

import "./assets/css/main.css";

// 404 Component
const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-gray-100">
    <h1 className="text-3xl font-bold text-teal-700 sm:text-4xl md:text-5xl">404 - Page Not Found</h1>
    <p className="mt-4 text-base text-center text-gray-600 sm:text-lg md:text-xl">
      Sorry, the page you’re looking for doesn’t exist.
    </p>
    <button
      onClick={() => (window.location.href = "/")}
      className="px-4 py-2 mt-6 text-sm text-white transition-all duration-300 bg-teal-600 rounded-lg sm:text-base hover:bg-teal-700 sm:px-6 sm:py-3"
    >
      Go Home
    </button>
  </div>
);

function App() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user && user.isFirstLogin && user.needsProviderSelection) {
      navigate("/select-provider", {
        state: { providers: user.providers, userId: user.userId },
      });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen">

      {/* Main Content */}
      <main className="flex-grow">
        <Routes>
          {/* Public Routes (No Protection Needed) */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/activate" element={<ActivationPage />} />
          <Route path="/select-provider" element={<SelectProvider />} />

          {/* Profile Route (Protected, All Roles) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["patient", "provider", "admin"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Patient Routes (Protected, Only 'patient' Role) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/education"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <PatientEducation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/food-logs"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <FoodLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meal-plan"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <MealPlanPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <PatientMessagesPage />
              </ProtectedRoute>
            }
          />

          {/* Provider Routes (Protected, Only 'provider' Role) */}
          <Route
            path="/provider"
            element={
              <ProtectedRoute allowedRoles={["provider"]}>
                <ProviderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/patients"
            element={
              <ProtectedRoute allowedRoles={["provider"]}>
                <ProviderPatientsPage />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/provider/logs"
            element={
              <ProtectedRoute allowedRoles={["provider"]}>
                <ProviderLogsPage />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/provider/messages"
            element={
              <ProtectedRoute allowedRoles={["provider"]}>
                <ProviderMessagesPage />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/provider/meal-plans"
            element={
              <ProtectedRoute allowedRoles={["provider"]}>
                <ProviderMealPlansPage />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/provider/patient/:id"
            element={
              <ProtectedRoute allowedRoles={["provider"]}>
                <ProviderPatientDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/education"
            element={
              <ProtectedRoute allowedRoles={["provider"]}>
                <ProviderEducation />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes (Protected, Only 'admin' Role) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/resources"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminResourcesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/report"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/backup"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminBackupPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-All Route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;