import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  MessageSquare,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import "./AdminSidebar.css";

export default function AdminSidebar()
{
  const { logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const nav = useNavigate();

  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleLogout = () =>
  {
    logout();
    nav("/");
  };

  const isOpen = isPinned || isHovered;

  return (
    <aside
      className={`admin-sidebar ${isOpen ? "open" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="sidebar-header">
        {!isOpen ? (
          <div className="sidebar-logo-icon" title="Lens Admin">
            👓
          </div>
        ) : (
          <h2>Lens Admin</h2>
        )}

        <button
          className="toggle-btn"
          onClick={() => setIsPinned(!isPinned)}
          title={isPinned ? "Unpin Sidebar" : "Pin Sidebar"}
        >
          {isPinned ? <ChevronLeft /> : <ChevronRight />}
        </button>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/admin/dashboard" className="nav-link">
          <LayoutDashboard className="icon" />
          <span className={`link-text ${isOpen ? "visible" : ""}`}>
            Dashboard
          </span>
        </NavLink>

        <NavLink to="/admin/users" className="nav-link">
          <Users className="icon" />
          <span className={`link-text ${isOpen ? "visible" : ""}`}>Users</span>
        </NavLink>

        <NavLink to="/admin/products" className="nav-link">
          <Package className="icon" />
          <span className={`link-text ${isOpen ? "visible" : ""}`}>
            Products
          </span>
        </NavLink>

        <NavLink to="/admin/orders" className="nav-link">
          <ShoppingCart className="icon" />
          <span className={`link-text ${isOpen ? "visible" : ""}`}>
            Orders
          </span>
        </NavLink>

      <NavLink
        to="/messages"
        className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
      >
        <MessageSquare className="icon" />
        <span className={`link-text ${isOpen ? "visible" : ""}`}>Messages</span>
      </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? <Sun /> : <Moon />}
          <span className={`link-text ${isOpen ? "visible" : ""}`}>
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </span>
        </button>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut />
          <span className={`link-text ${isOpen ? "visible" : ""}`}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
