import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/products");
        const found = res.data.find((x) => x._id === id);
        setProduct(found);
      } catch (err) {
        console.error("Failed to fetch product:", err);
      }
    })();
  }, [id]);

  if (!product) return <div style={{ textAlign: "center" }}>Loading...</div>;

  const handleAddToCart = () => {
    if (!user) {
      alert("Please log in or register to add items to your cart.");
      // save where user came from → return here after login/register
      nav("/register", { state: { from: `/product/${id}` } });
      return;
    }

    addToCart(product, 1);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", textAlign: "center" }}>
      <h2>{product.name}</h2>
      <img
        src={product.imageUrl || "/placeholder.png"}
        alt={product.name}
        style={{ width: "100%", maxHeight: "400px", objectFit: "cover", borderRadius: "8px" }}
      />
      <p style={{ marginTop: "1rem", fontSize: "1.1rem" }}>{product.description}</p>
      <p style={{ fontSize: "1.3rem", fontWeight: "bold" }}>₹{product.price}</p>
      <button onClick={handleAddToCart} style={{ marginTop: "1rem" }}>
        Add to Cart
      </button>
    </div>
  );
}
