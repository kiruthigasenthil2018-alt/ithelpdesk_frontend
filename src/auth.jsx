import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { api, getToken, setToken, setUnauthorizedHandler } from "./api.js";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(() => { setToken(null); setUser(null); }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    if (!getToken()) return setReady(true);
    api.me().then(setUser).catch(() => setToken(null)).finally(() => setReady(true));
  }, [logout]);

  const finish = (res) => { setToken(res.access_token); setUser(res.user); return res.user; };
  const login = async (email, password) => finish(await api.login(email, password));
  const register = async (name, email, password) => finish(await api.register(name, email, password));

  return <AuthCtx.Provider value={{ user, ready, login, register, logout }}>{children}</AuthCtx.Provider>;
}

export const isStaff = (user) => user && ["agent", "admin"].includes(user.role);

/** Redirects to /login when signed out; shows a message when the role is not allowed. */
export function RequireAuth({ roles, children }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <div className="splash">Loading…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) {
    return <div className="notice"><h3>No access</h3><p>Your role ({user.role}) cannot open this page.</p></div>;
  }
  return children;
}
