"use client";

import React from 'react';
import Header from './Header';
import AdminSidebar from './AdminSidebar';
import CartSidebar from '../cart/CartSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      <CartSidebar />
    </div>
  );
};

export default AdminLayout;