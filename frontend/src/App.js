import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
// import Navbar from './components/Navbar';
import Footer from './pages/Public/Footer';
import HomePage from './pages/Public/HomePage';
import LoginPage from './pages/Public/LoginPage';
import ChangePassword from './pages/Public/ChangePassword';
import ForgotPasswordPage from './pages/Public/ForgotPasswordPage';
import ResetPasswordPage from './pages/Public/ResetPasswordPage';
import ActivationPage from './pages/Public/ActivationPage';
import SelectProvider from './components/auth/SelectProvider';
import Notifications from "./components/Notifications";
import PatientDashboard from './pages/Patient/PatientDashboard';
import PatientEducation from './pages/Patient/PatientEducation';
import FoodLogsPage from './pages/Patient/FoodLogsPage';
import MealPlanPage from './pages/Patient/MealPlanPage';
import PatientMessagesPage from './pages/Patient/PatientMessagesPage';
import ProviderPage from './pages/Provider/ProviderPage';
import ProviderPatientsPage from './pages/Provider/ProviderPatientsPage';
import ProviderMessagesPage from './pages/Provider/ProviderMessagesPage';
import ProviderPatientDetailPage from './pages/Provider/ProviderPatientDetailPage';
import ProviderEducation from './pages/Provider/ProviderEducation';
import AdminPage from './pages/Admin/AdminPage';
import AdminUsersPage from './pages/Admin/AdminUsersPage';
import AdminResourcesPage from './pages/Admin/AdminResourcesPage';
import AdminReportPage from './pages/Admin/AdminReportPage';
import AdminBackupPage from './pages/Admin/AdminBackupPage';
import ProfilePage from './pages/Public/ProfilePage';
import './assets/css/main.css';

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-600 sm:text-4xl md:text-5xl">{t('not_found')}</h1>
      <p className="mt-2 text-base text-center text-gray-700 sm:text-lg md:text-xl">
        {t('page_not_found')}
      </p>
      <button
        onClick={() => (window.location.href = '/')}
        className="px-4 py-2 mt-6 text-sm font-semibold text-white bg-blue-600 rounded-lg sm:text-base hover:bg-blue-700 sm:px-6 sm:py-3"
      >
        {t('go_home')}
      </button>
    </div>
  );
};

function App() {
  const { t } = useTranslation();
  const { user, loading, roleName: role } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold text-gray-700 animate-pulse">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* <Navbar role={role} /> */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/activate" element={<ActivationPage />} />
          <Route path="/select-provider" element={<SelectProvider />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['patient', 'provider', 'admin']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/education"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientEducation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/food-logs"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <FoodLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meal-plan"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <MealPlanPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientMessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider"
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/patients"
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderPatientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/messages"
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderMessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/patient/:id"
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderPatientDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/notifications"
            element={
              <ProtectedRoute Notifications role={['patient']}>
                <AdminBackupPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/education"
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderEducation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/notifications"
            element={
              <ProtectedRoute Notifications role={['provider']}>
                <AdminBackupPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/resources"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminResourcesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/report"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/backup"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminBackupPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;