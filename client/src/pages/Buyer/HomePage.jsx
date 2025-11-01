import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import ProductCard from '../../components/ProductCard';
import './BuyerPages.css';

// Ensure this matches your server's URL and port
const API_URL = 'http://localhost:5000/api';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch products and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // We now fetch from the new public category route
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(`${API_URL}/products`),
          axios.get(`${API_URL}/categories`) // This route is now public
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Memoized filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      // --- THIS IS THE UPDATED LOGIC ---
      // We now filter by matching the category *name* because the
      // public /api/categories route returns names, not IDs.
      const matchesCategory =
        !selectedCategory || product.category?.name === selectedCategory;
      // ---------------------------------

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]); // Dependencies for the filter

  if (loading) {
    return <div className="page-container"><h2>Loading Products...</h2></div>;
  }

  return (
    <div className="page-container">
      <h2>Browse Products</h2>
      <div className="filters-container">
        <input
          type="text"
          placeholder="Search by name..."
          className="form-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="form-input"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {/* The new public route returns { _id: 'Name', name: 'Name' }
            so this JSX works perfectly.
          */}
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <p>No products found matching your criteria.</p>
        )}
      </div>
    </div>
  );
}