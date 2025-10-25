import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register() {
  const { register } = useContext(AuthContext);
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    await register(form);
    nav("/login");
  };

  return (
    <div className="register-page no-header">
      <form className="register-card" onSubmit={submit}>
        <h2 className="register-title">Create Account</h2>
        <p className="register-subtitle">Join Lens Gallery today 👓</p>

        {/* Name */}
        <div className="input-group">
          <label>Name</label>
          <input
            placeholder="Your Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        {/* Email */}
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

        {/* Password */}
        <div className="input-group">
          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <span
              className="eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="input-group">
          <label>Confirm Password</label>
          <div className="password-wrapper">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              required
            />
            <span
              className="eye-btn"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? "🙈" : "👁️"}
            </span>
          </div>
        </div>

        {/* Role Dropdown */}
        <div className="input-group select-wrapper">
          <label>Role</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            required
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="rider">Rider</option>
          </select>
        </div>

        {/* Register Button */}
        <button className="register-btn">Register</button>

        {/* Footer */}
        <p className="register-footer">
          Have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
