import React from "react";
import AdminSidebar from "../components/AdminSidebar";
import "./AdminLayout.css";
import { Outlet } from "react-router-dom";

export default function AdminLayout()
{
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
