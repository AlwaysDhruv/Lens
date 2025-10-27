import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import "./SellerProductForm.css";

export default function ProductForm() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    stock: 1,
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get("/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    }
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        // Don’t append empty category if skipped
        if (key === "category" && val === "") return;
        fd.append(key, val);
      });
      if (file) fd.append("image", file);

      await api.post("/products", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Product created successfully!");
      nav("/seller/products");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="seller-form-container">
      <div className="seller-form-header">
        <h2>Add New Product</h2>
        <button className="btn-back" onClick={() => nav("/seller/products")}>
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="seller-form">
        <div className="form-group">
          <label>Product Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter product name"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Price (₹)</label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              required
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Stock</label>
            <input
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              min="1"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Category (optional)</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option value="">Skip category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <div className="category-helper">
            <span>
              Missing a category?{" "}
              <button
                type="button"
                className="link-btn"
                onClick={() => nav("/seller/categories/new")}
              >
                ➕ Add New Category
              </button>
            </span>
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="4"
            placeholder="Describe your product..."
            required
          />
        </div>

        <div className="form-group">
          <label>Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? "Uploading..." : "Create Product"}
        </button>
      </form>
    </div>
  );
}
