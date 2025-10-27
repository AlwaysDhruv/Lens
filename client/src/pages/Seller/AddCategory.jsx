import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import "./AddCategory.css";

export default function AddCategory() {
  const [form, setForm] = useState({ name: "", description: "", productIds: [] });
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
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
    if (!form.name.trim()) return alert("Please enter a category name.");

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

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="add-category">
      <div className="category-header">
        <h2>Create Category</h2>
        <button className="btn-back" onClick={() => nav("/seller/categories")}>
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="category-form">
        <label>Category Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Enter category name"
          required
        />

        <label>Description</label>
        <textarea
          rows="3"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Describe this category..."
        />

        <label>Attach Products (optional)</label>
        {products.length > 0 ? (
          <>
            <input
              type="text"
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-box"
            />

            <div className="product-list">
              {filtered.length > 0 ? (
                filtered.map((p) => (
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
                <p style={{ color: "#888" }}>No matching products found</p>
              )}
            </div>
          </>
        ) : (
          <p className="no-products">No products available yet.</p>
        )}

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? "Creating..." : "Create Category"}
        </button>
      </form>
    </div>
  );
}
