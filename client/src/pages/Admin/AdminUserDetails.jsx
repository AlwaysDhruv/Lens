// src/pages/admin/AdminUserDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AdminUserDetails.css";

export default function AdminUserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");

  const rawId = (val) => {
    if (!val) return null;
    if (typeof val === "string") return val;
    if (val._id) return val._id.toString();
    return String(val);
  };

  // Load user data
  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      try {
        const res = await api.get(`/admin/users/${id}`);
        setUser(res.data);
      } catch {
        const all = await api.get("/users").catch(() => ({ data: [] }));
        const u = all.data.find((x) => rawId(x._id) === id);
        if (!u) return setError("User not found");
        setUser(u);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [id]);

  // Load all products
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await api.get("/admin/products");
        setAllProducts(Array.isArray(res.data) ? res.data : []);
      } catch {
        const res2 = await api.get("/products").catch(() => ({ data: [] }));
        setAllProducts(Array.isArray(res2.data) ? res2.data : []);
      }
    }
    loadProducts();
  }, []);

  if (loading) return <div className="admin-user-details"><p>Loading…</p></div>;
  if (error) return <div className="admin-user-details"><p style={{ color: "red" }}>{error}</p></div>;
  if (!user) return null;

  // Filter products that belong to this seller
  const sellerProducts = allProducts.filter(
    (p) => rawId(p.seller?._id || p.seller) === rawId(user._id)
  );

  return (
    <div className="admin-user-details">
      <div className="details-header">
        <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>
        <h2>{user.name}</h2>
        <small className="muted">{user.email}</small>
      </div>

      <section className="panel user-info-panel">
        <h3>User Info</h3>
        <p><strong>Role:</strong> {user.role}</p>
        {user.createdAt && <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleString()}</p>}
        {user._id && <p><strong>ID:</strong> {user._id}</p>}
        {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
        {user.address && <p><strong>Address:</strong> {user.address}</p>}
      </section>

      {user.role === "seller" && user.store && (
        <section className="panel store-panel">
          <h3>Store</h3>
          <p><strong>Name:</strong> {user.store.name}</p>
          {user.store.description && <p><strong>Description:</strong> {user.store.description}</p>}
          {user.store.type && <p><strong>Type:</strong> {user.store.type}</p>}
          {user.store.address && <p><strong>Address:</strong> {user.store.address}</p>}
          <p><strong>Total Products:</strong> {sellerProducts.length}</p>
          {Array.isArray(user.store.categories) && user.store.categories.length > 0 && (
            <p><strong>Categories:</strong> {user.store.categories.join(", ")}</p>
          )}
        </section>
      )}

{user.role === "seller" && (
  <section className="panel products-panel">
    <h3>Products ({sellerProducts.length})</h3>

    {/* === FILTER + SORT UI === */}
    <div className="product-controls">
      <input
        type="text"
        placeholder="Search product by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="control-input"
      />

      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="control-select"
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

    {/* Filter & sort logic */}
    {sellerProducts.length === 0 && <p>No products added yet.</p>}

    {sellerProducts.length > 0 && (
      <table className="product-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Price (₹)</th>
            <th>Stock</th>
            <th>Store</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {sellerProducts
            .filter((p) =>
              p.name.toLowerCase().includes(search.toLowerCase())
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
            })
            .map((p) => (
              <tr key={p._id}>
                <td>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="table-thumb" />
                  ) : (
                    <div className="table-thumb placeholder">{p.name?.[0] || "P"}</div>
                  )}
                </td>
                <td>{p.name}</td>
                <td>{p.price ?? "—"}</td>
                <td>{p.stock ?? "—"}</td>
                <td>{p.store?.name ?? "—"}</td>
                <td>
                  <button
                    className="btn-small"
                    onClick={() => navigate(`/admin/products/${p._id}`)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    )}
  </section>
)}
      )}
    </div>
  );
}
