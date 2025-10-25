// client/src/pages/Seller/SellerDashboard.jsx
import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import Products from './Products';
import ProductForm from './ProductForm';
import Orders from './Orders';
import Store from './Store';

export default function SellerDashboard() {
  return (
    <div style={{ padding: '1rem' }}>
      <h2>Seller Dashboard</h2>
      <nav style={{ marginBottom: '1rem' }}>
        <Link to="products">My Products</Link> |{" "}
        <Link to="new">Add Product</Link> |{" "}
        <Link to="orders">Orders</Link> |{" "}
        <Link to="store">Store Info</Link>
      </nav>

      <Routes>
        <Route path="products" element={<Products />} />
        <Route path="new" element={<ProductForm />} />
        <Route path="orders" element={<Orders />} />
        <Route path="store" element={<Store />} />
      </Routes>
    </div>
  );
}
