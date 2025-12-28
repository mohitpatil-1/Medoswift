import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setAuthToken } from "../api.js";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("ms_token") || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthToken(token);
    (async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data } = await api.get("/api/auth/me");
        setUser(data.user);
      } catch {
        setToken("");
        localStorage.removeItem("ms_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const value = useMemo(() => ({
    token,
    user,
    loading,
    async login(email, password) {
      const { data } = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("ms_token", data.token);
      setToken(data.token);
      setAuthToken(data.token);
      setUser(data.user);
      setLoading(false);
      return data.user;
    },
    async register(payload) {
      const { data } = await api.post("/api/auth/register", payload);
      localStorage.setItem("ms_token", data.token);
      setToken(data.token);
      setAuthToken(data.token);
      setUser(data.user);
      setLoading(false);
      return data.user;
    },
    logout() {
      localStorage.removeItem("ms_token");
      setToken("");
      setUser(null);
    },
    async refreshMe() {
      const { data } = await api.get("/api/auth/me");
      setUser(data.user);
      return data.user;
    }
  }), [token, user, loading]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
