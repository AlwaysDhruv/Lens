import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSellerLayout } from "../context/SellerLayoutContext";
import { ThemeContext } from "../context/ThemeContext";
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
} from "lucide-react";
import "./SellerSidebar.css";

export default function SellerSidebar() {
  const { isSidebarOpen, toggleSidebar, setOpenClassOnLayout } = useSellerLayout();
  const [hovered, setHovered] = useState(false);
  const { theme, toggleTheme } = React.useContext(ThemeContext);
  const nav = useNavigate();

  // open if pinned OR hovered (peek)
  const open = isSidebarOpen || hovered;

  // ensure the `.seller-layout` wrapper gets the `sidebar-open` class for sibling CSS
  React.useEffect(() => {
    const wrapper = document.querySelector(".seller-layout");
    if (!wrapper) return;
    if (isSidebarOpen) wrapper.classList.add("sidebar-open");
    else wrapper.classList.remove("sidebar-open");
  }, [isSidebarOpen]);

  return (
    <aside
      className={`seller-sidebar ${open ? "open" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-expanded={open}
    >
      <div className="sidebar-header">
        {!open ? <span className="sidebar-logo">🤑</span> : <h2>Seller Panel</h2>}
        <button
          className="toggle-btn"
          onClick={toggleSidebar}
          title={isSidebarOpen ? "Unpin sidebar" : "Pin sidebar"}
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
        </button>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/seller/products" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <Box className="icon" />
          <span className="link-text">Products</span>
        </NavLink>

        <NavLink to="/seller/new" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <PlusSquare className="icon" />
          <span className="link-text">Add Product</span>
        </NavLink>

        <NavLink to="/seller/categories" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <Box className="icon" />
          <span className="link-text">Categories</span>
        </NavLink>
        
        <NavLink to="/seller/categories/new" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <PlusSquare className="icon" />
          <span className="link-text">Add Category</span>
        </NavLink>

        <NavLink to="/seller/orders" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <ShoppingBag className="icon" />
          <span className="link-text">Orders</span>
        </NavLink>

        <NavLink to="/seller/store" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <Store className="icon" />
          <span className="link-text">Store</span>
        </NavLink>

        <NavLink to="/seller/messages" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <MessageSquare className="icon" />
          <span className="link-text">Messages</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {theme === "dark" ? <Sun /> : <Moon />}
          <span className="link-text">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>

        <button
          className="logout-btn"
          onClick={() => {
            // keep your actual logout logic here
            localStorage.removeItem("token");
            nav("/");
          }}
        >
          <LogOut />
          <span className="link-text">Logout</span>
        </button>
      </div>
    </aside>
  );
}
