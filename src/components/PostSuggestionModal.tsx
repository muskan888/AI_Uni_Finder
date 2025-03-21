
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { generatePostSuggestion } from '@/lib/openai-service';

interface PostSuggestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplySuggestion: (title: string, content: string) => void;
}

const PostSuggestionModal: React.FC<PostSuggestionModalProps> = ({ 
  open, 
  onOpenChange,
  onApplySuggestion
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState<{ title: string, content: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSuggestion = async () => {
    if (!prompt.trim()) {
      setError('Please enter a topic to generate suggestions');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      
      const result = await generatePostSuggestion(prompt);
      setSuggestion(result);
    } catch (err) {
      console.error('Error generating suggestion:', err);
      setError('Failed to generate suggestion. Please check your API key or try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplySuggestion = () => {
    if (suggestion) {
      onApplySuggestion(suggestion.title, suggestion.content);
      onOpenChange(false);
      setSuggestion(null);
      setPrompt('');
    }
  };

  const resetModal = () => {
    setSuggestion(null);
    setPrompt('');
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) resetModal();
      onOpenChange(value);
    }}>
      <DialogContent className="bg-[#F4F5FC] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[#24293E] text-xl">Suggest a Post</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          {!suggestion ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-[#24293E]">
                  What would you like to post about?
                </Label>
                <Input
                  id="prompt"
                  placeholder="e.g., visa tips for Indiana University, housing advice near campus"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="border-[#8EBBFF]/30"
                />
                <p className="text-xs text-[#24293E]/70">
                  Enter a topic and we'll generate a helpful post title and content
                </p>
              </div>
              
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              
              <Button 
                onClick={handleGenerateSuggestion} 
                className="bg-[#8EBBFF] hover:bg-[#7DAEFF] text-white font-['Montserrat'] text-[14px] w-full"
                disabled={isGenerating || !prompt.trim()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Suggestion'
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[#24293E]">Suggested Title</Label>
                <div className="p-3 bg-white/70 rounded-md border border-[#8EBBFF]/30 font-['Playfair Display'] text-[20px] text-[#24293E]">
                  {suggestion.title}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[#24293E]">Suggested Content</Label>
                <div className="p-3 bg-white/70 rounded-md border border-[#8EBBFF]/30 font-['Montserrat'] text-[14px] text-[#24293E] max-h-[300px] overflow-y-auto">
                  {suggestion.content}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setSuggestion(null)}
                >
                  Start Over
                </Button>
                <Button 
                  className="bg-[#8EBBFF] hover:bg-[#7DAEFF] text-white"
                  onClick={handleApplySuggestion}
                >
                  Use This Suggestion
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostSuggestionModal;
