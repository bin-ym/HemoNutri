import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  console.log('ProtectedRoute: Checking access', { user, allowedRoles, loading });

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 border-4 border-teal-600 rounded-full border-t-transparent animate-spin"></div>
          <p className="text-lg text-teal-700">Loading...</p>
        </div>
      </div>
    );
  }

  // Check for token and user
  if (!token || !user) {
    console.log('ProtectedRoute: No token or user, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  // Check for allowed roles
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log('ProtectedRoute: Role not allowed, redirecting to /');
    return <Navigate to="/" replace />;
  }

  // If authorized, render the child component
  return children;
};

export default ProtectedRoute;