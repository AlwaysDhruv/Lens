import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminProducts.css";
import { useNavigate } from "react-router-dom";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");

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

  // === FILTER PRODUCTS ===
  const filtered = products
    .filter((p) =>
      p.name?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      switch (sort) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return (a.price || 0) - (b.price || 0);
        case "price-desc":
          return (b.price || 0) - (a.price || 0);
        case "stock-asc":
          return (a.stock || 0) - (b.stock || 0);
        case "stock-desc":
          return (b.stock || 0) - (a.stock || 0);
        default:
          return 0;
      }
    });

  return (
    <div className="admin-products">
      <div className="admin-products-header">
        <h2>All Products</h2>

        {/* === FILTER + SORT BAR === */}
        <div className="products-controls">
          <input
            type="text"
            className="control-input"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="control-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="">Sort By</option>
            <option value="name-asc">Name (A → Z)</option>
            <option value="name-desc">Name (Z → A)</option>
            <option value="price-asc">Price (Low → High)</option>
            <option value="price-desc">Price (High → Low)</option>
            <option value="stock-asc">Stock (Low → High)</option>
            <option value="stock-desc">Stock (High → Low)</option>
          </select>
        </div>
      </div>

      <div className="admin-products-grid">
        {filtered.length ? (
          filtered.map((p) => (
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
                  {p.buyers?.length ? (
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
            No matching products found.
          </p>
        )}
      </div>
    </div>
  );
}
