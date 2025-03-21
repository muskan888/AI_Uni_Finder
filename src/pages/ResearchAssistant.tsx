import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  ArrowLeft, 
  Search, 
  File, 
  FileText, 
  Database, 
  Quote,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import ApiKeySetup from '@/components/ApiKeySetup';

interface ResearchTaskProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

const ResearchTask: React.FC<ResearchTaskProps> = ({ icon, title, description, onClick }) => (
  <Button
    variant="outline"
    className="h-auto flex flex-col items-start p-6 gap-4 hover:border-primary/50 hover:bg-primary/5 hover:shadow-md transition-all"
    onClick={onClick}
  >
    <div className="bg-primary/10 p-3 rounded-md">{icon}</div>
    <div className="text-left space-y-2 w-full">
      <h3 className="font-semibold text-lg break-words">{title}</h3>
      <p className="text-sm text-muted-foreground break-words">{description}</p>
    </div>
  </Button>
);

const ResearchAssistant = () => {
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [citationStyle, setCitationStyle] = useState('APA');
  const [context, setContext] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTaskSelect = (task: string) => {
    setSelectedTask(task);
    setResult(null);
  };

  const handleBack = () => {
    if (selectedTask) {
      setSelectedTask(null);
      setResult(null);
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic) {
      toast.error('Please enter a topic');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai-services?service=research-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task: selectedTask,
          topic,
          citationStyle,
          context
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get research response');
      }
      
      const data = await response.json();
      setResult(data.response);
      
      toast.success('Research assistant responded!');
    } catch (error) {
      console.error('Error with research assistant:', error);
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-10">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-display font-bold">Research Assistant</h1>
        </div>
        
        <div className="mb-8">
          <ApiKeySetup />
        </div>
        
        {!selectedTask ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">What would you like help with?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ResearchTask
                icon={<Lightbulb className="h-6 w-6 text-primary" />}
                title="Topic Ideas"
                description="Generate researchable topic ideas related to your subject area"
                onClick={() => handleTaskSelect('topic-ideas')}
              />
              
              <ResearchTask
                icon={<FileText className="h-6 w-6 text-primary" />}
                title="Article Summary"
                description="Summarize academic articles while preserving key information"
                onClick={() => handleTaskSelect('article-summary')}
              />
              
              <ResearchTask
                icon={<Database className="h-6 w-6 text-primary" />}
                title="Source Suggestions"
                description="Find credible academic sources and databases for your research"
                onClick={() => handleTaskSelect('source-suggestions')}
              />
              
              <ResearchTask
                icon={<Quote className="h-6 w-6 text-primary" />}
                title="Citation Formatting"
                description="Format your sources according to APA, MLA, or other citation styles"
                onClick={() => handleTaskSelect('citation-formatting')}
              />
              
              <ResearchTask
                icon={<Search className="h-6 w-6 text-primary" />}
                title="Research Gaps"
                description="Identify potential gaps in research for further investigation"
                onClick={() => handleTaskSelect('research-gaps')}
              />
            </div>
          </div>
        ) : (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="break-words">{getTaskTitle(selectedTask)}</CardTitle>
              <CardDescription className="break-words">{getTaskDescription(selectedTask)}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="topic">Research Topic</Label>
                  <Input
                    id="topic"
                    placeholder="Enter your research topic or subject area"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
                
                {selectedTask === 'citation-formatting' && (
                  <div className="space-y-2">
                    <Label htmlFor="citation-style">Citation Style</Label>
                    <Select value={citationStyle} onValueChange={setCitationStyle}>
                      <SelectTrigger id="citation-style" className="w-full">
                        <SelectValue placeholder="Select citation style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="APA">APA</SelectItem>
                        <SelectItem value="MLA">MLA</SelectItem>
                        <SelectItem value="Chicago">Chicago</SelectItem>
                        <SelectItem value="Harvard">Harvard</SelectItem>
                        <SelectItem value="IEEE">IEEE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {(selectedTask === 'article-summary' || 
                  selectedTask === 'citation-formatting' || 
                  selectedTask === 'research-gaps') && (
                  <div className="space-y-2">
                    <Label htmlFor="context">
                      {selectedTask === 'article-summary' 
                        ? 'Article Text' 
                        : selectedTask === 'citation-formatting'
                        ? 'Source Information'
                        : 'Research Summary'}
                    </Label>
                    <Textarea
                      id="context"
                      placeholder={getContextPlaceholder(selectedTask)}
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      className="min-h-32 w-full"
                      required
                    />
                  </div>
                )}
                
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Processing...' : 'Generate'}
                </Button>
              </form>
            </CardContent>
            
            {result && (
              <CardFooter className="flex-col items-stretch border-t px-6 py-5">
                <h3 className="font-semibold text-lg mb-2">Results</h3>
                <div className="bg-muted/50 p-4 rounded-md whitespace-pre-wrap break-words overflow-auto max-h-[500px]">
                  {result}
                </div>
              </CardFooter>
            )}
            
            {isLoading && (
              <CardFooter className="flex-col items-stretch border-t px-6 py-5">
                <h3 className="font-semibold text-lg mb-2">Processing...</h3>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </CardFooter>
            )}
          </Card>
        )}
      </main>
    </div>
  );
};

function getTaskTitle(task: string): string {
  switch (task) {
    case 'topic-ideas':
      return 'Generate Research Topic Ideas';
    case 'article-summary':
      return 'Summarize Academic Article';
    case 'source-suggestions':
      return 'Find Academic Sources';
    case 'citation-formatting':
      return 'Format Citations';
    case 'research-gaps':
      return 'Identify Research Gaps';
    default:
      return 'Research Assistant';
  }
}

function getTaskDescription(task: string): string {
  switch (task) {
    case 'topic-ideas':
      return 'Get specific, researchable topics related to your subject area';
    case 'article-summary':
      return 'Summarize academic articles while preserving key information';
    case 'source-suggestions':
      return 'Discover credible academic sources and databases for your research';
    case 'citation-formatting':
      return 'Format your sources according to academic citation styles';
    case 'research-gaps':
      return 'Identify potential gaps in research for further investigation';
    default:
      return 'AI-powered academic research assistance';
  }
}

function getContextPlaceholder(task: string): string {
  switch (task) {
    case 'article-summary':
      return 'Paste the article text you want to summarize here...';
    case 'citation-formatting':
      return 'Paste source information (e.g., author, title, publication, year) here...';
    case 'research-gaps':
      return 'Paste your research summary or literature review here...';
    default:
      return '';
  }
}

export default ResearchAssistant;
