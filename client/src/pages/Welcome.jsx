import React from "react";
import { Link } from "react-router-dom";
import GogglesBackground from "./GogglesBackground";
import "./Welcome.css";

export default function Welcome() {
  return (
    <div className="welcome-page">
      <GogglesBackground />

      <div className="welcome-content">
        <h1 className="welcome-title">
          Welcome to <span>Lens Gallery 👓</span>
        </h1>
        <p className="welcome-subtitle">
          Discover your perfect look with premium eyewear crafted for comfort and style.
        </p>
        <div className="welcome-buttons">
          <Link to="/home" className="btn primary">Browse Products</Link>
          <Link to="/contact" className="btn secondary">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
