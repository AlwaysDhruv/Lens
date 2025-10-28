import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./Admin.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    sellers: 0,
    products: 0,
    orders: 0,
  });

  useEffect(() => {
  async function loadStats() {
    try {
      const [usersRes, productsRes, ordersRes, unreadRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/products"),
        api.get("/admin/orders"),
        api.get("/messages/admin-unread-count"), // ✅ new
      ]);

      const users = usersRes.data;
      const products = productsRes.data;
      const orders = ordersRes.data;
      const unread = unreadRes.data.unread;

      setStats({
        users: users.length,
        sellers: users.filter((u) => u.role === "seller").length,
        products: products.length,
        orders: orders.length,
        unreadMessages: unread, // ✅ store unread count
      });
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    }
  }

  loadStats();
}, []);

  return (
    <div className="admin-content">
      <h1>Dashboard Overview</h1>
      <div className="stats-grid">
        <div className="card stat-card">
          <h3>Total Users</h3>
          <p>{stats.users}</p>
        </div>
        <div className="card stat-card">
          <h3>Sellers</h3>
          <p>{stats.sellers}</p>
        </div>
        <div className="card stat-card">
          <h3>Products</h3>
          <p>{stats.products}</p>
        </div>
        <div className="card stat-card">
          <h3>Orders</h3>
          <p>{stats.orders}</p>
        </div>
      
        {/* ✅ NEW */}
        <div className="card stat-card highlight">
          <h3>Inbox Messages</h3>
          <p>{stats.unreadMessages || 0} New</p>
          <button
            onClick={() => (window.location.href = "/messages")}
            className="view-btn"
          >
            View Messages
          </button>
        </div>
      </div>
    </div>
  );
}
