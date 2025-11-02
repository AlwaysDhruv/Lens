// client/src/pages/Seller/Orders.jsx
import React, { useEffect, useState, useContext, useMemo } from "react";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import "./SellerOrders.css"; // <-- CSS you added

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancellation_requested: "Cancellation requested",
  cancelled: "Cancelled",
};

function StatusBadge({ status }) {
  return <div className={`order-status ${status}`}>{STATUS_LABELS[status] || status}</div>;
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  function push(msg, type = "info") {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3800);
  }
  const Toasts = () => (
    <div className="toasts" aria-live="polite">
      {toasts.map(t => <div key={t.id} className="toast">{t.msg}</div>)}
    </div>
  );
  return { push, Toasts };
}

export default function Orders() {
  const { user, token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [confirmModal, setConfirmModal] = useState(null);
  const { push, Toasts } = useToast();
  const sellerId = user?._id;
  const headers = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  useEffect(() => { fetchOrders(); /* eslint-disable-next-line */ }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await api.get("/orders/seller", headers);
      setOrders(res.data || []);
    } catch (err) {
      console.error("Failed to load seller orders", err);
      push("Failed to load orders");
    } finally { setLoading(false); }
  }

  async function updateItemStatus(orderId, itemId, status) {
    try {
      // optimistic update
      setOrders(prev => prev.map(o => {
        if (o._id !== orderId) return o;
        return { ...o, items: o.items.map(it => it._id === itemId ? { ...it, status } : it) };
      }));

      const res = await api.put(`/orders/${orderId}/items/${itemId}/status`, { status }, headers);
      const updated = res.data.order || res.data;
      setOrders(prev => prev.map(o => (o._id === updated._id ? updated : o)));
      push("Status updated");
    } catch (err) {
      console.error("Update failed", err);
      push(err?.response?.data?.msg || "Failed to update status");
      fetchOrders();
    }
  }

  function handleSetStatus(orderId, itemId, status) {
    if (status === "cancelled") {
      setConfirmModal({
        orderId, itemId, action: status,
        label: "Approve Cancellation",
        description: "Approving cancellation will restock the product and mark this item as cancelled. This cannot be undone."
      });
      return;
    }
    updateItemStatus(orderId, itemId, status);
  }

  function confirmModalProceed() {
    if (!confirmModal) return;
    const { orderId, itemId, action } = confirmModal;
    setConfirmModal(null);
    updateItemStatus(orderId, itemId, action);
  }

  const filteredOrders = useMemo(() => {
    const sellerOrders = orders.map(o => ({
      ...o,
      items: (o.items || []).filter(it => it.seller && (it.seller._id ? it.seller._id === sellerId : it.seller === sellerId))
    })).filter(o => o.items.length > 0);

    let list = sellerOrders;
    if (filter === "cancellation") list = list.filter(o => o.items.some(i => i.status === "cancellation_requested"));
    else if (filter === "pending") list = list.filter(o => o.items.some(i => ["pending","confirmed"].includes(i.status)));
    else if (filter === "shipping") list = list.filter(o => o.items.some(i => ["shipped","out_for_delivery"].includes(i.status)));

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o => {
        const buyerMatches = o.buyer?.name?.toLowerCase().includes(q);
        const idMatches = o._id?.toLowerCase().includes(q);
        const itemMatches = o.items.some(i => i.product?.name?.toLowerCase().includes(q));
        return buyerMatches || idMatches || itemMatches;
      });
    }

    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }, [orders, filter, search, sellerId]);

  return (
    <div className="seller-orders">
      <Toasts />

      <div className="seller-orders-header">
        <div>
          <h2 style={{ margin: 0 }}>Seller Orders</h2>
          <div style={{ color: "var(--text-color)", marginTop: 6, fontSize: 13 }}>
            Manage items you need to fulfill. Confirm → Ship → Out for Delivery → Delivered.
          </div>
        </div>

        <div className="seller-orders-controls">
          <input
            type="search"
            placeholder="Search buyer, order id, or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn-refresh" onClick={fetchOrders}>Refresh</button>
        </div>
      </div>

      <div className="seller-filter-row">
        <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All</button>
        <button className={`filter-btn ${filter === "cancellation" ? "active" : ""}`} onClick={() => setFilter("cancellation")}>Cancellation Requests</button>
        <button className={`filter-btn ${filter === "pending" ? "active" : ""}`} onClick={() => setFilter("pending")}>Pending / To Confirm</button>
        <button className={`filter-btn ${filter === "shipping" ? "active" : ""}`} onClick={() => setFilter("shipping")}>Shipping</button>
      </div>

      {loading ? (
        <div style={{ padding: 24, textAlign: "center" }}>Loading orders…</div>
      ) : filteredOrders.length === 0 ? (
        <div style={{ padding: 20, color: "#6b7280" }}>No orders match this filter.</div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-card-header">
                <div className="left">
                  <div className="order-id">Order ID: {order._id}</div>
                  <div className="buyer-meta">{order.buyer?.name} · {order.buyer?.email}</div>
                  <div className="meta-small">Placed: {new Date(order.createdAt).toLocaleString()}</div>
                </div>
                <div className="right">
                  <div className="total">₹{order.total}</div>
                  <div className="meta">Overall: {order.overallStatus}</div>
                </div>
              </div>

              <div className="order-card-body">
                {order.items.map(it => (
                  <div key={it._id} className="order-item">
                    <img className="thumb" src={it.product?.imageUrl || "/placeholder.png"} alt="" />
                    <div className="info">
                      <div className="title">{it.product?.name || "Product (deleted)"}</div>
                      <div className="meta">Qty: {it.quantity} · Price: ₹{it.price}</div>
                      <div className="meta">Store: {it.store?.name || "—"}</div>
                    </div>

                    <div className="actions">
                      <StatusBadge status={it.status} />

                      <div style={{ display: "flex", gap: 8 }}>
                        {(it.status === "pending" || it.status === "confirmed") && (
                          <>
                            <button className="action-btn" onClick={() => handleSetStatus(order._id, it._id, "confirmed")}>Confirm</button>
                            <button className="action-btn" onClick={() => handleSetStatus(order._id, it._id, "shipped")}>Mark Shipped</button>
                            <button className="action-btn" onClick={() => handleSetStatus(order._id, it._id, "out_for_delivery")}>Out for Delivery</button>
                          </>
                        )}

                        {it.status === "cancellation_requested" && (
                          <>
                            <button className="action-btn danger" onClick={() => setConfirmModal({
                              orderId: order._id, itemId: it._id, action: "cancelled",
                              label: "Approve Cancellation",
                              description: "Approving will restock product."
                            })}>Approve Cancellation</button>

                            <button className="action-btn" onClick={() => handleSetStatus(order._id, it._id, "confirmed")}>Reject (Confirm)</button>
                          </>
                        )}

                        {it.status === "shipped" && (
                          <button className="action-btn" onClick={() => handleSetStatus(order._id, it._id, "out_for_delivery")}>Mark Out for Delivery</button>
                        )}

                        {it.status === "out_for_delivery" && (
                          <button className="action-btn primary" onClick={() => handleSetStatus(order._id, it._id, "delivered")}>Mark Delivered</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm modal */}
      {confirmModal && (
        <div className="modal-overlay">
          <div className="modal-dialog" role="dialog" aria-modal="true">
            <h3>{confirmModal.label}</h3>
            <p>{confirmModal.description}</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
              <button className="action-btn" onClick={() => setConfirmModal(null)}>Cancel</button>
              <button className="action-btn danger" onClick={confirmModalProceed}>Proceed</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
