import React, { useContext, useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSellerLayout } from "../context/SellerLayoutContext";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext"; // ✅ use global auth
import {
  Box,
  PlusSquare,
  ShoppingBag,
  Store,
  MessageSquare,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  UserCircle,
} from "lucide-react";
import "./SellerSidebar.css";

export default function SellerSidebar() {
  const { isSidebarOpen, toggleSidebar } = useSellerLayout();
  const [hovered, setHovered] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { logout } = useContext(AuthContext); // ✅ use same logout
  const nav = useNavigate();

  // determine if sidebar is open (pinned or hovered)
  const open = isSidebarOpen || hovered;

  // handle layout wrapper sync
  useEffect(() => {
    const wrapper = document.querySelector(".seller-layout");
    if (!wrapper) return;
    if (isSidebarOpen) wrapper.classList.add("sidebar-open");
    else wrapper.classList.remove("sidebar-open");
  }, [isSidebarOpen]);

  // ✅ consistent logout logic (like admin)
  const handleLogout = () => {
    logout(); // clears token + user globally
    nav("/"); // redirect home
  };

  return (
    <aside
      className={`seller-sidebar ${open ? "open" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-expanded={open}
    >
      {/* Header */}
      <div className="sidebar-header">
        {!open ? <span className="sidebar-logo">🤑</span> : <h2>Seller Panel</h2>}
        <button
          className="toggle-btn"
          onClick={toggleSidebar}
          title={isSidebarOpen ? "Unpin sidebar" : "Pin sidebar"}
        >
          {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <NavLink
          to="/seller/products"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          <Box className="icon" />
          <span className="link-text">Products</span>
        </NavLink>

        <NavLink
          to="/seller/new"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          <PlusSquare className="icon" />
          <span className="link-text">Add Product</span>
        </NavLink>

        <NavLink
          to="/seller/categories"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          <Box className="icon" />
          <span className="link-text">Categories</span>
        </NavLink>

        <NavLink
          to="/seller/categories/new"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          <PlusSquare className="icon" />
          <span className="link-text">Add Category</span>
        </NavLink>

        <NavLink
          to="/seller/orders"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          <ShoppingBag className="icon" />
          <span className="link-text">Orders</span>
        </NavLink>

        <NavLink
          to="/seller/store"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          <Store className="icon" />
          <span className="link-text">Store</span>
        </NavLink>

        <NavLink to="/seller/messages" className="nav-link">
          <MessageSquare className="icon" />
          <span className="link-text">Messages</span>
        </NavLink>
        <NavLink
            to="/seller/profile"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <UserCircle className="icon" />
            <span className="link-text">Profile</span>
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun /> : <Moon />}
          <span className="link-text">
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </span>
        </button>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut />
          <span className="link-text">Logout</span>
        </button>
      </div>
    </aside>
  );
}
