"use client";

import React, { useState } from 'react';
import Header from './Header';
import AdminSidebar from './AdminSidebar';
import CartSidebar from '../cart/CartSidebar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex flex-1">
        
        {/* Desktop Sidebar (md and up) */}
        <div className="hidden md:flex flex-col h-full border-r bg-sidebar w-64 flex-shrink-0">
          <AdminSidebar />
        </div>
        
        {/* Mobile Menu Button and Sheet (below md) */}
        {isMobile && (
          <div className="md:hidden p-4 border-b bg-white dark:bg-card">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="h-4 w-4 mr-2" />
                  Menu
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 pt-10 bg-sidebar">
                <AdminSidebar onClose={() => setIsSheetOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        )}
        
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