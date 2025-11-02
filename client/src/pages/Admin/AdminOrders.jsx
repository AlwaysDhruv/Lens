import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminOrders.css"; // we will update this styling to match SellerOrders.css

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancellation_requested: "Cancellation Requested",
  cancelled: "Cancelled",
};

function StatusBadge({ status }) {
  return <span className={`order-status ${status}`}>{STATUS_LABELS[status] || status}</span>;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const res = await api.get("/admin/orders");
    setOrders(res.data);
  }

  const filteredOrders = orders
    .filter((o) =>
      o.buyer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.items.some((i) => i.product?.name?.toLowerCase().includes(search.toLowerCase())) ||
      o._id.toLowerCase().includes(search.toLowerCase())
    )
    .filter((o) => {
      if (filter === "all") return true;
      return o.items.some((i) => i.status === filter);
    });

  return (
    <div className="seller-orders">
      <div className="seller-orders-header">
        <div>
          <h2>All Orders</h2>
          <div style={{ color: "var(--text-color)", marginTop: 6, fontSize: 13 }}>
            View every order in the system, across all stores.
          </div>
        </div>

        <div className="seller-orders-controls">
          <input
            type="search"
            placeholder="Search buyer, product, or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn-refresh" onClick={loadOrders}>
            Refresh
          </button>
        </div>
      </div>

      {/* FILTER ROW */}
      <div className="seller-filter-row">
        <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All</button>
        <button className={`filter-btn ${filter === "pending" ? "active" : ""}`} onClick={() => setFilter("pending")}>Pending</button>
        <button className={`filter-btn ${filter === "shipped" ? "active" : ""}`} onClick={() => setFilter("shipped")}>Shipped</button>
        <button className={`filter-btn ${filter === "out_for_delivery" ? "active" : ""}`} onClick={() => setFilter("out_for_delivery")}>Out for Delivery</button>
        <button className={`filter-btn ${filter === "delivered" ? "active" : ""}`} onClick={() => setFilter("delivered")}>Delivered</button>
        <button className={`filter-btn ${filter === "cancellation_requested" ? "active" : ""}`} onClick={() => setFilter("cancellation_requested")}>
          Cancellation Req.
        </button>
      </div>

      {/* ORDER CARDS */}
      <div className="orders-list">
        {filteredOrders.map((order) => (
          <div className="order-card" key={order._id}>
            <div className="order-card-header">
              <div className="left">
                <div className="order-id">Order ID: {order._id}</div>
                <div className="buyer-meta">{order.buyer?.name} · {order.buyer?.email}</div>
                <div className="meta-small">Placed: {new Date(order.createdAt).toLocaleString()}</div>
              </div>
              <div className="right">
                <div className="total">₹{order.totalAmount}</div>
              </div>
            </div>

            <div className="order-card-body">
              {order.items.map((it, idx) => (
                <div key={idx} className="order-item">
                  <img className="thumb" src={it.product?.imageUrl || "/placeholder.png"} alt="" />
                  <div className="info">
                    <div className="title">{it.product?.name}</div>
                    <div className="meta">Qty: {it.quantity} × ₹{it.price}</div>
                    <div className="meta">Seller: {it.product?.seller?.name || "—"}</div>
                    <div className="meta">Store: {it.product?.store?.name || "—"}</div>
                  </div>

                  <div className="actions">
                    <StatusBadge status={it.status} />
                  </div>
                </div>
              ))}
            </div>

            <div className="order-card-footer">
              <button className="action-btn primary" onClick={() => setSelectedOrder(order)}>View Details</button>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <p style={{ color: "#6b7280", marginTop: 20 }}>No orders match this filter.</p>
        )}
      </div>

      {/* VIEW DETAILS MODAL */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Order Details</h3>

            <p><strong>Order ID:</strong> {selectedOrder._id}</p>
            <p><strong>Buyer:</strong> {selectedOrder.buyer?.name} ({selectedOrder.buyer?.email})</p>

            <div className="order-products">
              <h4>Products</h4>
              <ul>
                {selectedOrder.items.map((i, idx) => (
                  <li key={idx}>{i.product?.name} — ₹{i.price} × {i.quantity}</li>
                ))}
              </ul>
            </div>

            <div className="modal-buttons">
              <button className="action-btn" onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
