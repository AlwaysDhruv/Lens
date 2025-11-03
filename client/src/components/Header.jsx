import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import "./Header.css";

export default function Header()
{
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const nav = useNavigate();

  const role = user?.role;

  const handleLogout = () =>
  {
    logout();
    nav("/");
  };

  return (
    <header className="main-header">
      <div className="header-inner">
        <Link to="/" className="brand">
          Lens Gallery
        </Link>

        <nav className="nav-links">
          {user ? (
            <>
              {role === "buyer" && (
                <>
                  <Link to="/home">Home</Link>
                  <Link to="/profile">Profile</Link>
                  <Link to="/my-orders">Orders</Link>
                  <Link to="/messages">Messages</Link>
                  <Link to="/cart" className="cart-link">
                    Cart 
                    {cart.length > 0 && (
                      <span className="cart-badge">{cart.length}</span>
                    )}
                  </Link>
                </>
              )}

              {role === "seller" && <Link to="/seller">Seller</Link>}
              
              {role === "admin" && (
                <>
                  <Link to="/admin/dashboard">Dashboard</Link>
                  <Link to="/messages">Messages</Link>
                </>
              )}

              <span className="logout" onClick={handleLogout}>
                Logout
              </span>
            </>
          ) : (
            <>
              {/* --- PUBLIC LINKS --- */}
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}