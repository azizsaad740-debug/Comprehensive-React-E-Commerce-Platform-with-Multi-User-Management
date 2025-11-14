"use client";

import React, { useState } from 'react';
import Header from './Header';
import AdminSidebar from './AdminSidebar';
import CartSidebar from '../cart/CartSidebar';
import { Menu, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import AIPopupAgent from '../admin/AIPopupAgent'; // NEW IMPORT

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false); // NEW STATE for AI Chat

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
        
        {/* Main Content - Removed px-2 to prevent double padding with page containers */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      <CartSidebar />
      
      {/* Floating AI Chat Button (Admin Only) */}
      <Button
        className="fixed bottom-4 right-4 w-16 h-16 rounded-full shadow-xl bg-purple-600 hover:bg-purple-700 text-white z-50"
        onClick={() => setIsAIChatOpen(true)}
        title="AI Assistant Chat"
      >
        <Brain className="h-6 w-6" />
      </Button>
      
      {/* AI Chat Agent Popup */}
      <AIPopupAgent
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        taskType="admin_chat"
        initialPrompt="What is the current status of low stock items?"
        context="admin dashboard queries"
      />
    </div>
  );
};

export default AdminLayout;