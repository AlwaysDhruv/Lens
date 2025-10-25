import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminProducts.css";
import { useNavigate } from "react-router-dom";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await api.get("/admin/products");
        setProducts(res.data);
      } catch (err) {
        console.error("Error loading products:", err);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="admin-products">
      <div className="admin-products-header">
        <h2>All Products</h2>
      </div>

      <div className="admin-products-grid">
        {products.length ? (
          products.map((p) => (
            <div className="product-card" key={p._id}>
              <img
                src={p.imageUrl || "/placeholder.jpg"}
                alt={p.name}
                className="product-image"
              />

              <div className="product-content">
                <div className="product-header">
                  <h3>{p.name}</h3>
                  <span className="price">₹{p.price}</span>
                </div>

                <div className="product-meta">
                  <p>
                    <strong>Seller:</strong> {p.seller?.name || "Unknown"}
                    <br />
                    <strong>Store:</strong> {p.store?.name || "N/A"}
                  </p>
                </div>

                <div className="product-buyers">
                  <strong>Buyers:</strong>
                  {p.buyers.length ? (
                    p.buyers.map((b, i) => (
                      <div key={i} className="buyer-item">
                        {b.name} ({b.email})
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#777" }}>No buyers yet</p>
                  )}
                </div>

                <div className="product-actions">
                  <button
                    className="btn-view"
                    onClick={() => nav(`/admin/products/${p._id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", color: "#666" }}>
            No products found.
          </p>
        )}
      </div>
    </div>
  );
}
