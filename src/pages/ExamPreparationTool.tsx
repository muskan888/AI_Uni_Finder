
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardCheck, 
  ArrowLeft, 
  Lightbulb, 
  FileQuestion, 
  CheckCircle2, 
  BookOpen,
  Timer,
  Brain
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
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import ApiKeySetup from '@/components/ApiKeySetup';
import { generateChatResponse } from '@/lib/openai-service';

interface Question {
  id: string;
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  type: 'multiple-choice' | 'short-answer' | 'essay';
}

interface StudyGuide {
  title: string;
  sections: {
    title: string;
    content: string;
  }[];
}

const ExamPreparationTool = () => {
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [topics, setTopics] = useState('');
  const [syllabus, setSyllabus] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('moderate');
  const [questionType, setQuestionType] = useState<'multiple-choice' | 'short-answer' | 'essay'>('multiple-choice');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [studyGuide, setStudyGuide] = useState<StudyGuide | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [examMode, setExamMode] = useState(false);
  const [examTimeLeft, setExamTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleBack = () => {
    if (selectedTask) {
      setSelectedTask(null);
      setQuestions([]);
      setStudyGuide(null);
    } else {
      navigate('/');
    }
  };

  const handleTaskSelect = (task: string) => {
    setSelectedTask(task);
    setQuestions([]);
    setStudyGuide(null);
    setExamMode(false);
  };

  const generatePracticeQuestions = async () => {
    if (!courseTitle || !topics) {
      toast.error('Please enter course title and topics');
      return;
    }
    
    setIsLoading(true);
    setQuestions([]);
    
    try {
      const response = await generateChatResponse([
        {
          role: 'system',
          content: `You are an AI exam preparation assistant. Generate ${questionType} questions about the specified topics. For multiple-choice, include 4 options. Include detailed explanations for answers.`
        },
        {
          role: 'user',
          content: `Create 5 ${difficultyLevel} difficulty ${questionType} questions about the following topics for my ${courseTitle} course: ${topics}.
          ${syllabus ? `Here's additional information from the syllabus: ${syllabus}` : ''}`
        }
      ]);
      
      // In a real implementation, you would parse the response to extract structured questions
      // For this demo, we'll create sample questions
      const sampleQuestions = createSampleQuestions(questionType, difficultyLevel);
      setQuestions(sampleQuestions);
      setCurrentQuestionIndex(0);
      setShowAnswer(false);
      
      toast.success('Practice questions generated!');
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error('Failed to generate questions. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateStudyGuide = async () => {
    if (!courseTitle || !topics) {
      toast.error('Please enter course title and topics');
      return;
    }
    
    setIsLoading(true);
    setStudyGuide(null);
    
    try {
      const response = await generateChatResponse([
        {
          role: 'system',
          content: `You are an AI exam preparation assistant. Create a comprehensive study guide with key concepts, definitions, formulas, and example problems organized by topic.`
        },
        {
          role: 'user',
          content: `Create a study guide for my ${courseTitle} course covering these topics: ${topics}.
          ${syllabus ? `Here's additional information from the syllabus: ${syllabus}` : ''}`
        }
      ]);
      
      // In a real implementation, you would parse the response
      // For this demo, we'll create a sample study guide
      setStudyGuide({
        title: `${courseTitle} Study Guide`,
        sections: [
          {
            title: 'Key Concepts',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor.'
          },
          {
            title: 'Definitions',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor.'
          },
          {
            title: 'Important Formulas',
            content: 'E = mc²\nF = ma\nPV = nRT\nC₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O'
          },
          {
            title: 'Example Problems',
            content: 'Problem 1: Lorem ipsum dolor sit amet, consectetur adipiscing elit.\nSolution: Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.\n\nProblem 2: Sed auctor neque eu tellus rhoncus ut eleifend.\nSolution: Nibh porttitor. Ut in nulla enim.'
          }
        ]
      });
      
      toast.success('Study guide generated!');
    } catch (error) {
      console.error('Error generating study guide:', error);
      toast.error('Failed to generate study guide. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const startMockExam = () => {
    if (questions.length === 0) {
      generatePracticeQuestions();
      return;
    }
    
    setExamMode(true);
    setCurrentQuestionIndex(0);
    setShowAnswer(false);
    // Set a 30-minute timer for the mock exam
    setExamTimeLeft(30 * 60);
    
    // Start the timer
    const timer = setInterval(() => {
      setExamTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.warning('Exam time is up!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    toast.info('Mock exam started! You have 30 minutes to complete it.');
    
    // Clean up the timer when component unmounts or exam ends
    return () => clearInterval(timer);
  };
  
  const checkAnswer = () => {
    if (!userAnswer) {
      toast.error('Please enter your answer');
      return;
    }
    
    setShowAnswer(true);
  };
  
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserAnswer('');
      setShowAnswer(false);
    } else {
      // End of questions
      toast.success('You have completed all questions!');
      setExamMode(false);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const createSampleQuestions = (type: string, difficulty: string): Question[] => {
    const baseQuestions = [
      {
        id: '1',
        question: 'What is the capital of France?',
        options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
        answer: 'Paris',
        explanation: 'Paris is the capital and most populous city of France.',
        type: 'multiple-choice' as const
      },
      {
        id: '2',
        question: 'What is the formula for the area of a circle?',
        options: ['A = πr²', 'A = 2πr', 'A = πd', 'A = r²'],
        answer: 'A = πr²',
        explanation: 'The area of a circle is calculated using the formula A = πr², where r is the radius of the circle.',
        type: 'multiple-choice' as const
      },
      {
        id: '3',
        question: 'Explain the concept of supply and demand in economics.',
        answer: 'Supply and demand is an economic model that explains price determination in a market.',
        explanation: 'Supply and demand describes how prices vary as a result of a balance between product availability and consumer desire. Higher demand or lower supply increases price, while lower demand or higher supply decreases price.',
        type: 'short-answer' as const
      },
      {
        id: '4',
        question: 'Discuss the major themes in Shakespeare\'s "Hamlet".',
        answer: 'Major themes include revenge, mortality, madness, corruption, and the complexity of action versus inaction.',
        explanation: 'Hamlet explores profound themes including the nature of revenge, the human condition of mortality, the thin line between sanity and madness, moral corruption, and the challenges of taking action versus contemplation.',
        type: 'essay' as const
      },
      {
        id: '5',
        question: 'What is the First Law of Thermodynamics?',
        answer: 'Energy cannot be created or destroyed, only transferred or converted from one form to another.',
        explanation: 'The First Law of Thermodynamics, also known as the Law of Conservation of Energy, states that energy cannot be created or destroyed in an isolated system; it can only change forms or be transferred from one system to another.',
        type: 'short-answer' as const
      }
    ];
    
    // Filter questions by the selected type
    const filteredQuestions = baseQuestions.filter(q => {
      if (type === 'multiple-choice') return q.type === 'multiple-choice';
      if (type === 'short-answer') return q.type === 'short-answer';
      if (type === 'essay') return q.type === 'essay';
      return true;
    });
    
    // If no questions match the type, return some default questions
    return filteredQuestions.length > 0 ? filteredQuestions : baseQuestions.slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-background">
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
          <ClipboardCheck className="h-8 w-8 text-orange-600" />
          <h1 className="text-3xl font-display font-bold">Exam Preparation Tool</h1>
        </div>
        
        <div className="mb-8">
          <ApiKeySetup />
        </div>
        
        {examMode ? (
          <Card className="shadow-sm border-orange-200/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Mock Exam</CardTitle>
                <CardDescription>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </CardDescription>
              </div>
              <div className="text-lg font-semibold text-orange-600">
                Time left: {formatTime(examTimeLeft)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-orange-50 p-4 rounded-md border border-orange-100">
                <h3 className="font-medium text-lg mb-2">
                  {questions[currentQuestionIndex]?.question}
                </h3>
                
                {questions[currentQuestionIndex]?.type === 'multiple-choice' && (
                  <div className="space-y-2 mt-4">
                    {questions[currentQuestionIndex]?.options?.map((option, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`option-${idx}`} 
                          checked={userAnswer === option}
                          onCheckedChange={() => setUserAnswer(option)}
                        />
                        <label 
                          htmlFor={`option-${idx}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                
                {(questions[currentQuestionIndex]?.type === 'short-answer' || 
                 questions[currentQuestionIndex]?.type === 'essay') && (
                  <div className="mt-4">
                    <Textarea
                      placeholder="Enter your answer here..."
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className={questions[currentQuestionIndex]?.type === 'essay' ? 'min-h-32' : 'min-h-20'}
                    />
                  </div>
                )}
              </div>
              
              {showAnswer && (
                <div className="bg-green-50 p-4 rounded-md border border-green-100 space-y-2">
                  <div className="font-medium flex items-center gap-2 text-green-800">
                    <CheckCircle2 className="h-5 w-5" />
                    Correct Answer:
                  </div>
                  <p>{questions[currentQuestionIndex]?.answer}</p>
                  
                  <Separator className="my-2" />
                  
                  <div className="font-medium flex items-center gap-2 text-orange-800">
                    <Lightbulb className="h-5 w-5" />
                    Explanation:
                  </div>
                  <p>{questions[currentQuestionIndex]?.explanation}</p>
                </div>
              )}
              
              <div className="flex justify-end gap-3">
                {!showAnswer ? (
                  <Button 
                    onClick={checkAnswer} 
                    disabled={!userAnswer}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Check Answer
                  </Button>
                ) : (
                  <Button 
                    onClick={nextQuestion} 
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Exam'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          !selectedTask ? (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">What would you like to prepare?</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer border-orange-200/50" onClick={() => handleTaskSelect('practice-questions')}>
                  <CardHeader className="pb-2">
                    <FileQuestion className="h-6 w-6 text-orange-600 mb-2" />
                    <CardTitle className="text-lg">Practice Questions</CardTitle>
                    <CardDescription>Generate custom practice questions based on your course material</CardDescription>
                  </CardHeader>
                </Card>
                
                <Card className="hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer border-orange-200/50" onClick={() => handleTaskSelect('study-guide')}>
                  <CardHeader className="pb-2">
                    <BookOpen className="h-6 w-6 text-orange-600 mb-2" />
                    <CardTitle className="text-lg">Study Guide Generator</CardTitle>
                    <CardDescription>Create comprehensive study guides for your courses</CardDescription>
                  </CardHeader>
                </Card>
                
                <Card className="hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer border-orange-200/50" onClick={() => handleTaskSelect('mock-exam')}>
                  <CardHeader className="pb-2">
                    <Timer className="h-6 w-6 text-orange-600 mb-2" />
                    <CardTitle className="text-lg">Mock Exam</CardTitle>
                    <CardDescription>Take timed practice exams to simulate test conditions</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="shadow-sm border-orange-200/50">
              <CardHeader>
                <CardTitle>{getTaskTitle(selectedTask)}</CardTitle>
                <CardDescription>{getTaskDescription(selectedTask)}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="course-title">Course Title</Label>
                    <Input
                      id="course-title"
                      placeholder="e.g., Introduction to Biology"
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="topics">Topics to Cover</Label>
                    <Textarea
                      id="topics"
                      placeholder="List the specific topics you want to focus on (e.g., Cell structure, DNA replication, Protein synthesis)"
                      value={topics}
                      onChange={(e) => setTopics(e.target.value)}
                      className="min-h-20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="syllabus">Course Syllabus (Optional)</Label>
                    <Textarea
                      id="syllabus"
                      placeholder="Paste relevant parts of your course syllabus to improve the quality of generated content"
                      value={syllabus}
                      onChange={(e) => setSyllabus(e.target.value)}
                      className="min-h-20"
                    />
                  </div>
                  
                  {selectedTask === 'practice-questions' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="difficulty-level">Difficulty Level</Label>
                        <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                          <SelectTrigger id="difficulty-level">
                            <SelectValue placeholder="Select difficulty level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="challenging">Challenging</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="question-type">Question Type</Label>
                        <Select value={questionType} onValueChange={(value) => setQuestionType(value as any)}>
                          <SelectTrigger id="question-type">
                            <SelectValue placeholder="Select question type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                            <SelectItem value="short-answer">Short Answer</SelectItem>
                            <SelectItem value="essay">Essay/Long Answer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  
                  <Button 
                    onClick={selectedTask === 'practice-questions' 
                      ? generatePracticeQuestions 
                      : selectedTask === 'study-guide' 
                      ? generateStudyGuide 
                      : startMockExam
                    } 
                    disabled={isLoading || !courseTitle || !topics}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    {isLoading 
                      ? 'Processing...' 
                      : getButtonText(selectedTask, questions.length > 0)
                    }
                  </Button>
                </div>
              </CardContent>
              
              {/* Results Display */}
              {!isLoading && (
                <>
                  {/* Practice Questions Display */}
                  {selectedTask === 'practice-questions' && questions.length > 0 && (
                    <div className="px-6 pb-6">
                      <h3 className="text-lg font-semibold mb-4">Generated Practice Questions</h3>
                      <div className="space-y-4">
                        {questions.map((q, idx) => (
                          <Card key={q.id} className="overflow-hidden border-orange-100">
                            <CardHeader className="py-3 bg-orange-50">
                              <CardTitle className="text-base">Question {idx + 1}</CardTitle>
                            </CardHeader>
                            <CardContent className="py-4">
                              <p className="mb-4">{q.question}</p>
                              
                              {q.type === 'multiple-choice' && q.options && (
                                <div className="space-y-2 pl-4 mb-4">
                                  {q.options.map((option, optIdx) => (
                                    <div key={optIdx} className="flex items-start gap-2">
                                      <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-xs font-medium">
                                        {String.fromCharCode(65 + optIdx)}
                                      </div>
                                      <span>{option}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              <Separator className="my-3" />
                              
                              <div className="mt-3 space-y-2">
                                <div className="font-medium flex items-center gap-2 text-green-700">
                                  <CheckCircle2 className="h-4 w-4" />
                                  Answer:
                                </div>
                                <p className="text-sm pl-6">{q.answer}</p>
                                
                                <div className="font-medium flex items-center gap-2 text-orange-700 mt-2">
                                  <Lightbulb className="h-4 w-4" />
                                  Explanation:
                                </div>
                                <p className="text-sm pl-6">{q.explanation}</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      <Button 
                        onClick={startMockExam}
                        className="mt-6 bg-orange-600 hover:bg-orange-700"
                      >
                        Take as Mock Exam
                      </Button>
                    </div>
                  )}
                  
                  {/* Study Guide Display */}
                  {selectedTask === 'study-guide' && studyGuide && (
                    <div className="px-6 pb-6">
                      <h3 className="text-lg font-semibold mb-4">{studyGuide.title}</h3>
                      <div className="space-y-6">
                        {studyGuide.sections.map((section, idx) => (
                          <Card key={idx} className="overflow-hidden border-orange-100">
                            <CardHeader className="py-3 bg-orange-50">
                              <CardTitle className="text-base">{section.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="py-4">
                              <div className="whitespace-pre-line">{section.content}</div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      <div className="flex gap-3 mt-6">
                        <Button 
                          variant="outline"
                          className="border-orange-200 text-orange-700 hover:bg-orange-50"
                          onClick={() => window.print()}
                        >
                          Print Study Guide
                        </Button>
                        <Button 
                          onClick={() => handleTaskSelect('practice-questions')}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          Generate Practice Questions
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {isLoading && (
                <CardFooter className="flex-col items-stretch border-t px-6 py-5">
                  <h3 className="font-semibold text-lg mb-2">Generating content...</h3>
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
          )
        )}
      </main>
    </div>
  );
};

function getTaskTitle(task: string): string {
  switch (task) {
    case 'practice-questions':
      return 'Generate Practice Questions';
    case 'study-guide':
      return 'Create a Study Guide';
    case 'mock-exam':
      return 'Take a Mock Exam';
    default:
      return 'Exam Preparation Tool';
  }
}

function getTaskDescription(task: string): string {
  switch (task) {
    case 'practice-questions':
      return 'Generate custom practice questions based on your course material';
    case 'study-guide':
      return 'Create a comprehensive study guide with key concepts, formulas, and examples';
    case 'mock-exam':
      return 'Take a timed practice exam to simulate test conditions';
    default:
      return 'AI-powered exam preparation assistance for students';
  }
}

function getButtonText(task: string, hasQuestions: boolean): string {
  switch (task) {
    case 'practice-questions':
      return 'Generate Practice Questions';
    case 'study-guide':
      return 'Create Study Guide';
    case 'mock-exam':
      return hasQuestions ? 'Start Mock Exam' : 'Generate and Start Mock Exam';
    default:
      return 'Generate';
  }
}

export default ExamPreparationTool;
