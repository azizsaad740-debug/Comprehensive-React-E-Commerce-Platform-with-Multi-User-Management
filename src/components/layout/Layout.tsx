"use client";

import React from 'react';
import Header from './Header';
import Footer from './Footer';
import CartSidebar from '../cart/CartSidebar';
import ThemeInitializer from './ThemeInitializer';
import FaviconUpdater from './FaviconUpdater'; // NEW IMPORT

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ThemeInitializer />
      <FaviconUpdater /> {/* NEW */}
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CartSidebar />
    </div>
  );
};

export default Layout;