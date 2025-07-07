import React, { useContext } from 'react';
import { Navigate } from 'react-router';
import { UserContext } from '@/provider/UserContext.js';

const AdminProtectedRoute = ({ children }) => {
  const { user } = useContext(UserContext);

  // Check if user is authenticated
  if (!user?.isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check if user has admin role
  if (user.role !== 'Admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
