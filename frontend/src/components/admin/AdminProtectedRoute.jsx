import React, { useContext } from "react";
import { Outlet, Navigate } from "react-router";
import { UserContext } from "@/provider/UserContext.js";

const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, role, isLoading } = useContext(UserContext);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || role !== "Admin") {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default AdminProtectedRoute;
