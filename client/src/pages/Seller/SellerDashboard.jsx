import React from "react";
import { Routes, Route } from "react-router-dom";
import { SellerLayoutProvider } from "../../context/SellerLayoutContext";
import SellerSidebar from "../../components/SellerSidebar";
import Products from "./Products";
import ProductForm from "./ProductForm";
import Orders from "./Orders";
import Store from "./Store";
import SellerProductView from "./SellerProductView";
import "./SellerDashboard.css";
import SellerCategories from "./SellerCategories";
import AddCategory from "./AddCategory";
import EditProduct from "./EditProduct";
import CategoryView from "./CategoryView";

export default function SellerDashboard() {
  // layout provider holds the sidebar state globally for all pages
  return (
    <SellerLayoutProvider>
      {/* seller-layout will gain 'sidebar-open' class via context by SellerSidebar */}
      <div className="seller-layout">
        <SellerSidebar />
        <main className="seller-main">
          <Routes>
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<SellerProductView />} />
            <Route path="new" element={<ProductForm />} />
            <Route path="orders" element={<Orders />} />
            <Route path="store" element={<Store />} />
            <Route path="categories" element={<SellerCategories />} />
            <Route path="categories/new" element={<AddCategory />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id/edit" element={<EditProduct />} />
            <Route path="categories/:id" element={<CategoryView />} />
          </Routes>
        </main>
      </div>
    </SellerLayoutProvider>
  );
}
