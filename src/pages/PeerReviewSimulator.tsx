
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileEdit, 
  ArrowLeft, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb,
  Pencil,
  Sparkles,
  BarChart2
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
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import ApiKeySetup from '@/components/ApiKeySetup';
import { generateChatResponse } from '@/lib/openai-service';

interface FeedbackItem {
  type: 'strength' | 'improvement' | 'suggestion';
  content: string;
  context?: string;
}

interface Feedback {
  overall: string;
  score: {
    clarity: number;
    coherence: number;
    argument: number;
    evidence: number;
    language: number;
    overall: number;
  };
  items: FeedbackItem[];
}

const PeerReviewSimulator = () => {
  const navigate = useNavigate();
  const [assignmentType, setAssignmentType] = useState('essay');
  const [title, setTitle] = useState('');
  const [courseName, setCourseName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [draftText, setDraftText] = useState('');
  const [academicLevel, setAcademicLevel] = useState('undergraduate');
  const [feedbackFocus, setFeedbackFocus] = useState('balanced');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showImprovedVersion, setShowImprovedVersion] = useState(false);
  const [improvedVersion, setImprovedVersion] = useState('');
  
  const handleBack = () => {
    navigate('/');
  };

  const simulatePeerReview = async () => {
    if (!title || !draftText) {
      toast.error('Please enter a title and your draft content');
      return;
    }
    
    setIsLoading(true);
    setFeedback(null);
    setShowImprovedVersion(false);
    setImprovedVersion('');
    
    try {
      const response = await generateChatResponse([
        {
          role: 'system',
          content: `You are an expert peer reviewer for ${academicLevel} level ${assignmentType}s. 
          Provide constructive feedback focusing on clarity, coherence, argument strength, evidence, and language. 
          The feedback should be ${feedbackFocus === 'supportive' ? 'very supportive and encouraging' : 
          feedbackFocus === 'critical' ? 'critical and detailed' : 'balanced with both strengths and areas for improvement'}.`
        },
        {
          role: 'user',
          content: `Please review my ${assignmentType} titled "${title}" for the course "${courseName || 'my course'}".
          ${instructions ? `Assignment instructions: ${instructions}` : ''}
          
          Draft content:
          ${draftText}`
        }
      ]);
      
      // In a real implementation, we would parse the response
      // For this demo, we'll create sample feedback
      generateSampleFeedback();
      
      toast.success('Peer review feedback generated!');
    } catch (error) {
      console.error('Error generating feedback:', error);
      toast.error('Failed to generate feedback. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateImprovedVersion = async () => {
    if (!feedback) return;
    
    setIsLoading(true);
    
    try {
      const response = await generateChatResponse([
        {
          role: 'system',
          content: `You are an expert editor who improves academic writing based on feedback. Create an improved version of the text that addresses all the feedback points while maintaining the original voice and intent.`
        },
        {
          role: 'user',
          content: `Please improve this ${assignmentType} based on the feedback provided:
          
          Original draft:
          ${draftText}
          
          Feedback summary:
          ${feedback.overall}
          
          Improvement areas:
          ${feedback.items.filter(item => item.type === 'improvement').map(item => item.content).join('\n')}`
        }
      ]);
      
      // For the demo, we'll create a sample improved version
      setImprovedVersion(`This is an improved version of your ${assignmentType} that addresses the feedback:
      
${draftText.split('\n').map(paragraph => {
  // Simulate improved paragraphs
  if (paragraph.trim().length > 0) {
    return paragraph + ' [Improved clarity and cohesion in this section]';
  }
  return paragraph;
}).join('\n')}

[Added stronger topic sentences and improved transitions between paragraphs]
[Enhanced evidence by adding specific examples and citations]
[Improved argument structure with clearer thesis statement and conclusion]`);
      
      setShowImprovedVersion(true);
      toast.success('Improved version generated!');
    } catch (error) {
      console.error('Error generating improved version:', error);
      toast.error('Failed to generate improved version. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateSampleFeedback = () => {
    const sampleFeedback: Feedback = {
      overall: `This ${assignmentType} demonstrates a solid understanding of the topic and presents some interesting ideas. The structure is generally clear, though it could benefit from more explicit transitions between sections. The argument is reasonably well-developed but requires stronger evidence in some places. The writing style is appropriate for an academic context, with a few grammatical issues that should be addressed.`,
      score: {
        clarity: 4,
        coherence: 3,
        argument: 3,
        evidence: 2,
        language: 4,
        overall: 3.2
      },
      items: [
        {
          type: 'strength',
          content: 'Strong introduction that clearly establishes the topic and your position',
          context: 'Your opening paragraph effectively captures the reader\'s attention and sets up the main argument.'
        },
        {
          type: 'strength',
          content: 'Good use of academic terminology throughout the draft',
          context: 'Your consistent use of appropriate discipline-specific vocabulary demonstrates familiarity with the subject matter.'
        },
        {
          type: 'improvement',
          content: 'Transitions between major sections need strengthening',
          context: 'Consider adding more explicit connecting phrases between paragraphs to guide the reader through your argument.'
        },
        {
          type: 'improvement',
          content: 'Some claims lack sufficient supporting evidence',
          context: 'Particularly in the third paragraph, your assertion about [topic] would benefit from specific examples or citations.'
        },
        {
          type: 'improvement',
          content: 'Conclusion restates rather than synthesizes your arguments',
          context: 'Try to develop a more insightful conclusion that extends your analysis rather than simply summarizing points already made.'
        },
        {
          type: 'suggestion',
          content: 'Consider incorporating counter-arguments to strengthen your position',
          context: 'Acknowledging and addressing opposing viewpoints would demonstrate critical thinking and strengthen your overall argument.'
        },
        {
          type: 'suggestion',
          content: 'Add more varied sentence structures to improve flow',
          context: 'Varying your sentence length and structure would make your writing more engaging and dynamic.'
        }
      ]
    };
    
    setFeedback(sampleFeedback);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-background">
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
          <FileEdit className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-display font-bold">Peer Review Simulator</h1>
        </div>
        
        <div className="mb-8">
          <ApiKeySetup />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-sm border-purple-200/50">
              <CardHeader>
                <CardTitle>Assignment Details</CardTitle>
                <CardDescription>Enter information about your assignment</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="assignment-type">Assignment Type</Label>
                  <Select value={assignmentType} onValueChange={setAssignmentType}>
                    <SelectTrigger id="assignment-type">
                      <SelectValue placeholder="Select assignment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="essay">Essay</SelectItem>
                      <SelectItem value="research-paper">Research Paper</SelectItem>
                      <SelectItem value="case-study">Case Study</SelectItem>
                      <SelectItem value="lab-report">Lab Report</SelectItem>
                      <SelectItem value="reflection">Reflection Paper</SelectItem>
                      <SelectItem value="literature-review">Literature Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter the title of your work"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="course-name">Course Name (Optional)</Label>
                  <Input
                    id="course-name"
                    placeholder="e.g., English Composition 101"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instructions">Assignment Instructions (Optional)</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Paste assignment requirements or rubric details here"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="min-h-20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="academic-level">Academic Level</Label>
                  <Select value={academicLevel} onValueChange={setAcademicLevel}>
                    <SelectTrigger id="academic-level">
                      <SelectValue placeholder="Select academic level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high-school">High School</SelectItem>
                      <SelectItem value="undergraduate">Undergraduate</SelectItem>
                      <SelectItem value="graduate">Graduate</SelectItem>
                      <SelectItem value="doctoral">Doctoral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="feedback-focus">Feedback Focus</Label>
                  <Select value={feedbackFocus} onValueChange={setFeedbackFocus}>
                    <SelectTrigger id="feedback-focus">
                      <SelectValue placeholder="Select feedback style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="supportive">Supportive</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            {feedback && (
              <Card className="shadow-sm border-purple-200/50">
                <CardHeader className="pb-2">
                  <CardTitle>Scoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Clarity:</span>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <div 
                              key={score}
                              className={`w-5 h-2.5 ${score <= feedback.score.clarity ? 'bg-purple-600' : 'bg-gray-200'} ${score > 1 ? 'ml-0.5' : ''}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{feedback.score.clarity}/5</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Coherence:</span>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <div 
                              key={score}
                              className={`w-5 h-2.5 ${score <= feedback.score.coherence ? 'bg-purple-600' : 'bg-gray-200'} ${score > 1 ? 'ml-0.5' : ''}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{feedback.score.coherence}/5</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Argument Strength:</span>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <div 
                              key={score}
                              className={`w-5 h-2.5 ${score <= feedback.score.argument ? 'bg-purple-600' : 'bg-gray-200'} ${score > 1 ? 'ml-0.5' : ''}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{feedback.score.argument}/5</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Evidence:</span>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <div 
                              key={score}
                              className={`w-5 h-2.5 ${score <= feedback.score.evidence ? 'bg-purple-600' : 'bg-gray-200'} ${score > 1 ? 'ml-0.5' : ''}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{feedback.score.evidence}/5</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Language & Style:</span>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <div 
                              key={score}
                              className={`w-5 h-2.5 ${score <= feedback.score.language ? 'bg-purple-600' : 'bg-gray-200'} ${score > 1 ? 'ml-0.5' : ''}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{feedback.score.language}/5</span>
                      </div>
                    </div>
                    
                    <Separator className="my-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Overall:</span>
                      <span className="font-bold text-lg text-purple-700">{feedback.score.overall.toFixed(1)}/5</span>
                    </div>
                    
                    <Button 
                      onClick={generateImprovedVersion}
                      disabled={isLoading || showImprovedVersion}
                      className="w-full mt-2 bg-purple-600 hover:bg-purple-700"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Improved Version
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm border-purple-200/50">
              <CardHeader>
                <CardTitle>Your Draft</CardTitle>
                <CardDescription>Paste your work to receive feedback</CardDescription>
              </CardHeader>
              
              <CardContent>
                <Textarea
                  placeholder={`Enter your ${assignmentType} draft here...`}
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  className="min-h-[300px] resize-y"
                />
                
                <Button 
                  onClick={simulatePeerReview} 
                  disabled={isLoading || !title || !draftText}
                  className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Get Peer Review Feedback
                </Button>
              </CardContent>
            </Card>
            
            {isLoading && (
              <Card className="shadow-sm border-purple-200/50">
                <CardHeader>
                  <CardTitle>Analyzing Your Work</CardTitle>
                  <CardDescription>Our AI reviewer is evaluating your draft</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            )}
            
            {feedback && !isLoading && (
              <Tabs defaultValue="feedback" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="feedback">Peer Feedback</TabsTrigger>
                  <TabsTrigger 
                    value="improved-version"
                    disabled={!showImprovedVersion}
                  >
                    Improved Version
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="feedback">
                  <Card className="shadow-sm border-purple-200/50">
                    <CardHeader>
                      <CardTitle>Peer Review Feedback</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="bg-purple-50 p-4 rounded-md border border-purple-100">
                        <h3 className="font-medium text-lg mb-2 flex items-center gap-2">
                          <BarChart2 className="h-5 w-5 text-purple-600" />
                          Overall Assessment
                        </h3>
                        <p>{feedback.overall}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          Strengths
                        </h3>
                        <div className="space-y-3">
                          {feedback.items
                            .filter(item => item.type === 'strength')
                            .map((item, idx) => (
                              <div key={idx} className="bg-green-50 p-3 rounded-md border border-green-100">
                                <p className="font-medium">{item.content}</p>
                                {item.context && (
                                  <p className="text-sm text-gray-600 mt-1">{item.context}</p>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                          Areas for Improvement
                        </h3>
                        <div className="space-y-3">
                          {feedback.items
                            .filter(item => item.type === 'improvement')
                            .map((item, idx) => (
                              <div key={idx} className="bg-amber-50 p-3 rounded-md border border-amber-100">
                                <p className="font-medium">{item.content}</p>
                                {item.context && (
                                  <p className="text-sm text-gray-600 mt-1">{item.context}</p>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-blue-600" />
                          Suggestions
                        </h3>
                        <div className="space-y-3">
                          {feedback.items
                            .filter(item => item.type === 'suggestion')
                            .map((item, idx) => (
                              <div key={idx} className="bg-blue-50 p-3 rounded-md border border-blue-100">
                                <p className="font-medium">{item.content}</p>
                                {item.context && (
                                  <p className="text-sm text-gray-600 mt-1">{item.context}</p>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="improved-version">
                  <Card className="shadow-sm border-purple-200/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        Improved Version
                      </CardTitle>
                      <CardDescription>AI-enhanced version based on peer feedback</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-purple-50 p-4 rounded-md border border-purple-100 whitespace-pre-line">
                        {improvedVersion}
                      </div>
                      
                      <div className="flex justify-end mt-4">
                        <Button 
                          variant="outline"
                          className="border-purple-200 text-purple-700 hover:bg-purple-50"
                          onClick={() => {
                            navigator.clipboard.writeText(improvedVersion);
                            toast.success('Improved version copied to clipboard!');
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Copy to Clipboard
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PeerReviewSimulator;
