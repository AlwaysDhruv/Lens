import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./SellerCategories.css";

export default function SellerCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      // --- THIS IS THE FIX ---
      // Fetch from the protected seller-only route
      const res = await api.get("/categories/seller");
      // ---------------------
      setCategories(res.data);
    } catch (err) {
      console.error("❌ Failed to load categories:", err);
      alert("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  async function deleteCategory(id) {
    if (!window.confirm("⚠ Delete this category permanently?")) return;
    try {
      // This will now send a valid ObjectId
      await api.delete(`/categories/${id}`);
      alert("🗑 Category deleted");
      loadCategories();
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert("Cannot delete category (it might still have products)");
    }
  }

  if (loading) return <p className="categories-loading">Loading...</p>;

  return (
    <div className="seller-categories-page">
      <div className="categories-header">
        <h2>📦 Categories</h2>
        <button
          className="btn-new-category"
          onClick={() => nav("/seller/categories/new")}
        >
          ➕ New Category
        </button>
      </div>

      {categories.length === 0 ? (
        <p className="no-category">No categories found.</p>
      ) : (
        <table className="categories-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Products</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id}>
                <td>{cat.name}</td>
                <td className="cat-desc">
                  {cat.description ? cat.description : "—"}
                </td>
                <td>{cat.products?.length || 0}</td>
                <td className="actions">
                  <button
                    className="btn-view"
                    // This will now navigate with a valid ObjectId
                    onClick={() => nav(`/seller/categories/${cat._id}`)}
                  >
                    ✎ Edit
                  </button>
                  <button
                    className="btn-delete"
                    // This will now delete with a valid ObjectId
                    onClick={() => deleteCategory(cat._id)}
                  >
                    🗑 Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}