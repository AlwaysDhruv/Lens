import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import './ProductCard.css'; // We will create this CSS file next

const API_URL = 'http://localhost:5000'; // Adjust if your server URL is different

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);

  const imageUrl = product.imageUrl
    ? `${API_URL}${product.imageUrl}`
    : 'https://via.placeholder.com/300x300.png?text=No+Image';

  return (
    <div className="product-card">
      <Link to={`/product/${product._id}`} className="product-card-link">
        <img
          src={imageUrl}
          alt={product.name}
          className="product-card-image"
        />
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-store">{product.store?.name || 'Generic Store'}</p>
        <p className="product-card-price">₹{product.price.toFixed(2)}</p>
      </Link>
      <button
        onClick={() => addToCart(product)}
        className="btn primary product-card-button"
      >
        Add to Cart
      </button>
    </div>
  );
}