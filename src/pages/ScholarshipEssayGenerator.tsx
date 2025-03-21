
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ScrollText, 
  ArrowLeft, 
  Sparkles, 
  Target, 
  PenTool, 
  HeartHandshake,
  Award,
  Rocket,
  Pencil
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import ApiKeySetup from '@/components/ApiKeySetup';
import { generateChatResponse } from '@/lib/openai-service';

interface ScholarshipIdea {
  prompt: string;
  description: string;
  example: string;
}

const ScholarshipEssayGenerator = () => {
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [scholarshipType, setScholarshipType] = useState('academic');
  const [essayPrompt, setEssayPrompt] = useState('');
  const [essayTopic, setEssayTopic] = useState('');
  const [wordCount, setWordCount] = useState<number[]>([500]);
  const [personalBackground, setPersonalBackground] = useState('');
  const [achievements, setAchievements] = useState('');
  const [academicPlans, setAcademicPlans] = useState('');
  const [tone, setTone] = useState('professional');
  const [focusArea, setFocusArea] = useState('balanced');
  const [generatedEssay, setGeneratedEssay] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [essayIdeas, setEssayIdeas] = useState<ScholarshipIdea[]>([]);
  const [showOutline, setShowOutline] = useState(false);
  const [essayOutline, setEssayOutline] = useState<string[]>([]);
  
  const handleBack = () => {
    if (selectedTask) {
      setSelectedTask(null);
      setGeneratedEssay('');
      setEssayIdeas([]);
      setShowOutline(false);
      setEssayOutline([]);
    } else {
      navigate('/');
    }
  };

  const handleTaskSelect = (task: string) => {
    setSelectedTask(task);
    setGeneratedEssay('');
    setEssayIdeas([]);
    setShowOutline(false);
    setEssayOutline([]);
  };

  const generateEssay = async () => {
    if (selectedTask === 'full-essay' && (!essayPrompt || !personalBackground)) {
      toast.error('Please enter the essay prompt and your personal background');
      return;
    }
    
    if (selectedTask === 'brainstorm' && !scholarshipType) {
      toast.error('Please select a scholarship type');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (selectedTask === 'full-essay') {
        const response = await generateChatResponse([
          {
            role: 'system',
            content: `You are an expert scholarship essay writer. Create a compelling scholarship essay that showcases the student's strengths and aligns with the prompt. Use a ${tone} tone and focus more on ${getFocusDescription(focusArea)}.`
          },
          {
            role: 'user',
            content: `Write a scholarship essay of approximately ${wordCount[0]} words for this prompt: "${essayPrompt || essayTopic}".
            
            About me:
            Background: ${personalBackground}
            ${achievements ? `Achievements: ${achievements}` : ''}
            ${academicPlans ? `Academic/Career plans: ${academicPlans}` : ''}`
          }
        ]);
        
        // For demo, we'll create a sample essay
        const sampleEssay = `# ${essayTopic || 'My Academic Journey'}

As I reflect on the path that has led me to this point in my academic journey, I am reminded of the countless challenges and triumphs that have shaped my perspective. ${personalBackground.split('.')[0]}.

Growing up, I developed a profound passion for learning that has guided my educational pursuits. This enthusiasm has manifested in various achievements, from ${achievements.split(',')[0] || 'academic excellence'} to ${achievements.split(',')[1] || 'community involvement'}. Each accomplishment has reinforced my belief in the transformative power of education.

What sets me apart is not merely my academic record, but my unwavering commitment to ${focusArea === 'personal-growth' ? 'personal growth and self-improvement' : focusArea === 'community-impact' ? 'making a positive impact in my community' : 'both personal growth and community service'}. I have consistently sought opportunities to expand my horizons and contribute meaningfully to society.

My future aspirations include ${academicPlans || 'pursuing a degree that will allow me to combine my interests and make a meaningful contribution'}. This scholarship would be instrumental in helping me achieve these goals by providing the financial support necessary to focus on my studies and extracurricular involvements.

In conclusion, I am not just seeking financial assistance; I am seeking an opportunity to continue my journey of growth and impact. This scholarship represents more than monetary support—it represents belief in my potential to create positive change.`;

        setGeneratedEssay(sampleEssay);
        
        toast.success('Scholarship essay generated!');
      } else if (selectedTask === 'brainstorm') {
        const response = await generateChatResponse([
          {
            role: 'system',
            content: `You are an expert scholarship consultant. Generate creative and compelling essay topic ideas for ${scholarshipType} scholarships. Include a brief description and example for each idea.`
          },
          {
            role: 'user',
            content: `Provide 5 unique scholarship essay ideas for ${scholarshipType} scholarships. Include a prompt, description, and brief example for each.`
          }
        ]);
        
        // For demo, generate sample ideas
        generateSampleIdeas();
        
        toast.success('Essay ideas generated!');
      }
    } catch (error) {
      console.error('Error generating essay content:', error);
      toast.error('Failed to generate content. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateOutline = async () => {
    if (!essayPrompt && !essayTopic) {
      toast.error('Please enter an essay prompt or topic');
      return;
    }
    
    setIsLoading(true);
    setShowOutline(false);
    
    try {
      const response = await generateChatResponse([
        {
          role: 'system',
          content: `You are an expert scholarship essay consultant. Create a detailed outline for a scholarship essay that addresses the prompt and showcases the student's strengths.`
        },
        {
          role: 'user',
          content: `Create an outline for a scholarship essay on this topic: "${essayPrompt || essayTopic}".
          ${personalBackground ? `My background: ${personalBackground}` : ''}
          ${achievements ? `My achievements: ${achievements}` : ''}
          ${academicPlans ? `My academic plans: ${academicPlans}` : ''}`
        }
      ]);
      
      // For demo, create a sample outline
      setEssayOutline([
        "Introduction",
        "- Engaging hook related to the prompt/personal experience",
        "- Brief introduction of yourself and your background",
        "- Thesis statement that addresses the prompt and previews main points",
        
        "Personal Background & Challenges",
        "- Discuss relevant aspects of your background",
        "- Highlight challenges you've overcome",
        "- Connect these experiences to your character development",
        
        "Academic Achievements & Extracurricular Activities",
        "- Highlight key academic accomplishments",
        "- Discuss meaningful extracurricular involvements",
        "- Explain what you learned from these experiences",
        
        "Future Goals & How the Scholarship Will Help",
        "- Outline your academic and career aspirations",
        "- Explain how these goals align with the scholarship's values",
        "- Specifically address how the scholarship will help you achieve these goals",
        
        "Conclusion",
        "- Restate your qualifications and fit for the scholarship",
        "- Leave a memorable final impression",
        "- Express gratitude for the opportunity"
      ]);
      
      setShowOutline(true);
      toast.success('Essay outline generated!');
    } catch (error) {
      console.error('Error generating outline:', error);
      toast.error('Failed to generate outline. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const useIdeaAsPrompt = (idea: ScholarshipIdea) => {
    setEssayPrompt(idea.prompt);
    setEssayTopic(idea.prompt);
    setSelectedTask('full-essay');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const generateSampleIdeas = () => {
    const ideas: ScholarshipIdea[] = [
      {
        prompt: "Describe a time when you faced a significant challenge and how you overcame it.",
        description: "This prompt asks you to reflect on your resilience and problem-solving abilities through a personal narrative.",
        example: "When my family faced financial hardship during my sophomore year, I took on a part-time job while maintaining my GPA..."
      },
      {
        prompt: "How has your background or identity shaped your educational journey?",
        description: "This prompt invites you to discuss how your unique perspective has influenced your academic path and goals.",
        example: "As a first-generation college student from a rural community, I've navigated educational systems without familial precedent..."
      },
      {
        prompt: "What impact do you hope to make in your field of study?",
        description: "This prompt focuses on your vision for your future career and how you plan to contribute to your chosen discipline.",
        example: "Through my research in sustainable engineering, I aim to develop eco-friendly construction materials that can reduce the environmental impact..."
      },
      {
        prompt: "Describe a leadership experience and what you learned from it.",
        description: "This prompt assesses your leadership potential through reflection on past experiences.",
        example: "When our student organization faced declining membership, I implemented a new outreach strategy that increased participation by 50%..."
      },
      {
        prompt: "How would this scholarship help you achieve your educational and career goals?",
        description: "This prompt asks you to connect the specific scholarship to your personal aspirations.",
        example: "The financial support from this scholarship would allow me to reduce my work hours and focus more on my research project in neural networks..."
      }
    ];
    
    setEssayIdeas(ideas);
  };
  
  const getFocusDescription = (focus: string): string => {
    switch (focus) {
      case 'personal-growth':
        return 'personal growth, challenges overcome, and character development';
      case 'community-impact':
        return 'community service, leadership, and positive impact on others';
      case 'academic-achievements':
        return 'academic accomplishments, intellectual curiosity, and educational goals';
      default:
        return 'a balance of personal qualities, achievements, and future goals';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-background">
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
          <ScrollText className="h-8 w-8 text-pink-600" />
          <h1 className="text-3xl font-display font-bold">Scholarship Essay Generator</h1>
        </div>
        
        <div className="mb-8">
          <ApiKeySetup />
        </div>
        
        {!selectedTask ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">How can I help with your scholarship application?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <Card className="hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer border-pink-200/50 h-full" onClick={() => handleTaskSelect('brainstorm')}>
                <CardHeader className="pb-2">
                  <PenTool className="h-10 w-10 text-pink-600 mb-2" />
                  <CardTitle className="text-xl">Brainstorm Essay Ideas</CardTitle>
                  <CardDescription className="text-base">
                    Generate creative prompts and topics for your scholarship essay
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Not sure what to write about? Get personalized essay ideas and prompts tailored to different scholarship types. We'll help you identify compelling stories from your experience.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer border-pink-200/50 h-full" onClick={() => handleTaskSelect('full-essay')}>
                <CardHeader className="pb-2">
                  <Sparkles className="h-10 w-10 text-pink-600 mb-2" />
                  <CardTitle className="text-xl">Generate Complete Essay</CardTitle>
                  <CardDescription className="text-base">
                    Create a full scholarship essay based on your background and the prompt
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Turn your experiences into a compelling scholarship essay. Our AI will help you craft a personalized essay that highlights your strengths and addresses the prompt effectively.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : selectedTask === 'brainstorm' ? (
          <div className="space-y-6">
            <Card className="shadow-sm border-pink-200/50">
              <CardHeader>
                <CardTitle>Scholarship Essay Ideas Generator</CardTitle>
                <CardDescription>Get personalized essay prompts and topics</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="scholarship-type">Scholarship Type</Label>
                  <Select value={scholarshipType} onValueChange={setScholarshipType}>
                    <SelectTrigger id="scholarship-type">
                      <SelectValue placeholder="Select scholarship type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic Merit</SelectItem>
                      <SelectItem value="community-service">Community Service</SelectItem>
                      <SelectItem value="leadership">Leadership</SelectItem>
                      <SelectItem value="diversity">Diversity & Inclusion</SelectItem>
                      <SelectItem value="field-specific">Field-Specific (STEM, Arts, etc.)</SelectItem>
                      <SelectItem value="first-generation">First-Generation Students</SelectItem>
                      <SelectItem value="international">International Students</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="personal-background" className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-pink-600" />
                    Personal Background (Optional)
                  </Label>
                  <Textarea
                    id="personal-background"
                    placeholder="Share a bit about your background to help us generate more relevant ideas (e.g., first-generation student, international background, field of study)"
                    value={personalBackground}
                    onChange={(e) => setPersonalBackground(e.target.value)}
                    className="min-h-20"
                  />
                </div>
                
                <Button 
                  onClick={generateEssay} 
                  disabled={isLoading || !scholarshipType}
                  className="w-full bg-pink-600 hover:bg-pink-700"
                >
                  <PenTool className="mr-2 h-4 w-4" />
                  Generate Essay Ideas
                </Button>
              </CardContent>
            </Card>
            
            {isLoading && (
              <Card className="shadow-sm border-pink-200/50">
                <CardHeader>
                  <CardTitle>Generating Ideas...</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            )}
            
            {essayIdeas.length > 0 && !isLoading && (
              <Card className="shadow-sm border-pink-200/50">
                <CardHeader>
                  <CardTitle>Essay Ideas for {getScholarshipTypeLabel(scholarshipType)} Scholarships</CardTitle>
                  <CardDescription>Select any idea to use it as your essay prompt</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {essayIdeas.map((idea, idx) => (
                    <Card key={idx} className="overflow-hidden border-pink-100 hover:border-pink-300 transition-all hover:shadow-md">
                      <CardHeader className="py-4 bg-pink-50">
                        <CardTitle className="text-lg">{idea.prompt}</CardTitle>
                      </CardHeader>
                      <CardContent className="py-4">
                        <p className="mb-3 text-muted-foreground">{idea.description}</p>
                        <div className="bg-pink-50 p-3 rounded-md border border-pink-100">
                          <p className="text-sm italic">Example: "{idea.example}"</p>
                        </div>
                        <Button 
                          onClick={() => useIdeaAsPrompt(idea)}
                          className="mt-4 bg-pink-600 hover:bg-pink-700"
                        >
                          Use This Prompt
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="shadow-sm border-pink-200/50">
              <CardHeader>
                <CardTitle>Scholarship Essay Generator</CardTitle>
                <CardDescription>Create a personalized scholarship essay</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="essay-prompt" className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-pink-600" />
                    Essay Prompt
                  </Label>
                  <Textarea
                    id="essay-prompt"
                    placeholder="Paste the scholarship essay prompt or question here"
                    value={essayPrompt}
                    onChange={(e) => setEssayPrompt(e.target.value)}
                    className="min-h-20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="essay-topic">Essay Topic (if no specific prompt)</Label>
                  <Input
                    id="essay-topic"
                    placeholder="e.g., My academic journey, Career aspirations, Leadership experience"
                    value={essayTopic}
                    onChange={(e) => setEssayTopic(e.target.value)}
                    disabled={essayPrompt.length > 0}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="word-count">Word Count</Label>
                    <span className="text-sm text-muted-foreground">{wordCount[0]} words</span>
                  </div>
                  <Slider
                    id="word-count"
                    defaultValue={[500]}
                    max={1000}
                    min={250}
                    step={50}
                    onValueChange={setWordCount}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="personal-background" className="flex items-center gap-2">
                    <HeartHandshake className="h-4 w-4 text-pink-600" />
                    Personal Background
                  </Label>
                  <Textarea
                    id="personal-background"
                    placeholder="Share relevant information about your background, experiences, and challenges overcome"
                    value={personalBackground}
                    onChange={(e) => setPersonalBackground(e.target.value)}
                    className="min-h-20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="achievements" className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-pink-600" />
                    Key Achievements
                  </Label>
                  <Textarea
                    id="achievements"
                    placeholder="List your academic achievements, extracurricular activities, volunteer work, etc."
                    value={achievements}
                    onChange={(e) => setAchievements(e.target.value)}
                    className="min-h-20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="academic-plans" className="flex items-center gap-2">
                    <Rocket className="h-4 w-4 text-pink-600" />
                    Academic & Career Plans
                  </Label>
                  <Textarea
                    id="academic-plans"
                    placeholder="Describe your educational goals, career aspirations, and how this scholarship will help"
                    value={academicPlans}
                    onChange={(e) => setAcademicPlans(e.target.value)}
                    className="min-h-20"
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <Label>Essay Tone</Label>
                  <RadioGroup defaultValue={tone} onValueChange={setTone} className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="professional" id="professional" />
                      <Label htmlFor="professional" className="cursor-pointer">Professional & Formal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="conversational" id="conversational" />
                      <Label htmlFor="conversational" className="cursor-pointer">Conversational & Authentic</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="inspiring" id="inspiring" />
                      <Label htmlFor="inspiring" className="cursor-pointer">Inspiring & Passionate</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-3">
                  <Label>Focus Area</Label>
                  <RadioGroup defaultValue={focusArea} onValueChange={setFocusArea} className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="balanced" id="balanced" />
                      <Label htmlFor="balanced" className="cursor-pointer">Balanced Approach</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="personal-growth" id="personal-growth" />
                      <Label htmlFor="personal-growth" className="cursor-pointer">Personal Growth & Challenges</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="community-impact" id="community-impact" />
                      <Label htmlFor="community-impact" className="cursor-pointer">Community Impact & Leadership</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="academic-achievements" id="academic-achievements" />
                      <Label htmlFor="academic-achievements" className="cursor-pointer">Academic Achievements & Goals</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={generateOutline} 
                    variant="outline"
                    disabled={isLoading || (!essayPrompt && !essayTopic)}
                    className="flex-1 border-pink-200 text-pink-700 hover:bg-pink-50"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Generate Outline
                  </Button>
                  
                  <Button 
                    onClick={generateEssay} 
                    disabled={isLoading || (!essayPrompt && !essayTopic) || !personalBackground}
                    className="flex-1 bg-pink-600 hover:bg-pink-700"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Essay
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {isLoading && (
              <Card className="shadow-sm border-pink-200/50">
                <CardHeader>
                  <CardTitle>Generating Content...</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            )}
            
            {showOutline && !isLoading && (
              <Card className="shadow-sm border-pink-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pencil className="h-5 w-5 text-pink-600" />
                    Essay Outline
                  </CardTitle>
                  <CardDescription>Use this structure to guide your writing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-pink-50 p-4 rounded-md border border-pink-100">
                    <ul className="space-y-4">
                      {essayOutline.map((item, idx) => (
                        <li key={idx} className={item.startsWith('-') ? 'pl-4 text-sm' : 'font-semibold'}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button 
                    onClick={generateEssay} 
                    disabled={isLoading}
                    className="w-full mt-4 bg-pink-600 hover:bg-pink-700"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Full Essay
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {generatedEssay && !isLoading && (
              <Card className="shadow-sm border-pink-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-pink-600" />
                    Your Scholarship Essay
                  </CardTitle>
                  <CardDescription>Feel free to edit and personalize further</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-4 rounded-md border border-pink-100 whitespace-pre-line">
                    {generatedEssay}
                  </div>
                  
                  <div className="mt-4 p-4 bg-pink-50 rounded-md border border-pink-100">
                    <h3 className="font-medium text-pink-800 mb-2">Tips for Finalizing Your Essay:</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Personalize the content further with specific details and examples</li>
                      <li>Proofread carefully for grammar and spelling errors</li>
                      <li>Read aloud to check flow and readability</li>
                      <li>Have someone else review your essay for feedback</li>
                      <li>Make sure you've addressed all aspects of the prompt</li>
                      <li>Check that it meets the required word count</li>
                    </ul>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-4">
                    <Button 
                      variant="outline"
                      className="border-pink-200 text-pink-700 hover:bg-pink-50"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedEssay);
                        toast.success('Essay copied to clipboard!');
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Copy to Clipboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

function getScholarshipTypeLabel(type: string): string {
  switch (type) {
    case 'academic':
      return 'Academic Merit';
    case 'community-service':
      return 'Community Service';
    case 'leadership':
      return 'Leadership';
    case 'diversity':
      return 'Diversity & Inclusion';
    case 'field-specific':
      return 'Field-Specific';
    case 'first-generation':
      return 'First-Generation Student';
    case 'international':
      return 'International Student';
    default:
      return type;
  }
}

export default ScholarshipEssayGenerator;
