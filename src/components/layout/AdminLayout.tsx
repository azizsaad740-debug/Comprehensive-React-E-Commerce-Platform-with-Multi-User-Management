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
        
        {/* Desktop Sidebar (md and up) - Removed border-r */}
        <div className="hidden md:flex flex-col h-full bg-sidebar w-64 flex-shrink-0">
          <AdminSidebar />
        </div>
        
        {/* Mobile Menu Button and Sheet (below md) - Removed border-b */}
        {isMobile && (
          <div className="md:hidden p-2 bg-white dark:bg-card">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 border-gray-300 dark:border-gray-700">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 pt-10 bg-sidebar">
                <AdminSidebar onClose={() => setIsSheetOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        )}
        
        {/* Main Content - Added px-2 for subtle horizontal spacing */}
        <main className="flex-1 overflow-y-auto px-2">
          {children}
        </main>
      </div>
      <CartSidebar />
    </div>
  );
};

export default AdminLayout;