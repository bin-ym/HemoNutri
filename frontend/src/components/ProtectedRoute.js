import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // If no token exists or the user's role isn't in allowedRoles, redirect to login
  if (!token || (allowedRoles && !allowedRoles.includes(role))) {
    return <Navigate to="/login" replace />;
  }

  // If authorized, render the child component
  return children;
};

export default ProtectedRoute;