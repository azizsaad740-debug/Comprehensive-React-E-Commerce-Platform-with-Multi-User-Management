"use client";

import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Upload, Download, Cloud, Link, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Mock data structure for the entire application state (simplified)
interface AppDataBackup {
  version: string;
  timestamp: string;
  data: {
    users: number;
    products: number;
    orders: number;
    ledger: number;
  };
}

const mockBackupData: AppDataBackup = {
  version: '1.0.0',
  timestamp: new Date().toISOString(),
  data: {
    users: 10,
    products: 5,
    orders: 20,
    ledger: 50,
  },
};

const DataManagementPage = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDriveAttached, setIsDriveAttached] = useState(false);
  const [lastBackup, setLastBackup] = useState<AppDataBackup | null>(mockBackupData);

  // --- Local Backup/Restore ---
  
  const handleLocalBackup = () => {
    setIsProcessing(true);
    setTimeout(() => {
      // Simulate generating a JSON file containing all mock data stores
      const backupJson = JSON.stringify(mockBackupData, null, 2);
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `misali_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setLastBackup(mockBackupData);
      setIsProcessing(false);
      toast({ title: "Backup Complete", description: "Data downloaded successfully in custom JSON format." });
    }, 1000);
  };

  const handleLocalRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const restoredData: AppDataBackup = JSON.parse(content);
        
        // Simulate restoring data (e.g., replacing mock stores)
        console.log("Simulating data restore:", restoredData);
        
        setLastBackup(restoredData);
        setIsProcessing(false);
        toast({ title: "Restore Complete", description: `Data restored from file. Version: ${restoredData.version}` });
      } catch (error) {
        setIsProcessing(false);
        toast({ title: "Restore Failed", description: "Invalid file format or corrupted data.", variant: "destructive" });
      }
    };
    
    reader.readAsText(file);
  };

  // --- Google Drive Integration (Mock) ---
  
  const handleAttachDrive = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsDriveAttached(true);
      setIsProcessing(false);
      toast({ title: "Success", description: "Google Drive attached successfully (Mock)." });
    }, 1500);
  };
  
  const handleDriveBackup = () => {
    if (!isDriveAttached) {
      toast({ title: "Error", description: "Please attach Google Drive first.", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setLastBackup(mockBackupData);
      setIsProcessing(false);
      toast({ title: "Cloud Backup Complete", description: "Data backed up to Google Drive (Mock)." });
    }, 1500);
  };
  
  const handleDriveRestore = () => {
    if (!isDriveAttached) {
      toast({ title: "Error", description: "Please attach Google Drive first.", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setLastBackup(mockBackupData);
      setIsProcessing(false);
      toast({ title: "Cloud Restore Complete", description: "Data restored from latest Google Drive backup (Mock)." });
    }, 1500);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <Database className="h-6 w-6 mr-3" />
            Data Management & Backup
          </h1>
        </div>
        <p className="text-gray-600 mb-8">Manage backups, restore points, and external cloud storage integrations.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Local Backup/Restore */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Local Backup & Restore</CardTitle>
              <CardDescription>Download a complete backup file or restore data from a local file.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Backup Data</h3>
                <Button onClick={handleLocalBackup} disabled={isProcessing}>
                  {isProcessing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  Download Backup (.json)
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Restore Data</h3>
                <Label htmlFor="restore-file" className="cursor-pointer">
                  <Button asChild disabled={isProcessing}>
                    <span className="flex items-center">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload & Restore
                    </span>
                  </Button>
                  <Input 
                    id="restore-file" 
                    type="file" 
                    accept=".json" 
                    className="hidden" 
                    onChange={handleLocalRestore}
                    disabled={isProcessing}
                  />
                </Label>
              </div>
              
              {lastBackup && (
                <div className="p-4 bg-gray-50 rounded-lg text-sm">
                  <p className="font-medium mb-1">Last Backup Details:</p>
                  <p>Timestamp: {new Date(lastBackup.timestamp).toLocaleString()}</p>
                  <p>Version: {lastBackup.version}</p>
                  <p>Entities: {lastBackup.data.users} Users, {lastBackup.data.products} Products, {lastBackup.data.orders} Orders</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Google Drive Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cloud className="h-5 w-5 text-blue-500" />
                <span>Google Drive Integration</span>
              </CardTitle>
              <CardDescription>Automate backups to your linked Google Drive account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isDriveAttached ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-green-600 font-medium">
                    <CheckCircle className="h-5 w-5" />
                    <span>Drive Attached (misali-backup@gmail.com)</span>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={handleDriveBackup} 
                    disabled={isProcessing}
                  >
                    {isProcessing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                    Backup to Drive
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleDriveRestore} 
                    disabled={isProcessing}
                  >
                    {isProcessing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                    Restore from Drive
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-red-500 font-medium">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Drive Not Attached</span>
                  </div>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                    onClick={handleAttachDrive} 
                    disabled={isProcessing}
                  >
                    {isProcessing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Link className="h-4 w-4 mr-2" />}
                    Attach Google Drive
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DataManagementPage;