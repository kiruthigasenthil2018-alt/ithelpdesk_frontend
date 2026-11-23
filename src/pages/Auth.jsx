import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { Logo } from "../Icons.jsx";
import { ErrorBox } from "../ui.jsx";

export default function AuthPage({ mode }) {
  const isLogin = mode === "login";
  const { user, ready, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (ready && user) return <Navigate to={location.state?.from || "/"} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <div className="stage auth-stage">
      <form className="auth-card" onSubmit={submit}>
        <Logo />
        <h2>{isLogin ? "Sign in to IT Helpdesk" : "Create your account"}</h2>
        <p className="muted">{isLogin ? "Use your work email." : "Password: 10+ characters with letters and digits."}</p>
        <ErrorBox message={error} />
        {!isLogin && (<label>Full name<input required minLength={2} value={form.name} onChange={set("name")} autoComplete="name" /></label>)}
        <label>Email<input type="email" required value={form.email} onChange={set("email")} autoComplete="email" /></label>
        <label>Password
          <div className="pw">
            <input type={show ? "text" : "password"} required value={form.password} onChange={set("password")} minLength={isLogin ? 1 : 10}
              autoComplete={isLogin ? "current-password" : "new-password"} />
            <button type="button" className="btn small" onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button>
          </div>
        </label>
        <button className="btn primary" disabled={busy}>{busy ? "Please wait…" : isLogin ? "Sign in" : "Create account"}</button>
        <p className="muted center">
          {isLogin ? <>No account? <Link to="/register">Register</Link></> : <>Already registered? <Link to="/login">Sign in</Link></>}
        </p>
      </form>
    </div>
  );
}
