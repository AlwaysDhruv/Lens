import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(form.email, form.password);

      // Redirect based on role
      if (user.role === "admin") nav("/admin/dashboard");
      else if (user.role === "seller") nav("/seller");
      else nav("/home");
    } catch (err) {
      alert("❌ Login failed — please check your credentials.");
    }
  };

  return (
    <div className="login-page no-header">
      <div className="login-card">
        <h2 className="login-title">Welcome Back 👋</h2>
        <p className="login-subtitle">Sign in to continue your journey</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <span
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>

          <div className="login-footer">
            <a href="/forgot" className="forgot-link">Forgot password?</a>
            <a href="/register" className="register-link">Create account</a>
          </div>
        </form>
      </div>
    </div>
  );
}
