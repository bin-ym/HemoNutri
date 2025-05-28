import { useState, useEffect } from "react";
import api from "../services/api";

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const validateSession = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");
    console.log("useAuth: Validating session", { tokenExists: !!token, role, userId });

    if (!token || !role || !userId) {
      console.log("useAuth: No auth data, skipping profile fetch");
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const response = await api.get("auth/profile");
      console.log("useAuth: Profile fetched", response.data);
      const userData = {
        ...response.data,
        token,
        role: response.data.role || role,
        userId,
      };
      setUser(userData);
      localStorage.setItem("role", userData.role);
      return userData;
    } catch (err) {
      console.error("useAuth: Profile fetch failed", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      if (err.response?.status === 401) {
        console.log("useAuth: Unauthorized, clearing auth data");
        localStorage.clear();
        setUser(null);
      } else if (err.response?.status === 404) {
        console.log("useAuth: Using localStorage data");
        setUser({
          email: "unknown",
          role,
          userId,
          token,
        });
      } else {
        setUser(null);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("useAuth: No token, skipping verification");
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        await api.get("auth/verify");
        console.log("useAuth: Token verified");
        await validateSession();
      } catch (err) {
        console.error("useAuth: Token verification failed", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        localStorage.clear();
        setUser(null);
        setLoading(false);
      }
    };

    verifyToken();

    const handleStorageChange = () => verifyToken();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, []);

  return { user, loading, validateSession };
};

export default useAuth;