import React, { useState, useEffect } from "react";
import api from "../../services/api";
import "./SellerStore.css";

export default function SellerStore() {
  const [store, setStore] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);

  // 🧩 Load seller's store
  useEffect(() => {
    async function fetchStore() {
      try {
        const res = await api.get("/stores/my");
        setStore(res.data);
        setForm({
          name: res.data.name || "",
          description: res.data.description || "",
          type: res.data.type || "",
          address: res.data.address || "",
        });
      } catch (err) {
        if (err.response?.status === 404) {
          console.warn("No store found, user can create new one.");
        } else {
          console.error("Failed to fetch store:", err);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchStore();
  }, []);

  // 🧠 Handle form inputs
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // 💾 Save or update store
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/stores", form);
      setStore(res.data);
      setEditMode(false);
      alert("✅ Store information saved!");
    } catch (err) {
      console.error("❌ Save failed:", err);
      alert("Failed to save store information");
    }
  };

  if (loading) return <p>Loading store data...</p>;

  return (
    <div className="seller-store">
      <div className="store-header">
        <h2>Your Store</h2>
        {store && !editMode && (
          <button className="btn-edit" onClick={() => setEditMode(true)}>
            ✏️ Edit
          </button>
        )}
      </div>

      {/* 🧾 Store Form */}
      {editMode || !store ? (
        <form onSubmit={handleSave} className="store-form">
          <label>Store Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label>Type</label>
          <input
            name="type"
            value={form.type}
            onChange={handleChange}
            placeholder="e.g. Optical, Sunglasses"
          />

          <label>Description</label>
          <textarea
            name="description"
            rows="3"
            value={form.description}
            onChange={handleChange}
          />

          <label>Address</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
          />

          <button type="submit" className="btn-save">
            {store ? "Save Changes" : "Create Store"}
          </button>

          {store && (
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setEditMode(false);
                setForm({
                  name: store.name,
                  description: store.description,
                  type: store.type,
                  address: store.address,
                });
              }}
            >
              Cancel
            </button>
          )}
        </form>
      ) : (
        <div className="store-details">
          <p><strong>Name:</strong> {store.name}</p>
          <p><strong>Type:</strong> {store.type}</p>
          <p><strong>Description:</strong> {store.description}</p>
          <p><strong>Address:</strong> {store.address}</p>
          <hr />
          <p><strong>Total Products:</strong> {store.totalProducts}</p>
          <p>
            <strong>Categories:</strong>{" "}
            {store.categories?.length
              ? store.categories.join(", ")
              : "No categories yet"}
          </p>
        </div>
      )}
    </div>
  );
}
