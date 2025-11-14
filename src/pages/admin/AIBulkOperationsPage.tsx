"use client";

import React, { useState, useMemo } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Package, BookOpen, ArrowLeft, Mic, RefreshCw, CheckCircle, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label'; // ADDED IMPORT
import { useAIAgent } from '@/hooks/useAIAgent';
import { useToast } from '@/hooks/use-toast';
import { createMockProduct } from '@/utils/productUtils';
import { addLedgerTransaction } from '@/utils/ledgerUtils';
import { LedgerTransaction, Product } from '@/types';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

// --- Bulk Product Creation Component ---

const BulkProductCreator: React.FC = () => {
  const { invokeAgent, isLoading, error } = useAIAgent();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('Generate 5 new t-shirt designs: 2 vintage, 3 modern, all under $30.');
  const [generatedProducts, setGeneratedProducts] = useState<Partial<Product>[]>([]);
  const [isListening, setIsListening] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    const result = await invokeAgent(prompt, 'bulk_product_creation');
    
    if (result && 'generatedData' in result) {
      setGeneratedProducts(result.generatedData as Partial<Product>[]);
      // FIX 2 & 9: result now includes message property
      toast({ title: "AI Data Ready", description: result.message }); 
    }
  };
  
  const handleCommit = () => {
    if (generatedProducts.length === 0) return;
    
    let successCount = 0;
    generatedProducts.forEach(p => {
      try {
        // Mock required fields for creation utility
        const productToCreate = {
          ...p,
          name: p.name || 'AI Product',
          sku: p.sku || `AI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          description: p.description || 'AI generated description.',
          // FIX 3 & 4: Use temporary mock properties 'price' and 'stock'
          basePrice: p.price || 10.00, 
          stockQuantity: p.stock || 10, 
          category: p.category || 'General',
          images: [{ large: '/placeholder.svg' }], // Mock image
          customizationOptions: { fonts: [], maxCharacters: 50 },
          printPaths: 1,
          isActive: true,
          tags: [],
        } as Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'variants'>;
        
        createMockProduct(productToCreate);
        successCount++;
      } catch (e) {
        console.error("Failed to commit product:", e);
      }
    });
    
    toast({ title: "Commit Complete", description: `${successCount} products created successfully.` });
    setGeneratedProducts([]);
    setPrompt('');
  };
  
  const handleToggleListening = () => {
    setIsListening(prev => {
      if (!prev) {
        toast({ title: "Voice Input", description: "Listening for product creation prompt... (Mock)", duration: 1500 });
        setTimeout(() => {
          setPrompt("Create 3 new mugs, one red, one blue, one green, all priced at $15.");
          setIsListening(false);
          toast({ title: "Voice Input", description: "Input received. Ready to generate.", duration: 1500 });
        }, 2000);
      }
      return !prev;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <span>Bulk Product Creation</span>
        </CardTitle>
        <CardDescription>Generate multiple product drafts instantly using natural language prompts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {/* FIX 5 & 6: Added Label import */}
          <Label htmlFor="productPrompt">Product Generation Prompt</Label>
          <div className="flex space-x-2">
            <Textarea
              id="productPrompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="e.g., Generate 5 new t-shirt designs: 2 vintage, 3 modern, all under $30."
              disabled={isLoading || isListening}
              className={cn(isListening && "border-red-500 ring-red-500")}
            />
            <Button 
              type="button" 
              size="icon" 
              onClick={handleToggleListening}
              disabled={isLoading}
              className={cn(isListening ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90")}
              title="Voice Input (Mock)"
            >
              <Mic className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="w-full">
          {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
          Generate Product Data
        </Button>
        
        {generatedProducts.length > 0 && (
          <div className="border p-4 rounded-lg space-y-3 bg-yellow-50/50">
            <h4 className="font-semibold">Generated Products ({generatedProducts.length}) - Review before committing:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 max-h-40 overflow-y-auto">
              {generatedProducts.map((p, index) => (
                <li key={index} className="truncate">
                  {p.name} (SKU: {p.sku || 'N/A'}) - {p.price ? `$${p.price.toFixed(2)}` : 'Price N/A'} {/* FIX 7 & 8: Use temporary mock property 'price' */}
                </li>
              ))}
            </ul>
            <Button onClick={handleCommit} className="w-full bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Commit {generatedProducts.length} Products
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// --- Bulk Ledger Update Component ---

const BulkLedgerUpdater: React.FC = () => {
  const { invokeAgent, isLoading, error } = useAIAgent();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('Record a $500 payment received from customer u3 and a $100 payment given to supplier e1.');
  const [generatedTransactions, setGeneratedTransactions] = useState<Partial<LedgerTransaction>[]>([]);
  const [isListening, setIsListening] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    const result = await invokeAgent(prompt, 'bulk_ledger_update');
    
    if (result && 'generatedData' in result) {
      setGeneratedTransactions(result.generatedData as Partial<LedgerTransaction>[]);
      // FIX 9: result now includes message property
      toast({ title: "AI Data Ready", description: result.message }); 
    }
  };
  
  const handleCommit = () => {
    if (generatedTransactions.length === 0) return;
    
    let successCount = 0;
    generatedTransactions.forEach(t => {
      try {
        // Mock required fields for transaction utility
        const transactionToCreate = {
          entityId: t.entityId || 'u3',
          type: t.type || 'we_received',
          itemType: t.itemType || 'cash',
          amount: t.amount || 0,
          details: t.details || 'AI bulk update.',
        } as Omit<LedgerTransaction, 'id' | 'createdAt'>;
        
        addLedgerTransaction(transactionToCreate);
        successCount++;
      } catch (e) {
        console.error("Failed to commit transaction:", e);
      }
    });
    
    toast({ title: "Commit Complete", description: `${successCount} ledger transactions recorded successfully.` });
    setGeneratedTransactions([]);
    setPrompt('');
  };
  
  const handleToggleListening = () => {
    setIsListening(prev => {
      if (!prev) {
        toast({ title: "Voice Input", description: "Listening for ledger update prompt... (Mock)", duration: 1500 });
        setTimeout(() => {
          setPrompt("Record a $200 cash payment received from customer u5 for an order.");
          setIsListening(false);
          toast({ title: "Voice Input", description: "Input received. Ready to generate.", duration: 1500 });
        }, 2000);
      }
      return !prev;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5" />
          <span>Bulk Ledger Updates</span>
        </CardTitle>
        <CardDescription>Record multiple financial transactions (cash/product) using a single prompt.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {/* FIX 10 & 11: Added Label import */}
          <Label htmlFor="ledgerPrompt">Ledger Update Prompt</Label>
          <div className="flex space-x-2">
            <Textarea
              id="ledgerPrompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="e.g., Record a $500 payment received from customer u3 and a $100 payment given to supplier e1."
              disabled={isLoading || isListening}
              className={cn(isListening && "border-red-500 ring-red-500")}
            />
            <Button 
              type="button" 
              size="icon" 
              onClick={handleToggleListening}
              disabled={isLoading}
              className={cn(isListening ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90")}
              title="Voice Input (Mock)"
            >
              <Mic className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="w-full">
          {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
          Generate Transaction Data
        </Button>
        
        {generatedTransactions.length > 0 && (
          <div className="border p-4 rounded-lg space-y-3 bg-yellow-50/50">
            <h4 className="font-semibold">Generated Transactions ({generatedTransactions.length}) - Review before committing:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 max-h-40 overflow-y-auto">
              {generatedTransactions.map((t, index) => (
                <li key={index} className="truncate">
                  {t.type?.replace('_', ' ')} {t.amount?.toFixed(2)} for Entity {t.entityId}
                </li>
              ))}
            </ul>
            <Button onClick={handleCommit} className="w-full bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Commit {generatedTransactions.length} Transactions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


const AIBulkOperationsPage = () => {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <Brain className="h-6 w-6 mr-3 text-purple-500" />
            AI Bulk Operations
          </h1>
          <Button variant="outline" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <p className="text-gray-600 mb-8">Use AI to quickly generate data for products and ledger entries via text or voice prompts.</p>

        <Tabs defaultValue="products">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">
              <Package className="h-4 w-4 mr-2" /> Bulk Products
            </TabsTrigger>
            <TabsTrigger value="ledger">
              <BookOpen className="h-4 w-4 mr-2" /> Bulk Ledger
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="mt-6">
            <BulkProductCreator />
          </TabsContent>
          
          <TabsContent value="ledger" className="mt-6">
            <BulkLedgerUpdater />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AIBulkOperationsPage;