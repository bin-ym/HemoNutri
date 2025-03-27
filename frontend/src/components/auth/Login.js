// src/components/auth/Login.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api"; // Adjust path

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { identifier, password });
      const { token, role, isFirstLogin } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role || "patient");
      console.log("Logged in - Token:", token, "Role:", role); // Debug
      if (isFirstLogin) {
        navigate("/change-password");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
      console.error("Login error:", err.response?.data);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Email or Username"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-teal-500 text-white p-2 rounded hover:bg-teal-600"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
