import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom'; // Import NavLink
import { AuthContext } from '../../context/AuthContext';
import './BuyerPages.css';

const API_URL = 'http://localhost:5000/api';

export default function ProfilePage() {
  const { user, token, setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({ name: '', email: '', address: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        address: user.address || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await axios.put(
        `${API_URL}/auth/update-details`,
        {
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setUser(res.data.user);
      setSuccess(res.data.msg);

    } catch (err) {
      console.error('Profile update failed:', err);
      setError(err.response?.data?.msg || 'Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="page-container"><h2>Loading Profile...</h2></div>;
  }

  return (
    <div className="page-container">
      {/* --- ADDED NAVIGATION LINKS --- */}

      <div className="auth-form-container">
        <h2>My Profile</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              disabled // Email is not editable
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              id="address"
              type="text"
              name="address"
              className="form-input"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your shipping address"
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>
          
          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}

          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}