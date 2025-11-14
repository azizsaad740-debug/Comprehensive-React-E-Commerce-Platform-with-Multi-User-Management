"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, RefreshCw, Send, Brain, Mic, Volume2, VolumeX } from 'lucide-react';
import { useAIAgent } from '@/hooks/useAIAgent';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '../ui/card';

type AITaskType = 'text_generation' | 'admin_chat';

interface AIPopupAgentProps {
  isOpen: boolean;
  onClose: () => void;
  taskType: AITaskType;
  initialPrompt?: string;
  context?: string; // e.g., 'product description', 'static page content'
  onTextGenerated?: (text: string) => void;
}

const AIPopupAgent: React.FC<AIPopupAgentProps> = ({
  isOpen,
  onClose,
  taskType,
  initialPrompt = '',
  context,
  onTextGenerated,
}) => {
  const { invokeAgent, isLoading, error, setError } = useAIAgent(); // Destructure setError
  const { toast } = useToast();
  
  const [prompt, setPrompt] = useState(initialPrompt);
  const [response, setResponse] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPrompt(initialPrompt);
      setResponse('');
      setError(null);
    }
  }, [isOpen, initialPrompt, setError]); // Added setError to dependency array
  
  useEffect(() => {
    if (error) {
      toast({ title: "AI Error", description: error, variant: "destructive" });
    }
  }, [error, toast]);

  const handleSend = async () => {
    if (!prompt.trim()) return;

    const result = await invokeAgent(prompt, taskType, context);

    if (result && 'generatedText' in result) {
      setResponse(result.generatedText);
      if (onTextGenerated) {
        // Note: We don't call onTextGenerated here, we wait for the user to click "Use Generated Text"
      }
    } else if (result && 'response' in result) {
      setResponse(result.response);
    }
  };
  
  // Mock Voice Input/Output
  const handleToggleListening = () => {
    setIsListening(prev => {
      if (!prev) {
        // Simulate listening
        toast({ title: "Voice Input", description: "Listening... (Mock)", duration: 1500 });
        setTimeout(() => {
          setPrompt("Generate a compelling product description for a custom engraved wooden watch.");
          setIsListening(false);
          toast({ title: "Voice Input", description: "Input received. Ready to send.", duration: 1500 });
        }, 2000);
      }
      return !prev;
    });
  };
  
  const handleToggleSpeaking = () => {
    if (isSpeaking) {
      // Stop speaking (Mock)
      setIsSpeaking(false);
    } else if (response) {
      // Start speaking (Mock)
      setIsSpeaking(true);
      toast({ title: "AI Voice", description: "AI is speaking the response... (Mock)", duration: 2000 });
      setTimeout(() => setIsSpeaking(false), 2000);
    }
  };

  const title = taskType === 'text_generation' ? `Generate ${context || 'Content'}` : 'Admin AI Chat Agent';
  const placeholder = taskType === 'text_generation' ? 'Enter prompt (e.g., "Write a description for a custom t-shirt")' : 'Ask the AI about system progress or data...';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <span>{title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Input Area */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Your Prompt</Label>
            <div className="flex space-x-2">
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={taskType === 'admin_chat' ? 3 : 5}
                placeholder={placeholder}
                disabled={isLoading || isListening}
                className={cn(isListening && "border-red-500 ring-red-500")}
              />
              <div className="flex flex-col space-y-2">
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
                <Button 
                  type="button" 
                  size="icon" 
                  onClick={handleSend}
                  disabled={isLoading || !prompt.trim()}
                  title="Send Prompt"
                >
                  {isLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Response Area */}
          {response && (
            <Card className="bg-gray-50 dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                <Label className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>AI Response</span>
                </Label>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleToggleSpeaking}
                  disabled={isSpeaking}
                  title="Read Aloud (Mock)"
                >
                  {isSpeaking ? <VolumeX className="h-4 w-4 text-red-500" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Textarea
                  value={response}
                  rows={taskType === 'admin_chat' ? 5 : 10}
                  readOnly
                  className="font-sans text-sm bg-transparent border-none resize-none"
                />
              </CardContent>
            </Card>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-2 border-t">
            {taskType === 'text_generation' && onTextGenerated && response && (
              <Button 
                variant="secondary" 
                onClick={() => {
                  onTextGenerated(response);
                  onClose();
                }}
              >
                Use Generated Text
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIPopupAgent;