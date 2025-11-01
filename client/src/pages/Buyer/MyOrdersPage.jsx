import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import './BuyerPages.css';

const API_URL = 'http://localhost:5000/api';
const SERVER_URL = 'http://localhost:5000';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext);

  // Function to fetch orders (no change)
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
      setError('Could not load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  // --- NEW FUNCTION TO HANDLE CANCELLATION ---
  const handleCancelRequest = async (orderId) => {
    if (!window.confirm('Are you sure you want to request cancellation for this order?')) {
      return;
    }

    try {
      // Call our new API endpoint
      const res = await axios.put(
        `${API_URL}/orders/${orderId}/request-cancellation`,
        {}, // No data to send
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the state locally to instantly show the change
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? res.data : order
        )
      );
      alert('Cancellation requested. The seller will be notified.');
    } catch (err) {
      console.error('Failed to request cancellation:', err);
      alert(err.response?.data?.msg || 'Could not request cancellation.');
    }
  };
  // ------------------------------------------

  if (loading) {
    return <div className="page-container"><h2>Loading Orders...</h2></div>;
  }
  // ... (error and no-orders JSX is the same) ...

  return (
    <div className="page-container">
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <p>You have not placed any orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            // Determine if the cancel button should be shown
            const canCancel = ['pending', 'confirmed'].includes(order.status);

            return (
              <div key={order._id} className="order-card">
                {/* Order Header */}
                <div className="order-card-header">
                  <div>
                    <strong>Order ID:</strong>
                    <span>{order._id}</span>
                  </div>
                  <div>
                    <strong>Placed On:</strong>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <strong>Total:</strong>
                    <span className="order-total-price">${order.total.toFixed(2)}</span>
                  </div>
                  <div>
                    <strong>Status:</strong>
                    <span className={`order-status ${order.status.toLowerCase()}`}>
                      {/* Replace underscore with space for display */}
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* --- NEW CANCELLATION BUTTON LOGIC --- */}
                  <div className="order-header-actions">
                    {canCancel && (
                      <button 
                        className="btn-cancel-order" 
                        onClick={() => handleCancelRequest(order._id)}
                      >
                        Request Cancellation
                      </button>
                    )}
                  </div>
                  {/* ------------------------------------- */}

                </div>

                {/* ... (Order Body and Footer are the same) ... */}
                <div className="order-card-body">
                  {/* ... (item mapping) ... */}
                </div>
                <div className="order-card-footer">
                  {/* ... (shipping info) ... */}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}