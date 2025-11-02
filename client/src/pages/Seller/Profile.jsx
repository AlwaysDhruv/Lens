import React, { useState, useEffect } from "react";
import api from "../../services/api";
import "./Profile.css";

export default function Profile() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await api.get("/auth/profile");
      setForm(res.data);
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      const res = await api.put("/auth/update-details", form);
      alert("✅ Profile updated");
      setForm(res.data.user);
    } catch (err) {
      console.error("Update failed:", err);
      alert("❌ Update failed");
    }
  }

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="profile-page">
      <h2>My Profile</h2>

      <form onSubmit={handleSave} className="profile-form">
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <label>Email (cannot change)</label>
        <input value={form.email} disabled />

        <label>Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} />

        <label>Address</label>
        <textarea name="address" value={form.address} onChange={handleChange} rows="3" />

        <button type="submit" className="btn-save">Save Changes</button>
      </form>
    </div>
  );
}
