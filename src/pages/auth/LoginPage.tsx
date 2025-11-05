"use client";

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useBrandingStore } from '@/stores/brandingStore';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { appName } = useBrandingStore();

  const query = new URLSearchParams(location.search);
  const referralId = query.get('ref');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password, referralId || undefined);
      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
      // Navigate to the root, which will be handled by ProtectedRoute/App.tsx
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Admin login helper
  const handleAdminLogin = async () => {
    setEmail('admin@example.com');
    setPassword('admin123');
    setIsLoading(true);

    try {
      await login('admin@example.com', 'admin123');
      toast({
        title: "Admin Login Success",
        description: "Welcome back, Admin!",
      });
      // Navigate directly to admin dashboard after successful login
      navigate('/admin');
    } catch (error) {
      toast({
        title: "Admin Login Failed",
        description: "Admin credentials not working. Please check the database setup.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Sign in to {appName}</CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
            
            <div className="mt-4 space-y-3">
              <div className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to="/auth/register" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </div>
              
              {/* Admin Quick Login */}
              <div className="border-t pt-3">
                <p className="text-xs text-gray-500 text-center mb-2">Testing Admin Access</p>
                <Button 
                  variant="outline" 
                  className="w-full text-sm" 
                  onClick={handleAdminLogin}
                  disabled={isLoading}
                >
                  🔑 Quick Admin Login (Test Only)
                </Button>
                <p className="text-xs text-gray-400 text-center mt-1">
                  Email: admin@example.com | Password: admin123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default LoginPage;