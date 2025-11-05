import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

interface ImageGenerationResult {
  imageUrl: string;
  message: string;
}

export const useImageGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();

  const generateImage = async (prompt: string): Promise<ImageGenerationResult | null> => {
    if (!token) {
      setError("Authentication token missing. Please log in.");
      return null;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Note: The function name must match the directory name in supabase/functions/
      const { data, error: invokeError } = await supabase.functions.invoke('generate-image', {
        body: { prompt },
        headers: {
          'Authorization': `Bearer ${token}`,
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