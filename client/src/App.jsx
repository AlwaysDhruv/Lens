import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Outlet,
  Navigate,
} from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Contact from "./pages/Contact";

import HomePage from "./pages/Buyer/HomePage";
import ProductDetailPage from "./pages/Buyer/ProductDetailPage";
import CartPage from "./pages/Buyer/CartPage";
import ProfilePage from "./pages/Buyer/ProfilePage";
import MyOrdersPage from "./pages/Buyer/MyOrdersPage";

import SellerDashboard from "./pages/Seller/SellerDashboard";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminProducts from "./pages/Admin/AdminProducts";
import AdminProductView from "./pages/Admin/AdminProductView";
import AdminOrders from "./pages/Admin/AdminOrders";
import AdminNewMessage from "./pages/Admin/AdminNewMessage";
import AdminUserDetails from "./pages/Admin/AdminUserDetails";

import UniversalMessages from "./pages/UniversalMessages";
import ThreadView from "./pages/ThreadView";

import "./styles/theme.css";

function LayoutWrapper()
{
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
        <Outlet />
      </main>
      {!isAdminPage && !isSellerPage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutWrapper />}>
          <Route index element={<Welcome />} />
          <Route path="welcome" element={<Welcome />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot" element={<ForgotPassword />} />
          <Route path="contact" element={<Contact />} />

          <Route path="home" element={<HomePage />} />
          <Route path="product/:id" element={<ProductDetailPage />} />

          <Route
            path="cart"
            element={
              <ProtectedRoute roles={["buyer"]}>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute roles={["buyer", "seller", "admin"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-orders"
            element={
              <ProtectedRoute roles={["buyer"]}>
                <MyOrdersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="messages"
            element={
              <ProtectedRoute roles={["admin", "seller", "buyer"]}>
                <UniversalMessages />
              </ProtectedRoute>
            }
          />
          <Route
            path="messages/:id"
            element={
              <ProtectedRoute roles={["admin", "seller", "buyer"]}>
                <ThreadView />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route
          path="/seller/*"
          element={
            <ProtectedRoute roles={["seller"]}>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:id" element={<AdminUserDetails />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/:id" element={<AdminProductView />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="messages/new" element={<AdminNewMessage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
