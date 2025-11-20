"use client";

import React, { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types';
import FullPageLoader from '../layout/FullPageLoader';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children?: ReactNode; // Made optional to support <Route element={<ProtectedRoute />} /> pattern
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();
  const isAttemptingAdminAccess = location.pathname.startsWith('/admin') || location.pathname.startsWith('/reseller');

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated) {
    // If unauthenticated and trying to access an admin route, redirect to the dedicated admin login gate.
    if (isAttemptingAdminAccess) {
      return <Navigate to="/admincpanelaccess" replace />;
    }
    // Otherwise, redirect to the standard customer login page.
    return <Navigate to="/auth/login" replace />;
  }

  // Check if the user's role is allowed
  const userRole = user?.role || 'customer'; // Default to 'customer' if role is somehow missing
  if (!allowedRoles.includes(userRole)) {
    // If authenticated but unauthorized for this specific route, redirect to home.
    return <Navigate to="/" replace />;
  }

  // If authenticated and authorized, render the children or the nested routes via Outlet
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;