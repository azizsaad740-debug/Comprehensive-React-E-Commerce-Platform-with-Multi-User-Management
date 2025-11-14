"use client";

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { useBrandingStore } from '@/stores/brandingStore';
import { ThemeToggle } from './ThemeToggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

const Header = () => {
  const navigate = useNavigate();
  const { getTotalItems } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { appName } = useBrandingStore();
  const totalItems = getTotalItems();

  const isDashboardUser = isAuthenticated && (user?.role === 'admin' || user?.role === 'reseller' || user?.role === 'superuser');

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const handleSearchClick = () => {
    // Navigate to product catalog, potentially triggering a search UI element there
    navigate('/products?search=true');
  };
  
  // Mobile Navigation Content (inside the Sheet)
  const MobileNavContent = (
    <div className="flex flex-col space-y-6 p-6 pt-10">
      {/* Theme Toggle */}
      <div className="flex items-center justify-between border-b pb-4">
        <span className="font-medium text-lg">Toggle Theme</span>
        <ThemeToggle />
      </div>
      
      {/* User Info / Login */}
      <div className="space-y-2 border-b pb-4">
        {isAuthenticated ? (
          <>
            <p className="text-lg font-semibold">Hello, {user?.name}</p>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/profile')}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/orders')}>
              My Orders
            </Button>
            {user?.role === 'reseller' && (
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/reseller/dashboard')}>
                Reseller Dashboard
              </Button>
            )}
            {(user?.role === 'admin' || user?.role === 'superuser') && (
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin')}>
                Admin Panel
              </Button>
            )}
            <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </>
        ) : (
          <Button 
            className="w-full"
            onClick={() => navigate('/auth/login')}
          >
            Login / Register
          </Button>
        )}
      </div>
      
      {/* Main Navigation Links (Only for non-dashboard users) */}
      {!isDashboardUser && (
        <nav className="flex flex-col space-y-2">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">Navigation</h3>
          <Link to="/products" className="text-gray-600 hover:text-gray-900 font-medium transition-colors dark:text-muted-foreground dark:hover:text-foreground p-2">
            Products
          </Link>
          <Link to="/categories" className="text-gray-600 hover:text-gray-900 font-medium transition-colors dark:text-muted-foreground dark:hover:text-foreground p-2">
            Categories
          </Link>
          <Link to="/about" className="text-gray-600 hover:text-gray-900 font-medium transition-colors dark:text-muted-foreground dark:hover:text-foreground p-2">
            About
          </Link>
          <Link to="/contact" className="text-gray-600 hover:text-gray-900 font-medium transition-colors dark:text-muted-foreground dark:hover:text-foreground p-2">
            Contact
          </Link>
        </nav>
      )}
      
      {/* Removed Mobile Search Input Field */}
    </div>
  );


  return (
    <header className="bg-white shadow-sm border-b dark:bg-card dark:border-border">
      <div className="container mx-auto px-4">
        {/* Main Header Row: Relative positioning for mobile centering */}
        <div className="flex items-center justify-between h-16 relative">
          
          {/* Logo (Centered on mobile, left on desktop) */}
          <div className="absolute left-1/2 transform -translate-x-1/2 md:static md:translate-x-0">
            <Link to="/" className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-primary">{appName}</h1>
            </Link>
          </div>

          {/* Desktop Navigation Links (Hidden for Dashboard Users) */}
          {!isDashboardUser && (
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                to="/products" 
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors dark:text-muted-foreground dark:hover:text-foreground"
              >
                Products
              </Link>
              <Link 
                to="/categories" 
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors dark:text-muted-foreground dark:hover:text-foreground"
              >
                Categories
              </Link>
              <Link 
                to="/about" 
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors dark:text-muted-foreground dark:hover:text-foreground"
              >
                About
              </Link>
            </nav>
          )}

          {/* Search Bar (Desktop only, Hidden for Dashboard Users) */}
          {!isDashboardUser && (
            <div className="flex-1 max-w-md mx-8 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  type="text" 
                  placeholder="Search products..." 
                  className="pl-10"
                />
              </div>
            </div>
          )}
          
          {/* Spacer for Dashboard Users (Desktop only) */}
          {isDashboardUser && <div className="flex-1 max-w-md mx-8 hidden md:block"></div>}


          {/* Right Navigation (Always visible, contains Cart + Desktop User/Theme + Mobile Menu) */}
          <div className="flex items-center space-x-2 md:space-x-4">
            
            {/* Desktop Theme Toggle & User Menu (Hidden on mobile) */}
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:block">{user?.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/orders')}>
                      My Orders
                    </DropdownMenuItem>
                    {user?.role === 'reseller' && (
                      <DropdownMenuItem onClick={() => navigate('/reseller/dashboard')}>
                        Reseller Dashboard
                      </DropdownMenuItem>
                    )}
                    {(user?.role === 'admin' || user?.role === 'superuser') && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  size="sm"
                  onClick={() => navigate('/auth/login')}
                >
                  Login
                </Button>
              )}
            </div>
            
            {/* Mobile Search Icon (NEW) - Order 1 (Leftmost on right side) */}
            {!isDashboardUser && (
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSearchClick}
                    className="relative md:hidden w-9 px-0"
                >
                    <Search className="h-5 w-5" />
                </Button>
            )}
            
            {/* Cart (Order 2) */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/cart')}
              className="relative w-9 px-0"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {totalItems}
                </Badge>
              )}
            </Button>

            {/* Mobile Hamburger Menu (Order 3 - Rightmost on right side) */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-9 px-0">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64 p-0">
                  {MobileNavContent}
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;