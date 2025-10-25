import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";

export default function ProductCard({ p }) {
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const nav = useNavigate();

  const handleView = () => {
    nav(`/product/${p._id}`);
  };

  return (
    <div className="product-card">
      <img
        src={p.imageUrl || "/placeholder.jpg"}
        alt={p.name}
        style={{ cursor: "pointer" }}
        onClick={handleView}
      />

      <h3>{p.name}</h3>
      <p>₹{p.price}</p>
    </div>
  );
}
