import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const token = localStorage.getItem("token");

  console.log("ProtectedRoute: Checking access", {
    user: user ? { role: user.role, email: user.email } : null,
    isAuthenticated,
    allowedRoles,
    loading,
    token: token?.slice(0, 10) + "...",
  });

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

  if (!token || !isAuthenticated) {
    console.log("ProtectedRoute: No token or not authenticated, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    console.log("ProtectedRoute: Role not allowed, redirecting to /", { userRole: user.role, allowedRoles });
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;