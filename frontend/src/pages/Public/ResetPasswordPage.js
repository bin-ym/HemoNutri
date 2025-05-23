import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../../services/api";
import Navbar from "../../components/Navbar";

const ResetPasswordPage = () => {
  const [tempPassword, setTempPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "", color: "" });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
      setTimeout(() => navigate("/login"), 3000);
    }
  }, [token, navigate]);

  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[@$!%*?&]/.test(password)) score += 1;

    if (score <= 2) {
      return { score: score * 20, label: "Weak", color: "bg-red-500" };
    } else if (score <= 4) {
      return { score: score * 20, label: "Medium", color: "bg-yellow-500" };
    } else {
      return { score: 100, label: "Strong", color: "bg-green-500" };
    }
  };

  useEffect(() => {
    if (newPassword) {
      setPasswordStrength(calculatePasswordStrength(newPassword));
    } else {
      setPasswordStrength({ score: 0, label: "", color: "" });
    }
  }, [newPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError(
        "New password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character"
      );
      return;
    }

    try {
      const res = await api.post("/auth/reset-password", {
        token,
        tempPassword,
        newPassword,
      });
      setMessage(res.data.message || "Password reset successfully.");
      const { role } = res.data;
      setTimeout(() => {
        navigate(
          role === "admin"
            ? "/admin"
            : role === "provider"
            ? "/provider"
            : "/dashboard"
        );
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar role={null} />
      <div className="flex items-center justify-center flex-grow">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md animate-fade-in">
          <h2 className="mb-6 text-2xl font-bold text-center text-blue-600">
            Reset Password
          </h2>
          {message && (
            <p className="mb-4 text-center text-green-500">{message}</p>
          )}
          {error && <p className="mb-4 text-center text-red-500">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">
                Temporary Password
              </label>
              <input
                type={showTempPassword ? "text" : "password"}
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter temporary password"
              />
              <button
                type="button"
                onClick={() => setShowTempPassword(!showTempPassword)}
                className="absolute right-2 top-8 text-blue-400 hover:text-blue-600"
                aria-label={showTempPassword ? "Hide temporary password" : "Show temporary password"}
              >
                {showTempPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2 top-8 text-blue-400 hover:text-blue-600"
                aria-label={showNewPassword ? "Hide passwords" : "Show passwords"}
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="text-sm text-blue-600 mt-1">
              Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 special character (e.g., @$!%*?&).
            </div>
            {newPassword && (
              <div className="mt-2">
                <div className="text-sm font-medium text-gray-700">
                  Password Strength: <span className={`text-${passwordStrength.color.replace('bg-', '')}`}>{passwordStrength.label}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${passwordStrength.score}%` }}
                  ></div>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type={showNewPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm new password"
              />
            </div>
            <button
              type="submit"
              className="w-full p-2 text-white transition duration-300 bg-blue-500 rounded hover:bg-blue-600"
            >
              Reset Password
            </button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate("/login")}
              className="w-full p-2 text-blue-600 transition duration-300 bg-blue-100 rounded hover:bg-blue-200"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;