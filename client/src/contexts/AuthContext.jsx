import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await authAPI.getProfile();
        setUser(response.data.user);
      }
    } catch (error) {
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log("Attempting login with:", { email, password: "***" });
      const response = await authAPI.login({ email, password });
      console.log("Login response:", response);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      setUser(user);
      toast.success("Login successful!");
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      console.log("Attempting registration with:", {
        ...userData,
        password: "***",
      });
      const response = await authAPI.register(userData);
      console.log("Registration response:", response);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      setUser(user);
      toast.success("Registration successful!");
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast.success("Logged out successfully");
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      setUser(response.data.user);
      toast.success("Profile updated successfully!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Profile update failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const adminLogin = async (email, password, adminKey) => {
    try {
      console.log("Attempting admin login with:", {
        email,
        password: "***",
        adminKey: adminKey ? "***" : "none",
      });
      const response = await authAPI.adminLogin({ email, password, adminKey });
      console.log("Admin login response:", response);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      setUser(user);
      toast.success("Admin login successful!");
      return { success: true };
    } catch (error) {
      console.error("Admin login error:", error);
      const message = error.response?.data?.message || "Admin login failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    login,
    adminLogin,
    register,
    logout,
    updateProfile,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
