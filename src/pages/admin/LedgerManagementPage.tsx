"use client";

import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, RefreshCw, Save, X } from 'lucide-react';
import { LedgerEntity, LedgerEntityType } from '@/types';
import { 
  getAllLedgerEntities, 
  addExternalEntity, 
  updateExternalEntity,
  deleteExternalEntity
} from '@/utils/ledgerUtils';
import LedgerDashboard from '@/components/ledger/LedgerDashboard.tsx';
import EntityList from '@/components/ledger/EntityList.tsx';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import EntityLedgerView from '@/components/ledger/EntityLedgerView'; // FIX 2

// --- External Entity Form Component (Internal to Page) ---

interface ExternalEntityFormProps {
  initialEntity?: LedgerEntity;
  onSave: (data: Omit<LedgerEntity, 'id' | 'linkedId'>) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const externalEntityTypes: LedgerEntityType[] = ['supplier', 'other'];

const ExternalEntityForm: React.FC<ExternalEntityFormProps> = ({ initialEntity, onSave, onCancel, isSaving }) => {
  const [formData, setFormData] = useState<Partial<LedgerEntity>>(initialEntity || {
    name: '',
    contact: '',
    type: 'supplier',
  });

  const handleChange = (field: keyof LedgerEntity, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contact || !formData.type) return;
    
    onSave(formData as Omit<LedgerEntity, 'id' | 'linkedId'>);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="space-y-2">
        <Label htmlFor="name">Entity Name</Label>
        <Input id="name" value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact">Contact Email/Phone</Label>
        <Input id="contact" value={formData.contact || ''} onChange={(e) => handleChange('contact', e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Entity Type</Label>
        <Select 
          value={formData.type} 
          onValueChange={(val: LedgerEntityType) => handleChange('type', val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {externalEntityTypes.map(type => (
              <SelectItem key={type} value={type} className="capitalize">
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          <X className="h-4 w-4 mr-2" /> Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {initialEntity ? 'Update Entity' : 'Create Entity'}
        </Button>
      </div>
    </form>
  );
};

// --- Main Page Component ---

const LedgerManagementPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [entities, setEntities] = useState<LedgerEntity[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [isExternalFormOpen, setIsExternalFormOpen] = useState(false);
  const [isSavingExternal, setIsSavingExternal] = useState(false);

  useEffect(() => {
    const allEntities = getAllLedgerEntities();
    setEntities(allEntities);
    
    // Select the first entity by default on desktop
    if (!isMobile && !selectedEntityId && allEntities.length > 0) {
      setSelectedEntityId(allEntities[0].id);
    }
  }, [refreshKey, isMobile]);

  const selectedEntity = useMemo(() => {
    return entities.find(e => e.id === selectedEntityId);
  }, [entities, selectedEntityId]);
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  const handleSelectEntity = (entityId: string) => {
    if (isMobile) {
      // On mobile, navigate to the detail page
      navigate(`/admin/ledger/${entityId}`);
    } else {
      // On desktop, update the selected entity in the same view
      setSelectedEntityId(entityId);
    }
  };
  
  const handleSaveExternalEntity = (data: Omit<LedgerEntity, 'id' | 'linkedId'>) => {
    setIsSavingExternal(true);
    
    setTimeout(() => {
      let result: LedgerEntity | undefined;
      
      if (selectedEntityId && selectedEntity?.type !== 'customer' && selectedEntity?.type !== 'reseller') {
        // Update existing external entity
        result = updateExternalEntity({ ...data, id: selectedEntityId });
      } else {
        // Create new external entity
        result = addExternalEntity(data);
      }
      
      if (result) {
        toast({ title: "Success", description: `${result.name} saved.` });
        handleRefresh();
        setSelectedEntityId(result.id);
        setIsExternalFormOpen(false);
      } else {
        toast({ title: "Error", description: "Failed to save entity.", variant: "destructive" });
      }
      setIsSavingExternal(false);
    }, 500);
  };
  
  const handleDeleteExternalEntity = (entityId: string, entityName: string) => {
    if (window.confirm(`Are you sure you want to delete the external entity: ${entityName}? This will not delete associated transactions.`)) {
      setTimeout(() => {
        if (deleteExternalEntity(entityId)) {
          toast({ title: "Deleted", description: `${entityName} removed from ledger entities.` });
          
          if (selectedEntityId === entityId) {
            setSelectedEntityId(null);
          }
          handleRefresh();
        } else {
          toast({ title: "Error", description: "Failed to delete entity.", variant: "destructive" });
        }
      }, 300);
    }
  };
  
  const handleOpenExternalForm = () => {
    setSelectedEntityId(null); // Clear selection when adding new
    setIsExternalFormOpen(true);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <BookOpen className="h-6 w-6 mr-3" />
            Ledger Management
          </h1>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
        <p className="text-gray-600 mb-8">Track financial transactions (cash/product) with customers, resellers, suppliers, and other entities.</p>

        {/* Overall Dashboard Summary (Always visible) */}
        <LedgerDashboard onRefresh={handleRefresh} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column: Entity List (Full width on mobile) */}
          <div className={isMobile ? "lg:col-span-3" : "lg:col-span-1"}>
            <EntityList 
              entities={entities} 
              selectedEntityId={selectedEntityId} 
              onSelectEntity={handleSelectEntity}
              onAddExternalEntity={handleOpenExternalForm}
              onDeleteExternalEntity={handleDeleteExternalEntity}
            />
          </div>

          {/* Right Column: Ledger View (Hidden on mobile, shown in detail page) */}
          {!isMobile && (
            <div className="lg:col-span-2">
              {selectedEntity ? (
                <EntityLedgerView 
                  entity={selectedEntity} 
                  onTransactionAdded={handleRefresh}
                />
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center p-12">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Select an entity from the list to view or add transactions.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* External Entity Form Dialog */}
      <Dialog open={isExternalFormOpen} onOpenChange={setIsExternalFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New External Entity</DialogTitle>
          </DialogHeader>
          <ExternalEntityForm
            onSave={handleSaveExternalEntity}
            onCancel={() => setIsExternalFormOpen(false)}
            isSaving={isSavingExternal}
          />
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default LedgerManagementPage;