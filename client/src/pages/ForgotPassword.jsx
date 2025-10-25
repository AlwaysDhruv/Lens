import React, { useState } from "react";
import api from "../services/api";
import "./FormPages.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);

  const sendOtp = async () => {
    await api.post("/auth/forgot", { email });
    setStep(2);
  };

  const verify = async () => {
    await api.post("/auth/verify-otp", { email, otp });
    setStep(3);
  };

  const reset = async () => {
    await api.post("/auth/reset-password", { email, otp, newPassword: newPass });
    alert("Password reset successfully. Please login.");
    window.location = "/login";
  };

  return (
    <div className="form-page no-header">
      <form className="form-card" onSubmit={(e) => e.preventDefault()}>
        <h2 className="form-title">Forgot Password</h2>
        <p className="form-subtitle">
          Don’t worry! We’ll send you a verification code.
        </p>

        {step === 1 && (
          <>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button className="form-btn" onClick={sendOtp}>
              Send OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="input-group">
              <label>OTP</label>
              <input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <button className="form-btn" onClick={verify}>
              Verify OTP
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="input-group password-wrapper">
              <label>New Password</label>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Enter new password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                required
              />
              <span
                className="eye-btn"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? "🙈" : "👁️"}
              </span>
            </div>
            <button className="form-btn" onClick={reset}>
              Reset Password
            </button>
          </>
        )}
      </form>
    </div>
  );
}
