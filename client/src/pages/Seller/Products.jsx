import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import "./SellerProducts.css";

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const nav = useNavigate();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await api.get("/products/my");
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    }
    fetchProducts();
  }, []);

  // --- delete product ---
  const del = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Failed to delete product");
    }
  };

  // --- sorting logic ---
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sorted = [...products]
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const dir = sortOrder === "asc" ? 1 : -1;
      if (a[sortField] < b[sortField]) return -1 * dir;
      if (a[sortField] > b[sortField]) return 1 * dir;
      return 0;
    });

  return (
    <div className="seller-products">
      <div className="seller-products-header">
        <h2>Your Products</h2>
        <div className="seller-products-controls">
          <input
            type="text"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
          </select>

          <button className="btn-new" onClick={() => nav("/seller/new")}>
            + Add Product
          </button>
        </div>
      </div>

      <div className="seller-products-grid">
        {sorted.length ? (
          sorted.map((p) => (
            <div key={p._id} className="product-card">
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

                <p className="product-desc">
                  {p.description?.slice(0, 70) || "No description provided."}
                </p>

                <div className="product-actions">
                  <button
                    className="btn-view"
                    onClick={() => nav(`/seller/products/${p._id}/edit`)}
                  >
                    ✎ Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => del(p._id)}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p
            style={{
              textAlign: "center",
              color: "var(--text-color)",
              opacity: 0.7,
            }}
          >
            No products found.
          </p>
        )}
      </div>
    </div>
  );
}
