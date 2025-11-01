import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// 🧩 Common Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// 🌍 Public Pages
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Contact from "./pages/Contact";

// --- 🛍️ BUYER PAGES (New) ---
import HomePage from "./pages/Buyer/HomePage";
import ProductDetailPage from "./pages/Buyer/ProductDetailPage";
import CartPage from "./pages/Buyer/CartPage";
import ProfilePage from "./pages/Buyer/ProfilePage";
import MyOrdersPage from "./pages/Buyer/MyOrdersPage";
// --------------------------

// 🧑‍💼 Seller Pages
import SellerDashboard from "./pages/Seller/SellerDashboard";

// 👑 Admin Pages
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminProducts from "./pages/Admin/AdminProducts";
import AdminProductView from "./pages/Admin/AdminProductView";
import AdminOrders from "./pages/Admin/AdminOrders";
import AdminNewMessage from "./pages/Admin/AdminNewMessage";

// 💬 Universal Messaging System (Threaded)
import UniversalMessages from "./pages/UniversalMessages";
import ThreadView from "./pages/ThreadView";

import "./styles/theme.css";

/* ==========================================================
   🌐 Layout Wrapper
   ... (This component remains the same as in your file)
========================================================== */
function LayoutWrapper({ children }) {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");
  const isSellerPage = location.pathname.startsWith("/seller");

  return (
    <div className="app-layout">
      {!isAdminPage && !isSellerPage && <Header />}
      <main
        style={{
          padding: isAdminPage || isSellerPage ? "0" : "1rem",
          flex: "1",
        }}
      >
        {children}
      </main>
      {!isAdminPage && !isSellerPage && <Footer />}
    </div>
  );
}


/* ==========================================================
   🚀 Main App Router
========================================================== */
export default function App() {
  return (
    <BrowserRouter>
      <LayoutWrapper>
        <Routes>

          {/* --- 🌍 Public Routes --- */}
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/contact" element={<Contact />} />

          {/* --- 🛍️ Buyer Routes (Public & Protected) --- */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          
          <Route
            path="/cart"
            element={
              <ProtectedRoute roles={["buyer"]}>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute roles={["buyer", "seller", "admin"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-orders"
            element={
              <ProtectedRoute roles={["buyer"]}>
                <MyOrdersPage />
              </ProtectedRoute>
            }
          />

          {/* --- 💬 Messaging System (All Roles) --- */}
          {/* Note: Updated 'user' to 'buyer' to match schema */}
          <Route
            path="/messages"
            element={
              <ProtectedRoute roles={["admin", "seller", "buyer"]}>
                <UniversalMessages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:id"
            element={
              <ProtectedRoute roles={["admin", "seller", "buyer"]}>
                <ThreadView />
              </ProtectedRoute>
            }
          />

          {/* --- 🧑‍💼 Seller Section --- */}
          <Route
            path="/seller/*"
            element={
              <ProtectedRoute roles={["seller"]}>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />

          {/* --- 👑 Admin Section --- */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* ... (existing admin routes) ... */}
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/:id" element={<AdminProductView />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="messages/new" element={<AdminNewMessage />} />
          </Route>

        </Routes>
      </LayoutWrapper>
    </BrowserRouter>
  );
}