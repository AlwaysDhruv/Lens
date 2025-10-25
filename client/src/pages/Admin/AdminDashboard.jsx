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
        const [usersRes, productsRes, ordersRes] = await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/products"),
          api.get("/admin/orders"),
        ]);

        const users = usersRes.data;
        const products = productsRes.data;
        const orders = ordersRes.data;

        setStats({
          users: users.length,
          sellers: users.filter((u) => u.role === "seller").length,
          products: products.length,
          orders: orders.length,
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
      </div>
    </div>
  );
}
