import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../../context/CartContext';
import './BuyerPages.css';

const API_URL = 'http://localhost:5000';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/products/detail/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError('Product not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="page-container"><h2>Loading...</h2></div>;
  }

  if (error) {
    return <div className="page-container"><h2>{error}</h2></div>;
  }

  if (!product) {
    return null;
  }
    
  const imageUrl = product.imageUrl
    ? `${API_URL}${product.imageUrl}`
    : 'https://via.placeholder.com/600x400.png?text=No+Image';

  return (
    <div className="page-container product-detail-container">
      <button onClick={() => navigate(-1)} className="btn secondary mb-1">
        &larr; Back
      </button>
      <div className="product-detail-layout">
        <div className="product-detail-image-wrapper">
          <img src={imageUrl} alt={product.name} className="product-detail-image" />
        </div>
        <div className="product-detail-info">
          <h1 className="product-detail-name">{product.name}</h1>
          <p className="product-detail-store">
            Sold by: {product.store?.name || 'N/A'}
          </p>
          <p className="product-detail-price">₹{product.price.toFixed(2)}</p>
          <p className="product-detail-stock">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
          </p>
          <p className="product-detail-description">{product.description}</p>
          
          <button
            onClick={() => addToCart(product)}
            className="btn primary btn-lg"
            disabled={product.stock === 0}
          >
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}