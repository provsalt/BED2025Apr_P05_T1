import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router';
import { UserContext } from '@/provider/UserContext.js';

const AdminProtectedRoute = () => {
  const user = useContext(UserContext);
  // Check if user is authenticated
  if (!user?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has admin role - allow access if they are admin
  if (user.role !== 'Admin') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;