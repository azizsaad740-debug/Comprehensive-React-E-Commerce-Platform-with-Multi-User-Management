"use client";

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, ArrowRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

const AdminLoginGate = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Automatically redirect to the dedicated login page
    navigate('/admincpanelaccess/login', { replace: true });
  }, [navigate]);

  return (
    <Layout>
      <div className="min-h-[calc(100vh-128px)] flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <Lock className="h-10 w-10 text-primary mx-auto mb-2" />
            <CardTitle className="text-2xl">Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Redirecting to the secure administration login page...</p>
            <Button onClick={() => navigate('/admincpanelaccess/login')}>
              Continue to Login <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminLoginGate;