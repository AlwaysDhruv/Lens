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
import MessagesCenter from "./pages/MessagesCenter";
import UniversalMessages from "./pages/UniversalMessages";
import ThreadView from "./pages/ThreadView";

import "./styles/theme.css";

/* ==========================================================
   🌐 Layout Wrapper
   - Hides Header/Footer on Admin & Seller sections
========================================================== */
function LayoutWrapper({ children }) {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");
  const isSellerPage = location.pathname.startsWith("/seller");

  return (
    <div className="app-layout">
      {/* Show header only for buyer/public pages */}
      {!isAdminPage && !isSellerPage && <Header />}

      <main
        style={{
          padding: isAdminPage || isSellerPage ? "0" : "1rem",
          flex: "1",
        }}
      >
        {children}
      </main>

      {/* Footer hidden on admin/seller */}
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

          {/* --- 💬 Messaging System (All Roles) --- */}
          <Route
            path="/messages"
            element={
              <ProtectedRoute roles={["admin", "seller", "user"]}>
                <UniversalMessages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:id"
            element={
              <ProtectedRoute roles={["admin", "seller", "user"]}>
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
