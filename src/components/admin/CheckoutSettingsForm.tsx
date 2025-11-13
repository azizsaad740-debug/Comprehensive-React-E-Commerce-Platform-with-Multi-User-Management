"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Truck, MessageSquare, PlusCircle, Trash2, Edit, Save, RefreshCw, X } from 'lucide-react';
import { useCheckoutSettingsStore, DeliveryMethod } from '@/stores/checkoutSettingsStore';
import { useToast } from '@/hooks/use-toast';

const DeliveryMethodForm: React.FC<{ 
  initialMethod?: DeliveryMethod; 
  onSave: (method: Partial<DeliveryMethod>) => void; 
  onCancel: () => void; 
}> = ({ initialMethod, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<DeliveryMethod>>(initialMethod || {
    name: '',
    cost: 0,
    estimatedDays: '',
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof DeliveryMethod, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.cost === undefined || !formData.estimatedDays) return;
    
    setIsLoading(true);
    setTimeout(() => {
      onSave({ ...formData, cost: Number(formData.cost) });
      setIsLoading(false);
    }, 300);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg space-y-3 bg-gray-50">
      <h4 className="font-semibold">{initialMethod ? 'Edit Method' : 'Add New Method'}</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="methodName">Name</Label>
          <Input id="methodName" value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cost">Cost ($)</Label>
          <Input id="cost" type="number" step="0.01" min="0" value={formData.cost || 0} onChange={(e) => handleChange('cost', Number(e.target.value))} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimatedDays">Estimated Days</Label>
          <Input id="estimatedDays" value={formData.estimatedDays || ''} onChange={(e) => handleChange('estimatedDays', e.target.value)} required />
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={!!formData.isActive}
            onCheckedChange={(checked) => handleChange('isActive', checked)}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
        <div className="flex space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Method
          </Button>
        </div>
      </div>
    </form>
  );
};


const CheckoutSettingsForm = () => {
  const { 
    currency, 
    currencySymbol, 
    deliveryMethods, 
    isCashOnDeliveryEnabled, 
    thankYouNoteInstruction, 
    updateSettings,
    updateDeliveryMethod,
    addDeliveryMethod,
    deleteDeliveryMethod
  } = useCheckoutSettingsStore();
  
  const { toast } = useToast();
  
  const [localCurrency, setLocalCurrency] = useState(currency);
  const [localSymbol, setLocalSymbol] = useState(currencySymbol);
  const [localThankYouNote, setLocalThankYouNote] = useState(thankYouNoteInstruction);
  const [localCODEnabled, setLocalCODEnabled] = useState(isCashOnDeliveryEnabled);
  
  const [isDeliveryFormOpen, setIsDeliveryFormOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<DeliveryMethod | undefined>(undefined);

  // Sync local state on store changes
  React.useEffect(() => {
    setLocalCurrency(currency);
    setLocalSymbol(currencySymbol);
    setLocalThankYouNote(thankYouNoteInstruction);
    setLocalCODEnabled(isCashOnDeliveryEnabled);
  }, [currency, currencySymbol, thankYouNoteInstruction, isCashOnDeliveryEnabled]);

  const handleSaveGeneral = () => {
    updateSettings({
      currency: localCurrency,
      currencySymbol: localSymbol,
      isCashOnDeliveryEnabled: localCODEnabled,
      thankYouNoteInstruction: localThankYouNote,
    });
    toast({ title: "Settings Saved", description: "General checkout settings updated." });
  };
  
  const handleSaveDeliveryMethod = (methodData: Partial<DeliveryMethod>) => {
    if (methodData.id) {
      updateDeliveryMethod(methodData as DeliveryMethod);
      toast({ title: "Success", description: `Delivery method ${methodData.name} updated.` });
    } else {
      addDeliveryMethod(methodData as Omit<DeliveryMethod, 'id'>);
      toast({ title: "Success", description: `New delivery method ${methodData.name} added.` });
    }
    setIsDeliveryFormOpen(false);
    setEditingMethod(undefined);
  };
  
  const handleDeleteDeliveryMethod = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the delivery method: ${name}?`)) {
      deleteDeliveryMethod(id);
      toast({ title: "Deleted", description: `Delivery method ${name} removed.` });
    }
  };
  
  const handleEditDelivery = (method: DeliveryMethod) => {
    setEditingMethod(method);
    setIsDeliveryFormOpen(true);
  };
  
  const handleNewDelivery = () => {
    setEditingMethod(undefined);
    setIsDeliveryFormOpen(true);
  };
  
  const handleCancelDelivery = () => {
    setIsDeliveryFormOpen(false);
    setEditingMethod(undefined);
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>General Checkout Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency Code (e.g., USD)</Label>
              <Input id="currency" value={localCurrency} onChange={(e) => setLocalCurrency(e.target.value.toUpperCase())} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="symbol">Currency Symbol (e.g., $)</Label>
              <Input id="symbol" value={localSymbol} onChange={(e) => setLocalSymbol(e.target.value)} />
            </div>
            <div className="flex items-center space-x-4 pt-6">
              <Switch
                id="codEnabled"
                checked={localCODEnabled}
                onCheckedChange={setLocalCODEnabled}
              />
              <Label htmlFor="codEnabled">Cash on Delivery (COD)</Label>
            </div>
          </div>
          
          <div className="space-y-2 pt-4">
            <Label htmlFor="thankYouNote" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Order Confirmation Note/Instructions
            </Label>
            <Textarea 
              id="thankYouNote" 
              value={localThankYouNote} 
              onChange={(e) => setLocalThankYouNote(e.target.value)} 
              rows={3}
            />
            <p className="text-xs text-gray-500">This message is displayed on the final order confirmation page.</p>
          </div>
          
          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveGeneral}>
              <Save className="h-4 w-4 mr-2" />
              Save General Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Methods */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Truck className="h-5 w-5" />
            <span>Delivery Methods</span>
          </CardTitle>
          <Button onClick={handleNewDelivery}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Method
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isDeliveryFormOpen && (
            <DeliveryMethodForm 
              initialMethod={editingMethod}
              onSave={handleSaveDeliveryMethod}
              onCancel={handleCancelDelivery}
            />
          )}
          
          <div className="space-y-3">
            {deliveryMethods.map(method => (
              <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Truck className="h-5 w-5 text-gray-500" />
                  <div>
                    <h4 className="font-medium">{method.name}</h4>
                    <p className="text-sm text-gray-500">
                      {localSymbol}{method.cost.toFixed(2)} | {method.estimatedDays}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={method.isActive} 
                    onCheckedChange={(checked) => updateDeliveryMethod({ ...method, isActive: checked })}
                  />
                  <Button variant="outline" size="sm" onClick={() => handleEditDelivery(method)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteDeliveryMethod(method.id, method.name)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutSettingsForm;