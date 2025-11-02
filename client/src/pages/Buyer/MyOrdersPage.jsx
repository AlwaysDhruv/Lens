import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import './BuyerPages.css';

const API_URL = 'http://localhost:5000/api';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);

  const fetchOrders = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/orders/buyer`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      alert('Could not load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [token]);

  const handleCancelRequest = async (orderId, itemId = null) => {
    // itemId optional — if omitted, request cancellation for all eligible items in order
    if (!window.confirm('Request cancellation? Seller will approve or reject.')) return;

    try {
      const res = await axios.put(
        `${API_URL}/orders/${orderId}/request-cancellation`,
        itemId ? { itemId } : {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // update local state
      setOrders(prev => prev.map(o => o._id === res.data._id ? res.data : o));
      alert('Cancellation requested. Seller will be notified.');
    } catch (err) {
      console.error('Failed to request cancellation:', err);
      alert(err.response?.data?.msg || 'Could not request cancellation.');
    }
  };

  if (loading) return <div className="page-container"><h2>Loading Orders...</h2></div>;

  return (
    <div className="page-container">
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <p>You have not placed any orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-card-header">
                <div><strong>Order ID:</strong> {order._id}</div>
                <div><strong>Placed On:</strong> {new Date(order.createdAt).toLocaleDateString()}</div>
                <div><strong>Total:</strong> ₹{order.total}</div>
              </div>

              <div className="order-card-body">
                {order.items.map(item => (
                  <div key={item._id} className="order-item" style={{ borderTop: '1px solid #eee', padding: '8px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <strong>{item.product?.name || 'Deleted product'}</strong>
                        <div>Qty: {item.quantity} · Price: ₹{item.price}</div>
                        <div>Store: {item.store?.name || '—'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div>
                          <strong>Status:</strong>
                          <div className={`order-status ${item.status}`}>{item.status.replace('_', ' ')}</div>
                        </div>
                        <div style={{ marginTop: 8 }}>
                          {/* Cancel per-item if eligible */}
                          {['pending','confirmed'].includes(item.status) && (
                            <button className="btn-cancel-order" onClick={() => handleCancelRequest(order._id, item._id)}>
                              Request Cancellation (This Item)
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-card-footer" style={{ marginTop: 8 }}>
                {/* Request cancellation for full order (affects all cancellable items) */}
                {order.items.some(i => ['pending','confirmed'].includes(i.status)) && (
                  <button className="btn-cancel-order" onClick={() => handleCancelRequest(order._id)}>
                    Request Cancellation (All cancellable items)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
