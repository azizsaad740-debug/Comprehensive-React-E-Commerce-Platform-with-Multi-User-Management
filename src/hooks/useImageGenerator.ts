import { useState } from 'react';
import { supabaseFunctionsClient } from '@/integrations/supabase/functionsClient';
import { useAuthStore } from '@/stores/authStore';

interface ImageGenerationResult {
  imageUrl: string;
  message: string;
}

export const useImageGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const generateImage = async (prompt: string): Promise<ImageGenerationResult | null> => {
    if (!user?.id) {
      setError("Authentication required. Please log in.");
      return null;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Note: The function name must match the directory name in supabase/functions/
      const { data, error: invokeError } = await supabaseFunctionsClient.functions.invoke('generate-image', {
        body: { prompt },
        headers: {
          // Pass user ID as a mock token for authorization check in the Edge Function
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

      return data as ImageGenerationResult;

    } catch (err: any) {
      console.error("AI Image Generation Failed:", err);
      setError(err.message || "Failed to generate image.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { generateImage, isLoading, error };
};