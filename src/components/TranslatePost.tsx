
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { translateText } from '@/lib/openai-service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface TranslatePostProps {
  content: string;
  onTranslated?: (translatedContent: string) => void;
}

const TranslatePost: React.FC<TranslatePostProps> = ({ content, onTranslated }) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [isTranslated, setIsTranslated] = useState(false);

  const handleTranslate = async () => {
    if (!content || isTranslating) return;
    
    try {
      setIsTranslating(true);
      
      const translatedContent = await translateText(content, targetLanguage);
      
      if (onTranslated) {
        onTranslated(translatedContent);
        setIsTranslated(true);
        
        toast.success(`Post translated to ${targetLanguage}`, {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Failed to translate content', {
        duration: 3000,
      });
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Translate to:</span>
      <Select 
        value={targetLanguage} 
        onValueChange={setTargetLanguage}
        disabled={isTranslating}
      >
        <SelectTrigger className="h-7 w-[100px] text-xs">
          <SelectValue placeholder="English" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="English">English</SelectItem>
          <SelectItem value="Spanish">Spanish</SelectItem>
          <SelectItem value="French">French</SelectItem>
          <SelectItem value="German">German</SelectItem>
          <SelectItem value="Chinese">Chinese</SelectItem>
          <SelectItem value="Japanese">Japanese</SelectItem>
          <SelectItem value="Korean">Korean</SelectItem>
          <SelectItem value="Arabic">Arabic</SelectItem>
          <SelectItem value="Hindi">Hindi</SelectItem>
          <SelectItem value="Russian">Russian</SelectItem>
        </SelectContent>
      </Select>
      
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs"
        onClick={handleTranslate}
        disabled={isTranslating || (isTranslated && targetLanguage === 'English')}
      >
        {isTranslating ? (
          <>
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Translating...
          </>
        ) : isTranslated ? (
          "Translated"
        ) : (
          "Translate"
        )}
      </Button>
    </div>
  );
};

export default TranslatePost;
