"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, ShoppingBag, DollarSign, Settings, Tag, Palette, Plug } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard-placeholder', // Placeholder, will be replaced dynamically
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
    title: 'Theme Editor',
    href: '/admin/theme',
    icon: Palette,
    roles: ['admin'],
  },
  {
    title: 'Plugins',
    href: '/admin/plugins',
    icon: Plug,
    roles: ['admin'],
  },
  {
    title: 'My Customers',
    href: '/reseller/customers',
    icon: Users,
    roles: ['reseller'],
  },
  {
    title: 'My Promo Codes',
    href: '/reseller/promocodes',
    icon: Tag,
    roles: ['reseller'],
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
    // Dynamically set the correct dashboard link
    if (item.title === 'Dashboard') {
      const dashboardHref = userRole === 'reseller' ? '/reseller/dashboard' : '/admin';
      return { ...item, href: dashboardHref };
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