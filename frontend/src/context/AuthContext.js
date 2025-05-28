// frontend/src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshUser = async (retry = true) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");
    console.log("AuthContext: Refreshing user", { token: token?.slice(0, 10) + "...", role, userId });

    if (!token || !role || !userId) {
      console.log("AuthContext: Missing auth data");
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return null;
    }

    try {
      console.log("AuthContext: Starting profile fetch");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await api.get("/auth/profile", {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      console.log("AuthContext: Profile fetch completed", {
        status: response.status,
        data: response.data,
      });

      const userData = {
        ...response.data,
        token,
        role: response.data.role || role,
        userId,
      };
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem("role", userData.role);
      console.log("AuthContext: User refreshed:", { email: userData.email, role: userData.role });
      return userData;
    } catch (err) {
      console.error("AuthContext: Refresh error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });

      if (err.name === "AbortError") {
        console.log("AuthContext: Fetch canceled due to timeout");
        localStorage.clear();
        setUser(null);
        setIsAuthenticated(false);
        throw new Error("request_canceled");
      }

      if (err.response?.status === 401) {
        console.log("AuthContext: 401, handling error", { error: err.response.data?.error });
        if (retry && err.response.data?.error !== "token_expired") {
          console.log("AuthContext: Retrying once");
          return refreshUser(false);
        }
        console.log("AuthContext: Clearing auth due to 401");
        localStorage.clear();
        setUser(null);
        setIsAuthenticated(false);
      } else if (err.response?.status === 404) {
        console.log("AuthContext: 404, using localStorage fallback");
        setUser({ email: "unknown", role, userId, token });
        setIsAuthenticated(true);
      }
      throw err;
    } finally {
      setLoading(false);
      console.log("AuthContext: Loading set to false");
    }
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchUser = async () => {
      try {
        if (isMounted) {
          await refreshUser();
        }
      } catch (err) {
        if (isMounted) {
          console.log("AuthContext: Initial refresh failed", err.message);
        }
      }
    };

    fetchUser();

    const handleRevalidate = () => {
      if (isMounted) refreshUser();
    };
    window.addEventListener("focus", handleRevalidate);
    window.addEventListener("storage", handleRevalidate);

    return () => {
      isMounted = false;
      controller.abort();
      window.removeEventListener("focus", handleRevalidate);
      window.removeEventListener("storage", handleRevalidate);
      console.log("AuthContext: Cleanup useEffect");
    };
  }, []);

  const login = async (identifier, password) => {
    try {
      console.log("AuthContext: Login called with:", identifier);
      const response = await api.post("/auth/login", { identifier, password });
      console.log("AuthContext: Login response:", response.data);
      const { token, role, userId, isFirstLogin, isTempPassword, resetToken, needsProviderSelection, providers, user: userData } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", userId);
      const fullUserData = {
        ...userData,
        token,
        role,
        userId,
      };
      setUser(fullUserData);
      setIsAuthenticated(true);
      console.log("AuthContext: User set after login:", { email: fullUserData.email, role: fullUserData.role });
      return { token, role, userId, isFirstLogin, isTempPassword, resetToken, needsProviderSelection, providers };
    } catch (err) {
      console.error("AuthContext: Login error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      throw err;
    }
  };

  const logout = () => {
    console.log("AuthContext: Logging out");
    localStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);