import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./SellerProductForm.css";

export default function EditProduct() {
  const { id } = useParams();
  const nav = useNavigate();

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
  const [loading, setLoading] = useState(true); // initial loading state

  // === Load product & categories on mount ===
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch product details
        const productRes = await api.get(`/products/${id}`);
        const product = productRes.data;

        // Fetch categories (so dropdown has data)
        const catRes = await api.get("/categories");
        setCategories(catRes.data);

        // Pre-fill form with product data
        setForm({
          name: product.name || "",
          price: product.price || "",
          category: product.category?._id || "", // handles optional category
          description: product.description || "",
          stock: product.stock || 1,
        });

        // Show current image if exists
        if (product.imageUrl) setImagePreview(product.imageUrl);
      } catch (err) {
        console.error("❌ Failed to load product details:", err);
        alert("Failed to load product data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  // === Handle input changes ===
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    if (selected) {
      setImagePreview(URL.createObjectURL(selected));
    }
  };

  // === Submit the edited data ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        // Skip empty category (optional)
        if (key === "category" && val === "") return;
        fd.append(key, val);
      });
      if (file) fd.append("image", file);

      await api.put(`/products/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Product updated successfully!");
      nav("/seller/products");
    } catch (err) {
      console.error("❌ Failed to update product:", err);
      alert("Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="seller-form-container">
        <p style={{ textAlign: "center", marginTop: "40px" }}>Loading product...</p>
      </div>
    );
  }

  return (
    <div className="seller-form-container">
      <div className="seller-form-header">
        <h2>Edit Product</h2>
        <button className="btn-back" onClick={() => nav("/seller/products")}>
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="seller-form">
        {/* Product Name */}
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

        {/* Price & Stock */}
        <div className="form-row">
          <div className="form-group">
            <label>Price (₹)</label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              min="0"
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

        {/* Category */}
        <div className="form-group">
          <label>Category (optional)</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option value="">Skip category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
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

        {/* Image Preview */}
        <div className="form-group">
          <label>Current Image</label>
          {imagePreview ? (
            <div className="image-preview-box">
              <img
                src={imagePreview}
                alt="Product"
                style={{
                  width: "200px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                }}
              />
            </div>
          ) : (
            <p style={{ color: "#777" }}>No image uploaded</p>
          )}
        </div>

        {/* Upload New Image */}
        <div className="form-group">
          <label>Replace Image (optional)</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? "Updating..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
