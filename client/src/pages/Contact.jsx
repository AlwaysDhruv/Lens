import React, { useState } from "react";
import api from "../services/api";
import "./FormPages.css"; // shared styles for form pages

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/contact", form);
    alert("Message sent!");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="form-page no-header">
      <form className="form-card" onSubmit={submit}>
        <h2 className="form-title">Contact Us</h2>
        <p className="form-subtitle">
          We’d love to hear from you! Send us a quick message below 👋
        </p>

        <div className="input-group">
          <label>Name</label>
          <input
            placeholder="Your Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

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
          <label>Message</label>
          <textarea
            placeholder="Write your message..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
          />
        </div>

        <button type="submit" className="form-btn">
          Send Message
        </button>
      </form>
    </div>
  );
}
