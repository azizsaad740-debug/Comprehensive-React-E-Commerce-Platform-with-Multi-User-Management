"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Edit, Save, RefreshCw, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FaqItem } from '@/types';
import { useContentStore } from '@/stores/contentStore';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface FaqFormProps {
  initialItem?: FaqItem;
  onSave: () => void;
  onCancel: () => void;
}

const FaqForm: React.FC<FaqFormProps> = ({ initialItem, onSave, onCancel }) => {
  const { updateFaqItem, addFaqItem, faqItems } = useContentStore();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<FaqItem>>(initialItem || {
    question: '',
    answer: '',
    sortOrder: faqItems.length + 1,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof FaqItem, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) return;

    setIsLoading(true);
    setTimeout(() => {
      if (initialItem) {
        updateFaqItem(formData as FaqItem);
        toast({ title: "Success", description: "FAQ updated." });
      } else {
        addFaqItem(formData as Omit<FaqItem, 'id'>);
        toast({ title: "Success", description: "New FAQ added." });
      }
      setIsLoading(false);
      onSave();
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg space-y-3 bg-gray-50">
      <h4 className="font-semibold">{initialItem ? 'Edit FAQ' : 'Add New FAQ'}</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="question">Question</Label>
          <Input id="question" value={formData.question || ''} onChange={(e) => handleChange('question', e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input id="sortOrder" type="number" value={formData.sortOrder || 0} onChange={(e) => handleChange('sortOrder', Number(e.target.value))} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="answer">Answer</Label>
        <Textarea id="answer" value={formData.answer || ''} onChange={(e) => handleChange('answer', e.target.value)} rows={4} required />
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save FAQ
        </Button>
      </div>
    </form>
  );
};


const FaqManagement: React.FC = () => {
  const { faqItems, deleteFaqItem } = useContentStore();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FaqItem | undefined>(undefined);

  const handleNew = () => {
    setEditingItem(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (item: FaqItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string, question: string) => {
    if (window.confirm(`Are you sure you want to delete FAQ: "${question}"?`)) {
      deleteFaqItem(id);
      toast({ title: "Deleted", description: "FAQ item removed." });
    }
  };
  
  const handleSave = () => {
    setIsFormOpen(false);
    setEditingItem(undefined);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <HelpCircle className="h-5 w-5" />
          <span>FAQ Management ({faqItems.length})</span>
        </CardTitle>
        <Button onClick={handleNew}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New FAQ
        </Button>
      </CardHeader>
      <CardContent>
        {isFormOpen && (
          <div className="mb-6">
            <FaqForm 
              initialItem={editingItem} 
              onSave={handleSave} 
              onCancel={() => setIsFormOpen(false)} 
            />
          </div>
        )}
        
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map(item => (
            <AccordionItem key={item.id} value={item.id}>
              <div className="flex items-center justify-between pr-4 border rounded-lg mb-2">
                <AccordionTrigger className="flex-1">{item.question}</AccordionTrigger>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id, item.question)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <AccordionContent className="p-4 bg-gray-50 rounded-b-lg">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default FaqManagement;