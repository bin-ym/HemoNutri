import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const login = async (identifier, password) => {
    try {
      const response = await api.post("/auth/login", { identifier, password });
      console.log("AuthContext: Login response", response.data);
      return response.data;
    } catch (err) {
      console.error("AuthContext: Login error", err);
      throw err;
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");
    console.log("AuthContext: Refreshing user", {
      token: token?.slice(0, 10) + "...",
      role,
      userId,
    });

    if (!token || !role || !userId) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      console.log("AuthContext: Starting profile fetch");
      const response = await api.get("auth/profile");
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
      console.log("AuthContext: User refreshed", {
        email: userData.email,
        role: userData.role,
      });
    } catch (err) {
      console.error("AuthContext: Profile fetch error", err.message);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
      console.log("AuthContext: Loading set to false");
    }
  };

  useEffect(() => {
    refreshUser();
    return () => {
      console.log("AuthContext: Cleanup useEffect");
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);