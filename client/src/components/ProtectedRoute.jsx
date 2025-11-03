import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles = [] })
{
  const { user, loading } = useContext(AuthContext);

  if (loading)
  {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h3>Restoring your session...</h3>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roles.length && !roles.includes(user.role))
  {
    return <Navigate to="/" replace />;
  }

  return children;
}
