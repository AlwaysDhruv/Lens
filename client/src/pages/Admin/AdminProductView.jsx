import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AdminProductView.css";

export default function AdminProductView() {
  const { id } = useParams();
  const nav = useNavigate();
  const [product, setProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // 👈 image view state

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await api.get(`/admin/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Error loading product:", err);
      }
    }
    fetchProduct();
  }, [id]);

  if (!product) return <p style={{ marginLeft: "260px" }}>Loading...</p>;

  return (
    <div className="admin-product-view">
      <div className="product-view-header">
        <h2>Product Details</h2>
        <button className="btn-back" onClick={() => nav(-1)}>
          ← Back
        </button>
      </div>

      <div className="product-view-container">
        {/* --- Product Image Section --- */}
        <div
          className="product-view-image"
          onClick={() => setImagePreview(product.imageUrl || "/placeholder.jpg")}
        >
          <img
            src={product.imageUrl || "/placeholder.jpg"}
            alt={product.name}
          />
        </div>

        {/* --- Product Info Section --- */}
        <div className="product-view-info">
          <h3>{product.name}</h3>
          <p className="price">₹{product.price}</p>
          <p>{product.description}</p>

          <div className="info-card">
            <h4>Seller Info</h4>
            <p>
              <strong>Name:</strong> {product.seller?.name || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {product.seller?.email || "N/A"}
            </p>
          </div>

          <div className="info-card">
            <h4>Store Info</h4>
            <p>
              <strong>Store Name:</strong> {product.store?.name || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* --- Buyers Table --- */}
      <div className="buyer-list">
        <h3>Buyers</h3>
        {product.buyers.length ? (
          <table>
            <thead>
              <tr>
                <th>Buyer Name</th>
                <th>Email</th>
                <th>Purchase Date</th>
              </tr>
            </thead>
            <tbody>
              {product.buyers.map((b, i) => (
                <tr key={i}>
                  <td>{b.name}</td>
                  <td>{b.email}</td>
                  <td>{new Date(b.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ padding: "1rem", color: "#666" }}>No buyers yet.</p>
        )}
      </div>

      {/* --- Special Image View Modal --- */}
      {imagePreview && (
        <div className="image-preview-overlay" onClick={() => setImagePreview(null)}>
          <div className="image-preview-container" onClick={(e) => e.stopPropagation()}>
            <img src={imagePreview} alt="Preview" />
            <button className="btn-close" onClick={() => setImagePreview(null)}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
