"use client";

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: User['role'][];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, hasRole } = useAuthStore();
  const { toast } = useToast();

  if (!isAuthenticated) {
    // User is not logged in, redirect to login
    toast({
      title: "Authentication Required",
      description: "Please log in to access this page.",
      variant: "destructive",
    });
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRoles && user && !hasRole(allowedRoles)) {
    // User is logged in but does not have the required role
    toast({
      title: "Access Denied",
      description: "You do not have permission to view this page.",
      variant: "destructive",
    });
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;