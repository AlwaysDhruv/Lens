import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import Search from "./pages/Search";
import Cart from "./pages/Cart";
import Confirm from "./pages/Confirm";
import Payment from "./pages/Payment";
import Contact from "./pages/Contact";
import SellerDashboard from "./pages/Seller/SellerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminProducts from "./pages/Admin/AdminProducts";
import AdminProductView from "./pages/Admin/AdminProductView";
import AdminOrders from "./pages/Admin/AdminOrders";
import AdminMessages from "./pages/Admin/AdminMessages";
import AdminNewMessage from "./pages/Admin/AdminNewMessage";
import "./styles/theme.css";

function LayoutWrapper({ children }) {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");
  return (
    <>
      {!isAdminPage && <Header />}
      <main style={{ padding: isAdminPage ? "0" : "1rem" }}>{children}</main>
      {!isAdminPage && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LayoutWrapper>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/contact" element={<Contact />} />

          {/* Buyer pages */}
          <Route path="/home" element={<Home />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/search" element={<Search />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/confirm" element={<Confirm />} />
          <Route path="/payment" element={<Payment />} />

          {/* Seller */}
          <Route
            path="/seller/*"
            element={
              <ProtectedRoute roles={["seller"]}>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin routes (all nested) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/:id" element={<AdminProductView />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="messages/new" element={<AdminNewMessage />} />
          </Route>
        </Routes>
      </LayoutWrapper>
    </BrowserRouter>
  );
}
