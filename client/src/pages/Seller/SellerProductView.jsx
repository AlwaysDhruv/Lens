// client/src/pages/Seller/SellerProductView.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./SellerProductView.css";

export default function SellerProductView() {
  const { id } = useParams();
  const nav = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await api.put(`/products/${id}`, product);
      alert("✅ Product updated successfully!");
      nav("/seller/products");
    } catch (err) {
      console.error("Failed to update:", err);
      alert("❌ Failed to update product");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="seller-product-view">
      <div className="product-view-header">
        <h2>Edit Product</h2>
        <button className="btn-back" onClick={() => nav(-1)}>
          ← Back
        </button>
      </div>

      <div className="product-view-container">
        <div className="product-view-image">
          <img
            src={product.imageUrl || "/placeholder.jpg"}
            alt={product.name}
          />
        </div>

        <div className="product-view-info">
          <label>Name:</label>
          <input name="name" value={product.name} onChange={handleChange} />

          <label>Price (₹):</label>
          <input
            name="price"
            type="number"
            value={product.price}
            onChange={handleChange}
          />

          <label>Description:</label>
          <textarea
            name="description"
            rows="4"
            value={product.description}
            onChange={handleChange}
          />

          <button className="btn-save" onClick={handleSave}>
            💾 Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
