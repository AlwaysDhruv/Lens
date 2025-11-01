import React, { useEffect, useState } from "react";
import api from "../services/api";
import ProductCard from "../components/ProductPage";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState("");
  const [products, setProducts] = useState([]);

  // 🧠 Fetch categories for dropdown
  useEffect(() => {
    (async () => {
      const res = await api.get("/categories/buyer");
      setCategories(res.data.categories);
    })();
  }, []);

  // 🧠 Fetch products based on selected category
  useEffect(() => {
    (async () => {
      const url = selectedCat
        ? `/products?category=${selectedCat}`
        : "/products";
      const res = await api.get(url);
      setProducts(res.data);
    })();
  }, [selectedCat]);

  return (
    <div className="home-page">
      <div className="filter-bar">
        <h2>Shop by Category</h2>
        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
        >
          <option value="">All Products</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <h2>Products</h2>
      <div className="grid">
        {products.length ? (
          products.map((p) => <ProductCard key={p._id} p={p} />)
        ) : (
          <p>No products found in this category.</p>
        )}
      </div>
    </div>
  );
}
