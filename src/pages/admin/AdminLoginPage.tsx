"use client";

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, Shield, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useBrandingStore } from '@/stores/brandingStore';

function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, user } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { appName } = useBrandingStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password); 
      
      // After successful login, check if the user has admin/reseller/counter role
      const loggedInUser = useAuthStore.getState().user;
      
      if (loggedInUser && ['admin', 'superuser', 'reseller', 'counter'].includes(loggedInUser.role)) {
        toast({
          title: "Success",
          description: `Welcome back, ${loggedInUser.name}!`,
        });
        // Redirect based on role
        if (loggedInUser.role === 'reseller') {
            navigate('/reseller/dashboard');
        } else {
            navigate('/admin');
        }
      } else {
        // Logged in but not authorized for admin panel access
        useAuthStore.getState().logout(); // Force logout
        toast({
          title: "Access Denied",
          description: "Your account does not have administrative privileges.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid credentials or network error.",
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
            <Shield className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <CardTitle className="text-2xl font-bold text-center">Admin Panel Login</CardTitle>
            <CardDescription className="text-center">
              Use your administrative credentials to access the control panel.
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
                    placeholder="Admin email"
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
                    placeholder="Password"
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
                className="w-full bg-red-600 hover:bg-red-700" 
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 'Secure Sign in'}
              </Button>
            </form>
            
            <div className="mt-4 text-center text-sm text-gray-600">
              <Link to="/auth/login" className="text-primary hover:underline font-medium">
                Back to Customer Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default AdminLoginPage;