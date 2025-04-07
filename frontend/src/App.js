import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Public Pages
import HomePage from './pages/Public/HomePage';
import AboutPage from './pages/Public/AboutPage';
import LoginPage from './pages/Public/LoginPage';
import RegisterPage from './pages/Public/RegisterPage';
import ChangePassword from './pages/Public/ChangePassword';
import ContactPage from './pages/Public/ContactPage';
import ForgotPasswordPage from './pages/Public/ForgotPasswordPage';
import ResetPasswordPage from './pages/Public/ResetPasswordPage';

// Patient Pages
import PatientDashboard from './pages/Patient/PatientDashboard';
import PatientEducation from './pages/Patient/PatientEducation';
import FoodLogsPage from './pages/Patient/FoodLogsPage';
import MealPlanPage from './pages/Patient/MealPlanPage';
import PatientMessagesPage from './pages/Patient/PatientMessagesPage';

// Provider Pages
import ProviderPage from './pages/Provider/ProviderPage';
import ProviderPatientsPage from './pages/Provider/ProviderPatientsPage';
import ProviderLogsPage from './pages/Provider/ProviderLogsPage';
import ProviderMessagesPage from './pages/Provider/ProviderMessagesPage';
import ProviderMealPlansPage from './pages/Provider/ProviderMealPlansPage';
import ProviderPatientDetailPage from './pages/Provider/ProviderPatientDetailPage';
import ProviderEducation from './pages/Provider/ProviderEducation';

// Admin Pages
import AdminPage from './pages/Admin/AdminPage';
import AdminUsersPage from './pages/Admin/AdminUsersPage';
import AdminResourcesPage from './pages/Admin/AdminResourcesPage';
import AdminReportPage from './pages/Admin/AdminReportPage';

// Optional 404 Component
const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <h1 className="text-4xl font-bold text-teal-700">404 - Page Not Found</h1>
    <p className="mt-4 text-lg text-gray-600">Sorry, the page you’re looking for doesn’t exist.</p>
    <button
      onClick={() => window.location.href = '/'}
      className="px-6 py-2 mt-6 text-white transition-all duration-300 bg-teal-600 rounded-lg hover:bg-teal-700"
    >
      Go Home
    </button>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/change-password" element={<ChangePassword />} />

        {/* Patient Routes */}
        <Route path="/dashboard" element={<PatientDashboard />} />
        <Route path="/education" element={<PatientEducation />} />
        <Route path="/food-logs" element={<FoodLogsPage />} />
        <Route path="/meal-plan" element={<MealPlanPage />} />
        <Route path="/messages" element={<PatientMessagesPage />} />
        {/* Optional: Add /goals if implemented */}
        <Route path="/goals" element={<NotFound />} /> {/* Placeholder until implemented */}

        {/* Provider Routes */}
        <Route path="/provider" element={<ProviderPage />} />
        <Route path="/provider/patients" element={<ProviderPatientsPage />} />
        <Route path="/provider/logs" element={<ProviderLogsPage />} />
        <Route path="/provider/messages" element={<ProviderMessagesPage />} />
        <Route path="/provider/meal-plans" element={<ProviderMealPlansPage />} />
        <Route path="/provider/patient/:id" element={<ProviderPatientDetailPage />} />
        <Route path="/provider/education" element={<ProviderEducation />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/resources" element={<AdminResourcesPage />} />
        <Route path="/admin/report" element={<AdminReportPage />} />

        {/* Catch-All Route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;