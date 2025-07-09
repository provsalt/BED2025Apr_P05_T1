import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router';
import { UserContext } from '@/provider/UserContext.js';

const AdminProtectedRoute = ({ children }) => {
  const user = useContext(UserContext);
  
  console.log('AdminProtectedRoute - user:', user);
  console.log('AdminProtectedRoute - user.role:', user?.role);
  console.log('AdminProtectedRoute - user.isAuthenticated:', user?.isAuthenticated);
  
  // Check if user is authenticated
  if (!user?.isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check if user has admin role - allow access if they are admin
  if (user.role !== 'Admin') {
    console.log('User role is not Admin, redirecting to login. Role:', user.role);
    return <Navigate to="/login" replace />;
  }

  console.log('Admin access granted');
  // If children are provided, render them; otherwise use Outlet for nested routes
  return children ? children : <Outlet />;
};

export default AdminProtectedRoute;