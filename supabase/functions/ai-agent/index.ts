/// <reference lib="deno.ns" />
// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
// @ts-ignore
import { GoogleGenAI } from 'https://esm.sh/@google/genai@0.15.0'; // Real Gemini SDK import

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to call the Gemini API (mocked here)
async function callGemini(prompt: string, taskType: string, context: string) {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (GEMINI_API_KEY) {
        // NOTE: In a real deployment, this would execute the real API call.
        /*
        const ai = new GoogleGenAI(GEMINI_API_KEY);
        const systemInstruction = `You are an expert e-commerce administrator AI. Your task is to fulfill requests of type ${taskType} based on the user prompt and context. Respond only with the requested JSON structure or text. Context: ${context}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: taskType === 'text_generation' ? 'text/plain' : 'application/json',
            }
        });
        
        if (taskType === 'text_generation' || taskType === 'admin_chat') {
            return { generatedText: response.text, message: "Content generated successfully." };
        } else {
            // For bulk operations, parse the expected JSON output
            const jsonText = response.text.trim().replace(/^```json\s*|```\s*$/g, '');
            return { generatedData: JSON.parse(jsonText), message: "Data generated successfully." };
        }
        */
    }
    
    // --- MOCK FALLBACK ---
    switch (taskType) {
      case 'text_generation':
        return {
          generatedText: `AI Generated Content for: "${prompt}". This content is optimized for SEO and readability, focusing on ${context || 'general topics'}. Example: Our new product is revolutionary because of its custom features and high durability.`,
          message: "Text generation simulated successfully. (Requires GEMINI_API_KEY)"
        };
        
      case 'bulk_product_creation':
        return {
          generatedData: [
            { name: "AI T-Shirt", sku: "AI001", price: 25.00, stock: 50, category: "Apparel" },
            { name: "AI Mug", sku: "AI002", price: 15.00, stock: 100, category: "Drinkware" },
          ],
          message: `AI analyzed prompt and generated 2 mock products for creation. (Requires GEMINI_API_KEY)`,
        };
        
      case 'bulk_ledger_update':
        return {
          generatedData: [
            { entityId: "e1", type: "we_received", itemType: "cash", amount: 1000.00, details: "Payment from client batch 1" },
            { entityId: "e2", type: "we_gave", itemType: "cash", amount: 50.00, details: "Shipping fee payment" },
          ],
          message: `AI analyzed prompt and generated 2 mock ledger transactions. (Requires GEMINI_API_KEY)`,
        };
        
      case 'admin_chat':
        return {
          response: `Hello! I am your AI Assistant. Based on your request about "${prompt}", I can tell you that the system is running smoothly. If you need specific data, please use the bulk operations tool. (Requires GEMINI_API_KEY)`,
          message: "Chat response simulated. (Requires GEMINI_API_KEY)"
        };

      default:
        throw new Error(`Unknown task type: ${taskType}`);
    }
}

serve(async (req) => {
  // Handle CORS OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Manual authentication check (required for Edge Functions)
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Missing Authorization header' }), { 
      status: 401, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
  
  try {
    const { prompt, taskType, context } = await req.json();
    
    if (!prompt || !taskType) {
      return new Response(JSON.stringify({ error: 'Prompt and taskType are required' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const result = await callGemini(prompt, taskType, context);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});