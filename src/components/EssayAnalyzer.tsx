
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { analyzeApplicationMaterial } from '@/lib/openai-service';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const EssayAnalyzer: React.FC = () => {
  const [text, setText] = useState('');
  const [materialType, setMaterialType] = useState<'essay' | 'resume' | 'statementOfPurpose'>('essay');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [grammarIssues, setGrammarIssues] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to analyze', {
        duration: 3000,
      });
      return;
    }

    setIsAnalyzing(true);
    setShowResults(false);

    try {
      const result = await analyzeApplicationMaterial(text, materialType);
      
      setFeedback(result.feedback);
      setGrammarIssues(result.grammarIssues);
      setSuggestions(result.suggestions);
      setShowResults(true);
      
      toast.success('Analysis complete', {
        duration: 3000,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze text. Please try again.', {
        duration: 3000,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="w-full shadow-sm border-[#8EBBFF]/20">
      <CardHeader className="bg-[#F4F5FC] border-b border-[#8EBBFF]/20">
        <CardTitle className="text-xl text-[#24293E]">Application Material Analyzer</CardTitle>
        <CardDescription className="text-[#24293E]/70">
          Get AI-powered feedback on your university application materials
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 pb-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="material-type" className="block text-sm font-medium text-[#24293E]">
              Material Type
            </label>
            <Select
              value={materialType}
              onValueChange={(value) => setMaterialType(value as 'essay' | 'resume' | 'statementOfPurpose')}
            >
              <SelectTrigger id="material-type" className="w-full md:w-[240px]">
                <SelectValue placeholder="Select material type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="essay">College Application Essay</SelectItem>
                <SelectItem value="resume">Student Resume</SelectItem>
                <SelectItem value="statementOfPurpose">Statement of Purpose</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="essay-text" className="block text-sm font-medium text-[#24293E]">
              Enter your text below
            </label>
            <Textarea
              id="essay-text"
              placeholder="Paste your essay, resume, or statement of purpose here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px] resize-y"
            />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end py-4">
        <Button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing || !text.trim()}
          className="bg-[#8EBBFF] hover:bg-[#7DAEFF] text-white"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze'
          )}
        </Button>
      </CardFooter>
      
      {showResults && (
        <div className="px-6 pb-6 pt-2">
          <Card className="bg-white border-[#8EBBFF]/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[#24293E]">Analysis Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-md font-medium text-[#24293E] mb-2">Overall Feedback</h3>
                <p className="text-sm text-[#24293E]/80">{feedback}</p>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-[#24293E] mb-2">Grammar & Style Issues</h3>
                {grammarIssues.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {grammarIssues.map((issue, index) => (
                      <li key={index} className="text-sm text-[#24293E]/80">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>{issue}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-green-600 flex items-center">
                    <Check className="h-4 w-4 mr-2" /> No major grammar issues found
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="text-md font-medium text-[#24293E] mb-2">Suggestions for Improvement</h3>
                {suggestions.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-[#24293E]/80">
                        <div className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{suggestion}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#24293E]/80">No specific suggestions at this time.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
};

export default EssayAnalyzer;
