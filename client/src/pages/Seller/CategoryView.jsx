import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./SellerCategoryView.css";

export default function CategoryView() {
  const { id } = useParams();
  const nav = useNavigate();

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", description: "" });

  useEffect(() => {
    loadCategory();
  }, [id]);

  async function loadCategory() {
    try {
      setLoading(true);
      const res = await api.get(`/categories/${id}`);
      setCategory(res.data);
      setEditData({
        name: res.data.name,
        description: res.data.description || "",
      });
    } catch (err) {
      console.error("❌ Error loading category:", err);
      alert("Failed to load category");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      await api.put(`/categories/${id}`, editData);
      alert("✅ Category updated successfully!");
      setEditing(false);
      loadCategory();
    } catch (err) {
      console.error("❌ Error updating category:", err);
      alert("Failed to update category");
    }
  }

  async function removeProduct(productId) {
    if (!window.confirm("Remove this product from category?")) return;
    try {
      await api.put(`/categories/${id}/remove-product`, { productId });
      loadCategory();
    } catch (err) {
      console.error("❌ Failed to remove product:", err);
    }
  }

  async function deleteCategory() {
    if (!window.confirm("⚠ Delete this category permanently?")) return;
    try {
      await api.delete(`/categories/${id}`);
      alert("🗑 Category deleted");
      nav("/seller/categories");
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert("Cannot delete category (it might still have products)");
    }
  }

  if (loading) return <p className="category-loading">Loading...</p>;
  if (!category) return <p className="category-error">Category not found.</p>;

  return (
    <div className="seller-category-view">
      <div className="category-header">
        <h2>{editing ? "Edit Category" : category.name}</h2>
        <div className="category-actions">
          {!editing ? (
            <>
              <button className="btn-edit" onClick={() => setEditing(true)}>
                ✎ Edit
              </button>
              <button className="btn-delete" onClick={deleteCategory}>
                🗑 Delete
              </button>
            </>
          ) : (
            <>
              <button className="btn-save" onClick={handleSave}>
                💾 Save
              </button>
              <button className="btn-cancel" onClick={() => setEditing(false)}>
                ✖ Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* --- Edit Form --- */}
      {editing && (
        <div className="category-edit-form">
          <label>Name</label>
          <input
            value={editData.name}
            onChange={(e) =>
              setEditData({ ...editData, name: e.target.value })
            }
          />

          <label>Description</label>
          <textarea
            rows="3"
            value={editData.description}
            onChange={(e) =>
              setEditData({ ...editData, description: e.target.value })
            }
          />
        </div>
      )}

      {/* --- Product List --- */}
      <div className="category-products">
        <h3>Products in this Category</h3>

        {category.products && category.products.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Price (₹)</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {category.products.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.price}</td>
                  <td>{p.stock}</td>
                  <td>
                    <button
                      className="btn-remove"
                      onClick={() => removeProduct(p._id)}
                    >
                      ❌ Remove
                    </button>
                    <button
                      className="btn-view"
                      onClick={() => nav(`/seller/products/${p._id}`)}
                    >
                      🔍 View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: "#777" }}>No products in this category.</p>
        )}
      </div>
    </div>
  );
}
