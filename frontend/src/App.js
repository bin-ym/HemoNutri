import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EducationPage from './pages/EducationPage';
import ProviderPage from './pages/ProviderPage';
import AdminPage from './pages/AdminPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminResourcesPage from './pages/AdminResourcesPage';
import AdminReportPage from './pages/AdminReportPage';
import ChangePassword from './pages/ChangePassword';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/education" element={<EducationPage />} />
        <Route path="/provider" element={<ProviderPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/resources" element={<AdminResourcesPage />} />
        <Route path="/admin/report" element={<AdminReportPage />} />
        <Route path="/change-password" element={<ChangePassword />} />
      </Routes>
    </Router>
  );
}

export default App;