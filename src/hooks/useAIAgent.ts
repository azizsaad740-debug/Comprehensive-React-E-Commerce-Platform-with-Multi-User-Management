import { useState } from 'react';
import { supabaseFunctionsClient } from '@/integrations/supabase/functionsClient';
import { useAuthStore } from '@/stores/authStore';
import { LedgerTransaction, Product } from '@/types';

type AITaskType = 'text_generation' | 'bulk_product_creation' | 'bulk_ledger_update' | 'admin_chat';

interface AITextResult {
  generatedText: string;
}

interface AIDataResult {
  generatedData: Array<Partial<Product> | Partial<LedgerTransaction>>;
  message: string; // Added message property
}

interface AIChatResult {
  response: string;
}

type AIResult = AITextResult | AIDataResult | AIChatResult;

export const useAIAgent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const invokeAgent = async (
    prompt: string, 
    taskType: AITaskType, 
    context?: string
  ): Promise<AIResult | null> => {
    if (!user?.id) {
      setError("Authentication required. Please log in.");
      return null;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabaseFunctionsClient.functions.invoke('ai-agent', {
        body: { prompt, taskType, context },
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'Content-Type': 'application/json',
        },
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }

      return data as AIResult;

    } catch (err: any) {
      console.error("AI Agent Failed:", err);
      setError(err.message || "Failed to process AI request.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { invokeAgent, isLoading, error, setError }; // Export setError
};