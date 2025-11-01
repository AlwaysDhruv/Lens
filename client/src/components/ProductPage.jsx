import React from "react";
import "./ProductCard.css";

export default function ProductCard({ p }) {
  return (
    <div className="product-card">
      <div className="product-image">
        <img
          src={p.imageUrl || "/placeholder.jpg"}
          alt={p.name}
        />
      </div>

      <div className="product-info">
        <h3>{p.name}</h3>
        <p className="description">{p.description || "No description available."}</p>

        <div className="meta">
          <p><strong>Price:</strong> ₹{p.price}</p>
          <p><strong>Stock:</strong> {p.stock > 0 ? p.stock : "Out of stock"}</p>
          <p><strong>Category:</strong> {p.category?.name}</p>
          <p><strong>Store:</strong> {p.store?.name}</p>
        </div>

        {p.seller && (
          <div className="seller-info">
            <p><strong>Seller:</strong> {p.seller.name}</p>
            <p><strong>Contact:</strong> {p.seller.email}</p>
          </div>
        )}

        <button className="buy-btn">Add to Cart</button>
      </div>
    </div>
  );
}
