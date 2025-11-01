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
  const [allProducts, setAllProducts] = useState([]);
  const [attachMode, setAttachMode] = useState(false);

  useEffect(() => {
    loadCategory();
    fetchAllProducts();
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
      console.error("Error loading category:", err);
      alert("Failed to load category");
    } finally {
      setLoading(false);
    }
  }

  async function fetchAllProducts() {
    try {
      const res = await api.get("/products/my");
      setAllProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  }

  async function handleSave() {
    try {
      await api.put(`/categories/${id}`, editData);
      alert("✅ Category updated successfully!");
      setEditing(false);
      loadCategory();
    } catch (err) {
      console.error("Error updating category:", err);
      alert("Failed to update category");
    }
  }

async function removeProduct(productId) {
    if (!window.confirm("Remove this product from this category? (This will not delete the product)")) return;
    
    try {
      // This calls the product update route and sets its category to null
      await api.put(`/products/${productId}`, { category: null });
      // Reload the category to see the product disappear from the list
      loadCategory();
      // Also reload the list of all products for the "Attach" panel
      fetchAllProducts();
    } catch (err) {
      console.error("Failed to remove product:", err);
      alert("❌ Failed to remove product.");
    }
  }
  
  async function deleteCategory() {
    if (!window.confirm("⚠ Delete this category permanently?")) return;
    try {
      await api.delete(`/categories/${id}`);
      alert("🗑 Category deleted");
      nav("/seller/categories");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Cannot delete category (it might still have products)");
    }
  }

  async function attachProduct(productId) {
    try {
      await api.put(`/products/${productId}`, { category: id });
      await loadCategory();
      alert("✅ Product attached!");
    } catch (err) {
      console.error("Attach failed:", err);
      alert("❌ Failed to attach product.");
    }
  }

  if (loading) return <p className="category-loading">Loading...</p>;
  if (!category) return <p className="category-error">Category not found.</p>;

  // Products that are not already in this category
  const availableProducts = allProducts.filter(
    (p) => !category.products.find((cp) => cp._id === p._id)
  );

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
              <button className="btn-attach" onClick={() => setAttachMode(!attachMode)}>
                📎 Attach Product
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

      {/* Edit Form */}
      {editing && (
        <div className="category-edit-form">
          <label>Name</label>
          <input
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
          />

          <label>Description</label>
          <textarea
            rows="3"
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
          />
        </div>
      )}

      {/* Attach Product Panel */}
      {attachMode && (
        <div className="attach-panel">
          <h3>Attach a Product</h3>
          {availableProducts.length > 0 ? (
            availableProducts.map((p) => (
              <div key={p._id} className="attach-row">
                <span>
                  {p.name} — ₹{p.price}
                </span>
                <button
                  className="btn-attach-now"
                  onClick={() => attachProduct(p._id)}
                >
                  ➕ Attach
                </button>
              </div>
            ))
          ) : (
            <p style={{ color: "#888" }}>All your products are already in this category.</p>
          )}
        </div>
      )}

      {/* Product Table */}
      <div className="category-products">
        <h3>Products in this Category</h3>
        {category.products && category.products.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {category.products.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>₹{p.price}</td>
                  <td>{p.stock}</td>
                  <td>
                    <button className="btn-remove" onClick={() => removeProduct(p._id)}>
                      ❌ Remove
                    </button>
                    <button
                      className="btn-view"
                      onClick={() => nav(`/seller/products/${p._id}/edit`)}
                    >
                      🔍 View/Edit
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
