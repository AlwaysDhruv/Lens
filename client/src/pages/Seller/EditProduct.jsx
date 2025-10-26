import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./SellerProductForm.css";

export default function EditProduct() {
  const { id } = useParams();
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    stock: 1,
  });
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  // === Fetch product data for editing ===
  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await api.get(`/products/${id}`);
        const product = res.data;

        setForm({
          name: product.name || "",
          price: product.price || "",
          category: product.category?._id || "",
          description: product.description || "",
          stock: product.stock || 1,
        });

        if (product.imageUrl) setImagePreview(product.imageUrl);
      } catch (err) {
        console.error("❌ Error fetching product:", err);
        alert("Failed to load product details.");
      }
    }

    async function loadCategories() {
      try {
        const res = await api.get("/categories/my"); // Seller’s own categories
        setCategories(res.data);
      } catch (err) {
        console.error("❌ Failed to load categories:", err);
      }
    }

    loadProduct();
    loadCategories();
  }, [id]);

  // === Handle input change ===
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // === Handle image selection ===
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    if (selected) {
      setImagePreview(URL.createObjectURL(selected));
    }
  };

  // === Submit form ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => fd.append(key, val));
      if (file) fd.append("image", file);

      await api.put(`/products/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Product updated successfully!");
      nav("/seller/products");
    } catch (err) {
      console.error("❌ Update failed:", err);
      alert("Failed to update product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="seller-form-container">
      <div className="seller-form-header">
        <h2>Edit Product</h2>
        <button className="btn-back" onClick={() => nav("/seller/products")}>
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="seller-form">
        {/* === Product Name === */}
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

        {/* === Price & Stock === */}
        <div className="form-row">
          <div className="form-group">
            <label>Price (₹)</label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="0"
              required
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

        {/* === Category Dropdown === */}
        <div className="form-group">
          <label>Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* === Description === */}
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

        {/* === Current Image Preview === */}
        <div className="form-group">
          <label>Current Image</label>
          {imagePreview ? (
            <div className="image-preview-box">
              <img src={imagePreview} alt="Product Preview" />
            </div>
          ) : (
            <p style={{ color: "#888" }}>No image uploaded</p>
          )}
        </div>

        {/* === Upload New Image === */}
        <div className="form-group">
          <label>Replace Image (optional)</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        <button
          type="submit"
          className="btn-submit"
          disabled={loading}
        >
          {loading ? "Updating..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
