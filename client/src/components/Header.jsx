import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import "./Header.css";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const nav = useNavigate();

  const role = user?.role;

  const handleLogout = () => {
    logout();
    nav("/");
  };

  return (
    <header className="main-header">
      <div className="header-inner">
        <Link to="/" className="brand">Lens Gallery</Link>

        <nav className="nav-links">
          {user ? (
            <>
              {role !== "admin" && (
                <>
                  <Link to="/search">Search</Link>
                  <Link to="/cart">Cart ({cart.length})</Link>
                </>
              )}

              {role === "seller" && <Link to="/seller">Seller</Link>}

              {role === "admin" && (
                <>
                  <Link to="/admin/users">Users</Link>
                  <Link to="/admin/products">Products</Link>
                </>
              )}

              <span className="logout" onClick={handleLogout}>
                Logout
              </span>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
