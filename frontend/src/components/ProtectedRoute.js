import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const token = localStorage.getItem("token");

  console.log("ProtectedRoute: Checking access", {
    user: user ? { role: user.role, email: user.email, userId: user.userId } : null,
    isAuthenticated,
    allowedRoles,
    loading,
    token: token ? token.slice(0, 10) + "..." : "No token",
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

  if (!isAuthenticated || !token) {
    console.log("ProtectedRoute: Not authenticated or no token, redirecting to /login");
    return <Navigate to="/login?sessionExpired=true" replace />;
  }

  if (allowedRoles && (!user || !user.role || !allowedRoles.includes(user.role))) {
    console.log("ProtectedRoute: Role not allowed, redirecting to /", {
      userRole: user?.role || "none",
      allowedRoles,
    });
    return <Navigate to="/" replace />;
  }

  console.log("ProtectedRoute: Access granted", { userRole: user.role });
  return children;
};

export default ProtectedRoute;