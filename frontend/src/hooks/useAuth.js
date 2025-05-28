import { useState, useEffect } from "react";
   import api from "../services/api";

   const useAuth = () => {
     const [user, setUser] = useState(null);
     const [loading, setLoading] = useState(true);
     const [isAuthenticated, setIsAuthenticated] = useState(false);

     const validateSession = async () => {
       const token = localStorage.getItem("token");
       const role = localStorage.getItem("role");
       const userId = localStorage.getItem("userId");
       console.log("useAuth: Validating session", { tokenExists: !!token, role, userId });

       if (!token || !role || !userId) {
         setUser(null);
         setIsAuthenticated(false);
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
         setIsAuthenticated(true);
         localStorage.setItem("role", userData.role); // Sync role
         return userData;
       } catch (err) {
         console.error("useAuth: Profile fetch failed", err.message);
         if (err.response?.status === 404 || err.response?.status === 401) {
           console.log("useAuth: Using localStorage data");
           setUser({
             email: "unknown",
             role,
             userId,
             token,
           });
           setIsAuthenticated(true); // Assume authenticated if using fallback
         } else {
           setUser(null);
           setIsAuthenticated(false);
         }
         throw err;
       } finally {
         setLoading(false);
         console.log("useAuth: Loading set to false");
       }
     };

     useEffect(() => {
       let timeoutId;
       const verifyToken = async () => {
         const token = localStorage.getItem("token");
         console.log("useAuth: Token before verify request", { token: token || "No token" });
         if (!token) {
           setUser(null);
           setIsAuthenticated(false);
           setLoading(false);
           return;
         }
         try {
           await api.get("auth/verify");
           console.log("useAuth: Token verified");
           await validateSession();
         } catch (err) {
           console.error("useAuth: Token verification failed", err.message);
           setUser(null);
           setIsAuthenticated(false);
           setLoading(false);
         }
       };

       const debounceVerify = () => {
         clearTimeout(timeoutId);
         timeoutId = setTimeout(verifyToken, 300);
       };

       debounceVerify();

       const handleStorageChange = () => debounceVerify();
       window.addEventListener("storage", handleStorageChange);
       window.addEventListener("focus", handleStorageChange);

       return () => {
         clearTimeout(timeoutId);
         window.removeEventListener("storage", handleStorageChange);
         window.removeEventListener("focus", handleStorageChange);
       };
     }, []);

     return { user, loading, isAuthenticated, validateSession };
   };

   export default useAuth;