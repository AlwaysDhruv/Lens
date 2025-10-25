// client/src/pages/Admin/AdminOrders.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminOrders.css";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchField, setSearchField] = useState("buyer");
  const [searchValue, setSearchValue] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    async function loadOrders() {
      const res = await api.get("/orders");
      setOrders(res.data);
      setFilteredOrders(res.data);
    }
    loadOrders();
  }, []);

  // === SEARCH FUNCTION ===
  useEffect(() => {
    const value = searchValue.toLowerCase();
    const filtered = orders.filter((o) => {
      if (searchField === "buyer")
        return o.buyer?.name?.toLowerCase().includes(value);
      if (searchField === "seller")
        return o.items[0]?.product?.seller?.name?.toLowerCase().includes(value);
      if (searchField === "product")
        return o.items.some((i) =>
          i.product?.name?.toLowerCase().includes(value)
        );
      if (searchField === "orderId")
        return o._id.toLowerCase().includes(value);
      return true;
    });
    setFilteredOrders(filtered);
  }, [searchField, searchValue, orders]);

  // === SORT FUNCTION ===
  const sortOrders = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";

    const sorted = [...filteredOrders].sort((a, b) => {
      const valA = getValueByKey(a, key);
      const valB = getValueByKey(b, key);

      if (typeof valA === "string" && typeof valB === "string") {
        return direction === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      if (typeof valA === "number" && typeof valB === "number") {
        return direction === "asc" ? valA - valB : valB - valA;
      }
      return 0;
    });

    setFilteredOrders(sorted);
    setSortConfig({ key, direction });
  };

  const getValueByKey = (order, key) => {
    switch (key) {
      case "buyer":
        return order.buyer?.name || "";
      case "seller":
        return order.items[0]?.product?.seller?.name || "";
      case "product":
        return order.items[0]?.product?.name || "";
      case "total":
        return order.totalAmount || 0;
      case "date":
        return new Date(order.createdAt).getTime();
      default:
        return "";
    }
  };

  return (
    <div className="admin-content">
      <div className="admin-orders-header">
        <h2>All Orders</h2>

        <div className="admin-orders-search">
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="product">Product</option>
            <option value="orderId">Order ID</option>
          </select>
          <input
            type="text"
            placeholder={`Search by ${searchField}`}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>

      {/* === ORDERS TABLE === */}
      <table className="admin-table">
        <thead>
          <tr>
            <th onClick={() => sortOrders("orderId")}>Order ID</th>
            <th onClick={() => sortOrders("buyer")}>Buyer</th>
            <th onClick={() => sortOrders("seller")}>Seller</th>
            <th onClick={() => sortOrders("product")}>Product</th>
            <th onClick={() => sortOrders("total")}>Total</th>
            <th onClick={() => sortOrders("date")}>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((o) => (
              <tr key={o._id}>
                <td data-label="Order ID">{o._id}</td>
                <td data-label="Buyer">{o.buyer?.name}</td>
                <td data-label="Seller">
                  {o.items[0]?.product?.seller?.name || "—"}
                </td>
                <td data-label="Product">
                  {o.items.map((i) => i.product?.name).join(", ")}
                </td>
                <td data-label="Total">₹{o.totalAmount}</td>
                <td data-label="Date">
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
                <td data-label="Actions">
                  <button
                    className="btn-view"
                    onClick={() => setSelectedOrder(o)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "1rem" }}>
                No matching orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* === ORDER DETAILS MODAL === */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div
            className="order-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Order Details</h3>

            <div className="order-details">
              <p>
                <strong>Order ID:</strong> {selectedOrder._id}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(selectedOrder.createdAt).toLocaleString()}
              </p>
              <p>
                <strong>Total Amount:</strong> ₹{selectedOrder.totalAmount}
              </p>

              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid var(--border-color)",
                  margin: "1rem 0",
                }}
              />

              <p>
                <strong>Buyer:</strong> {selectedOrder.buyer?.name} (
                {selectedOrder.buyer?.email})
              </p>
              <p>
                <strong>Seller:</strong>{" "}
                {selectedOrder.items[0]?.product?.seller?.name || "—"}
              </p>

              <div className="order-products">
                <h4>Products</h4>
                <ul>
                  {selectedOrder.items.map((i, idx) => (
                    <li key={idx}>
                      {i.product?.name} — <strong>₹{i.price}</strong> ×{" "}
                      {i.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="modal-buttons">
              <button
                className="btn-secondary"
                onClick={() => setSelectedOrder(null)}
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
