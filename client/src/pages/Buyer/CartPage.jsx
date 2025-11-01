import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import './BuyerPages.css';

const API_URL = 'http://localhost:5000/api';

export default function CartPage() {
  const { cart, updateQty, removeFromCart, clearCart, total } = useContext(CartContext);
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [payment, setPayment] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pre-fill form with user's profile info
  useEffect(() => {
    if (user) {
      setAddress(user.address || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const orderItems = cart.map(item => ({
      product: item.product,
      quantity: item.quantity,
      price: item.price,
      seller: item.seller,
      store: item.store
    }));

    try {
      await axios.post(
        `${API_URL}/orders`,
        {
          items: orderItems,
          address,
          phone,
          payment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setSuccess('Order placed successfully! Redirecting to My Orders...');
      clearCart();
      setTimeout(() => navigate('/my-orders'), 2000);

    } catch (err) {
      console.error('Checkout failed:', err);
      setError(err.response?.data?.msg || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="page-container">
        <h2>Your Cart is Empty</h2>
        <button onClick={() => navigate('/home')} className="btn primary">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2>Shopping Cart</h2>
      <div className="cart-layout">
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item.product} className="cart-item">
              <div className="cart-item-info">
                <h4>{item.name}</h4>
                <p>${item.price.toFixed(2)}</p>
              </div>
              <div className="cart-item-actions">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQty(item.product, parseInt(e.target.value))}
                  className="form-input"
                  style={{ width: '60px' }}
                />
                <button
                  onClick={() => removeFromCart(item.product)}
                  className="btn danger"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-checkout-form">
          <h3>Checkout Details</h3>
          <h4 className="cart-total">Total: ${total.toFixed(2)}</h4>
          <form onSubmit={handleCheckout}>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                type="text"
                className="form-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="payment">Payment Method</label>
              <select
                id="payment"
                className="form-input"
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
              >
                <option value="cash">Cash on Delivery</option>
                <option value="upi">UPI</option>
              </select>
            </div>
            {error && <p className="form-error">{error}</p>}
            {success && <p className="form-success">{success}</p>}
            <button type="submit" className="btn primary btn-lg" disabled={loading}>
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}