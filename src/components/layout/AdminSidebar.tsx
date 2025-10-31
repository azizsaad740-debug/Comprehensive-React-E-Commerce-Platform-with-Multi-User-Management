"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, ShoppingBag, DollarSign, Settings, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/authStore';

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    roles: ['admin', 'reseller'],
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: ShoppingBag,
    roles: ['admin', 'reseller'],
  },
  {
    title: 'Products',
    href: '/admin/products',
    icon: Package,
    roles: ['admin'],
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    roles: ['admin'],
  },
  {
    title: 'Promo Codes',
    href: '/admin/promocodes',
    icon: Tag,
    roles: ['admin'],
  },
  {
    title: 'Commissions',
    href: '/reseller/commissions',
    icon: DollarSign,
    roles: ['reseller'],
  },
];

const AdminSidebar = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const userRole = user?.role;

  const filteredNavItems = navItems.filter(item => 
    userRole && item.roles.includes(userRole)
  ).map(item => {
    // Adjust dashboard link based on role for clarity
    if (item.title === 'Dashboard' && userRole === 'reseller') {
      return { ...item, href: '/reseller/dashboard' };
    }
    return item;
  });

  return (
    <div className="flex flex-col h-full border-r bg-sidebar w-64 p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-sidebar-primary">
          {userRole === 'admin' ? 'Admin Panel' : 'Reseller Hub'}
        </h2>
      </div>
      
      <nav className="flex-1 space-y-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center p-3 rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5 mr-3" />
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>
      
      <Separator className="my-4 bg-sidebar-border" />
      
      <Link
        to="/profile"
        className={cn(
          "flex items-center p-3 rounded-lg transition-colors",
          location.pathname === '/profile'
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        <Settings className="h-5 w-5 mr-3" />
        <span className="font-medium">Settings</span>
      </Link>
    </div>
  );
};

export default AdminSidebar;