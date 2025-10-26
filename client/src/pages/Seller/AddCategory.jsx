import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import "./AddCategory.css";

export default function AddCategory() {
  const [form, setForm] = useState({ name: "", description: "", productIds: [] });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await api.get("/products/my");
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    }
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/categories", form);
      alert("✅ Category created successfully!");
      nav("/seller/categories");
    } catch (err) {
      console.error("Failed to add category:", err);
      alert("❌ Error creating category");
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (id) => {
    setForm((prev) => {
      const exists = prev.productIds.includes(id);
      return {
        ...prev,
        productIds: exists
          ? prev.productIds.filter((pid) => pid !== id)
          : [...prev.productIds, id],
      };
    });
  };

  return (
    <div className="add-category">
      <div className="category-header">
        <h2>Add New Category</h2>
        <button className="btn-back" onClick={() => nav("/seller/categories")}>
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="category-form">
        <label>Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Enter category name"
          required
        />

        <label>Description</label>
        <textarea
          rows="4"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Enter category description"
        />

        <label>Attach Products</label>
        <div className="product-list">
          {products.length ? (
            products.map((p) => (
              <label key={p._id} className="product-option">
                <input
                  type="checkbox"
                  checked={form.productIds.includes(p._id)}
                  onChange={() => toggleProduct(p._id)}
                />
                {p.name} — ₹{p.price}
              </label>
            ))
          ) : (
            <p className="no-products">No products available</p>
          )}
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? "Creating..." : "Add Category"}
        </button>
      </form>
    </div>
  );
}
