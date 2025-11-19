"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, BookOpen, RefreshCw } from 'lucide-react';
import { LedgerEntity } from '@/types';
import { getEntityById } from '@/utils/ledgerUtils';
import EntityLedgerView from '@/components/ledger/EntityLedgerView';
import { useToast } from '@/hooks/use-toast';

const EntityDetailPage = () => {
  const { entityId } = useParams<{ entityId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [entity, setEntity] = useState<LedgerEntity | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (entityId) {
      const fetchedEntity = getEntityById(entityId);
      if (fetchedEntity) {
        setEntity(fetchedEntity);
      } else {
        toast({ title: "Error", description: "Ledger entity not found.", variant: "destructive" });
        navigate('/admin/ledger');
      }
    }
  }, [entityId, refreshKey]);
  
  const handleRefresh = () => {
    // Increment refreshKey to force re-fetch of entity and transactions
    setRefreshKey(prev => prev + 1);
    toast({ title: "Refreshed", description: "Ledger data updated." });
  };

  if (!entity) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <Button variant="outline" onClick={() => navigate('/admin/ledger')} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Ledger
          </Button>
          <Card><CardContent className="p-8 text-center">Loading entity...</CardContent></Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <BookOpen className="h-6 w-6 mr-3" />
            {entity.name} Ledger
          </h1>
          <div className="space-x-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/ledger')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
          </div>
        </div>
        
        <EntityLedgerView 
          entity={entity} 
          onTransactionAdded={handleRefresh}
        />
      </div>
    </AdminLayout>
  );
};

export default EntityDetailPage;