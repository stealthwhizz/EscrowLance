import React, { createContext, useContext, useEffect, useState } from "react";
import { getProfile } from "../services/api.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("ce_token"));
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) return;
      try {
        const profile = await getProfile(token);
        setUser(profile.user);
      } catch (err) {
        console.error("Failed to load profile", err);
        setToken(null);
        localStorage.removeItem("ce_token");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [token]);

  const value = {
    user,
    token,
    loading,
    setUser,
    login: (t, u) => {
      setToken(t);
      localStorage.setItem("ce_token", t);
      setUser(u);
    },
    logout: () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem("ce_token");
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
