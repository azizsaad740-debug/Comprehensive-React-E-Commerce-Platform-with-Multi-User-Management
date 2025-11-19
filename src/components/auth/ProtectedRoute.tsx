"use client";

import React, { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types';
import FullPageLoader from '../layout/FullPageLoader';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children?: ReactNode; // Made optional to support <Route element={<ProtectedRoute />} /> pattern
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated users to the login page
    return <Navigate to="/auth/login" replace />;
  }

  // Check if the user's role is allowed
  const userRole = user?.role || 'customer'; // Default to 'customer' if role is somehow missing
  if (!allowedRoles.includes(userRole)) {
    // Redirect unauthorized users to a safe page (e.g., home or 404)
    return <Navigate to="/" replace />;
  }

  // If authenticated and authorized, render the children or the nested routes via Outlet
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;