import React, { createContext, useEffect, useState } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) =>
{
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(true);

  useEffect(() =>
  {
    const initAuth = async () =>
    {
      if (token)
      {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        try
        {
          const res = await api.get("/auth/profile");
          setUser(res.data);
        }
        catch (err)
        {
          console.error("❌ Failed to fetch user profile:", err);
          if (err.response && err.response.status === 401)
          {
            localStorage.removeItem("token");
            setToken("");
            setUser(null);
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const register = async ({ name, email, password, role }) =>
  {
    try
    {
      const res = await api.post("/auth/register",
      {
        name,
        email,
        password,
        role,
      });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      return user;
    }
    catch (err)
    {
      console.error("❌ Registration failed:", err);
      throw err;
    }
  };

  const login = async (email, password) =>
  {
    const res = await api.post("/auth/login", { email, password });
    const { token, user } = res.data;
    localStorage.setItem("token", token);
    setToken(token);
    setUser(user);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    return user;
  };

  const logout = () =>
  {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};