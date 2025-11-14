"use client";

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@/types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: User['role'][];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, hasRole, isLoading } = useAuthStore();

  // 1. If loading, show spinner to wait for auth state resolution
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 2. If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // 3. If authenticated but role is restricted, redirect to home
  if (allowedRoles && user) {
    // Superuser bypasses all specific role checks
    const isAuthorized = user.role === 'superuser' || hasRole(allowedRoles);
    
    if (!isAuthorized) {
      return <Navigate to="/" replace />;
    }
  }

  // 4. Access granted
  return <>{children}</>;
};

export default ProtectedRoute;