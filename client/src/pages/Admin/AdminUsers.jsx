import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AdminUsers.css";

/**
 * AdminUsers.jsx
 * - Loads /users, /stores and /products
 * - Merges store -> seller and products -> seller on the client
 * - Includes Refresh button and fixed `navigate` usage
 */

export default function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState("name");
  const [selectedUser, setSelectedUser] = useState(null); // For "More" modal
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // small util: get raw id from either string or object {_id: ...}
  const rawId = (val) => {
    if (!val) return null;
    if (typeof val === "string") return val;
    if (val._id) return val._id.toString();
    return String(val);
  };

  // pull the load logic out so it can be reused by Refresh button
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to fetch in parallel. Some endpoints might be admin-only; handle errors.
      const userPromise = api.get("/users").catch((e) => {
        console.warn("Failed to fetch /users:", e?.message || e);
        return { data: [] };
      });
      const storesPromise = api.get("/stores").catch((e) => {
        console.warn("Failed to fetch /stores:", e?.message || e);
        return { data: [] };
      });

      // products route might be under admin or public - try both
      const productsPromise = api.get("/products").catch(async (firstErr) => {
        console.warn("/products failed, trying /admin/products ...", firstErr?.message || firstErr);
        try {
          return await api.get("/admin/products");
        } catch (secondErr) {
          console.warn("Both /products and /admin/products failed:", secondErr?.message || secondErr);
          return { data: [] };
        }
      });

      const [usersRes, storesRes, productsRes] = await Promise.all([
        userPromise,
        storesPromise,
        productsPromise,
      ]);

      const usersData = Array.isArray(usersRes.data) ? usersRes.data : [];
      const storesData = Array.isArray(storesRes.data) ? storesRes.data : [];
      const productsData = Array.isArray(productsRes.data) ? productsRes.data : [];

      // Build maps for quick lookups
      const storesByOwner = {};
      storesData.forEach((s) => {
        const ownerId = rawId(s.owner);
        if (!ownerId) return;
        storesByOwner[ownerId] = s;
      });

      const productsBySeller = {};
      productsData.forEach((p) => {
        const sellerId = rawId(p.seller);
        if (!sellerId) return;
        if (!productsBySeller[sellerId]) productsBySeller[sellerId] = [];
        productsBySeller[sellerId].push(p);
      });

      // Merge: for each user, attach store (if not already present) and products
      const mergedUsers = usersData.map((u) => {
        const copy = { ...u };
        const uid = rawId(u._id);

        // If user already has store populated from /users, keep it; else try to attach from storesByOwner
        if (!copy.store && storesByOwner[uid]) {
          copy.store = storesByOwner[uid];
        }

        // Attach products array (either existing or from productsBySeller)
        if (!Array.isArray(copy.products) || copy.products.length === 0) {
          copy.products = productsBySeller[uid] || [];
        }

        // If store exists but totalProducts is missing, fill it using products length
        if (copy.store && (copy.store.totalProducts === undefined || copy.store.totalProducts === null)) {
          copy.store.totalProducts = copy.products.length;
        }

        return copy;
      });

      setUsers(mergedUsers);
    } catch (err) {
      console.error("Error loading admin users/stores/products:", err);
      setError("Failed to load users data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]); // run once on mount (and when callback identity changes)

  // Filter users based on search
  const filteredUsers = users.filter((u) => {
    const field = searchField === "role" ? u.role : (u[searchField] ?? "");
    return field.toString().toLowerCase().includes(search.toLowerCase());
  });

  // Helper to create initials for avatars
  const getInitials = (name = "") => {
    const parts = name.trim().split(/\s+/);
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name[0]?.toUpperCase() || "?";
  };

  // Format date nicely
  const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : "—");

  return (
    <div className="admin-users">
      {/* --- Header --- */}
      <div className="admin-users-header">
        <h2>All Users</h2>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div className="admin-users-search">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              aria-label="Search field"
            >
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="role">Role</option>
            </select>

            <input
              type="text"
              placeholder={`Search by ${searchField}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search input"
            />
          </div>

          <button className="btn-small" onClick={() => loadAll()} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* --- Loading / Error --- */}
      {loading && <p style={{ textAlign: "center" }}>Loading users…</p>}
      {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}

      {/* --- User Cards Grid --- */}
      <div className="admin-users-content">
        {!loading && filteredUsers.length === 0 && (
          <p style={{ textAlign: "center", color: "#888", width: "100%" }}>
            No matching users found.
          </p>
        )}

        {filteredUsers.map((u) => {
          const isSeller = u.role === "seller";
          const storeName = u.store?.name || "";
          const productCount = Array.isArray(u.products) ? u.products.length : 0;

          return (
            <div key={u._id} className="user-card">
              <div className="user-card-header">
                <div className="user-avatar">{getInitials(u.name)}</div>

                <div className="user-info">
                  <h4>{u.name}</h4>
                  <span className="user-email">{u.email}</span>

                  {isSeller && storeName && (
                    <div className="store-inline">
                      <small className="store-name">{storeName}</small>
                      <small className="product-count">
                        • {productCount} product{productCount !== 1 ? "s" : ""}
                      </small>
                    </div>
                  )}
                </div>
              </div>

              <span className={`role-badge ${u.role}`}>{u.role}</span>

              <div className="user-actions">
                {/* navigate to admin user details page */}
                <button
                  className="btn-small"
                  onClick={() => navigate(`/admin/users/${u._id}`)}
                >
                  ⋯ More
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- User Details Modal (kept as a quick-preview; page now primary) --- */}
      {selectedUser && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedUser(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()} // prevent closing on inner click
          >
            <h3>User Details</h3>

            <div className="user-details">
              <p>
                <strong>Name:</strong> {selectedUser.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <p>
                <strong>Role:</strong> {selectedUser.role}
              </p>

              {selectedUser.createdAt && (
                <p>
                  <strong>Joined:</strong> {formatDate(selectedUser.createdAt)}
                </p>
              )}

              {selectedUser._id && (
                <p>
                  <strong>User ID:</strong> {selectedUser._id}
                </p>
              )}

              {/* Seller: store info */}
              {selectedUser.role === "seller" && selectedUser.store && (
                <div className="store-section">
                  <h4>Store</h4>
                  <p>
                    <strong>Name:</strong> {selectedUser.store.name}
                  </p>
                  {selectedUser.store.description && (
                    <p>
                      <strong>Description:</strong>{" "}
                      {selectedUser.store.description}
                    </p>
                  )}
                  {selectedUser.store.address && (
                    <p>
                      <strong>Address:</strong> {selectedUser.store.address}
                    </p>
                  )}
                  {Array.isArray(selectedUser.store.categories) &&
                    selectedUser.store.categories.length > 0 && (
                      <p>
                        <strong>Categories:</strong>{" "}
                        {selectedUser.store.categories.join(", ")}
                      </p>
                    )}

                  {"totalProducts" in (selectedUser.store || {}) && (
                    <p>
                      <strong>Total Products (store):</strong>{" "}
                      {selectedUser.store.totalProducts}
                    </p>
                  )}
                </div>
              )}

              {/* Seller: product list */}
              {selectedUser.role === "seller" && Array.isArray(selectedUser.products) && (
                <div className="seller-products">
                  <h4>Products ({selectedUser.products.length})</h4>

                  {selectedUser.products.length ? (
                    <ul className="product-list">
                      {selectedUser.products.map((p) => (
                        <li key={p._id} className="product-item">
                          <div className="product-left">
                            {p.imageUrl ? (
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="small-thumb"
                              />
                            ) : (
                              <div className="small-thumb placeholder">
                                {p.name?.[0] ?? "P"}
                              </div>
                            )}
                          </div>

                          <div className="product-right">
                            <div className="product-name">{p.name}</div>

                            <div className="product-meta">
                              <span>Price: {p.price ?? "—"}</span>{" "}
                              <span>Stock: {p.stock ?? "—"}</span>{" "}
                              {p.store && p.store.name && (
                                <span>Store: {p.store.name}</span>
                              )}
                            </div>

                            {p.createdAt && (
                              <div className="product-created">
                                <small>Added: {formatDate(p.createdAt)}</small>
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ color: "#666" }}>No products for this seller.</p>
                  )}
                </div>
              )}
            </div>

            <div className="modal-buttons">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
