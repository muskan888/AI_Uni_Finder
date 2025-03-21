
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  ArrowLeft, 
  Calendar, 
  Timer, 
  BarChart, 
  BellRing,
  AlarmClock,
  BookText
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
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import ApiKeySetup from '@/components/ApiKeySetup';
import { generateChatResponse } from '@/lib/openai-service';

interface ScheduleItem {
  time: string;
  activity: string;
  duration: string;
  priority: 'high' | 'medium' | 'low';
}

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

const TimeManagementCoach = () => {
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [courses, setCourses] = useState('');
  const [deadlines, setDeadlines] = useState('');
  const [studyPreference, setStudyPreference] = useState('');
  const [balancePreference, setBalancePreference] = useState('balanced');
  const [result, setResult] = useState<string | null>(null);
  const [weeklySchedule, setWeeklySchedule] = useState<Record<DayOfWeek, ScheduleItem[]> | null>(null);
  const [studyTips, setStudyTips] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleBack = () => {
    if (selectedTask) {
      setSelectedTask(null);
      setResult(null);
      setWeeklySchedule(null);
      setStudyTips([]);
    } else {
      navigate('/');
    }
  };

  const handleTaskSelect = (task: string) => {
    setSelectedTask(task);
    setResult(null);
    setWeeklySchedule(null);
    setStudyTips([]);
  };

  const generateSchedule = async () => {
    if (!courses) {
      toast.error('Please enter your course information');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await generateChatResponse([
        {
          role: 'system',
          content: `You are an AI time management coach for international students. Create a detailed weekly schedule with specific time slots. Format your response in a clear, structured way that can be parsed by JavaScript. Include separate sections for: 1) Schedule for each day of the week with specific time slots 2) Study techniques 3) Balance recommendations.`
        },
        {
          role: 'user',
          content: `Create a weekly schedule for me based on these courses: ${courses}. 
          Important deadlines: ${deadlines || 'None specified'}. 
          My study preferences: ${studyPreference || 'No specific preference'}.
          I prefer a ${balancePreference} balance between academics and social life.`
        }
      ]);
      
      // Process and display the response
      const processedResponse = processScheduleResponse(response);
      setResult(response);
      
      toast.success('Your personalized schedule is ready!');
    } catch (error) {
      console.error('Error generating schedule:', error);
      toast.error('Failed to generate schedule. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateStudyTips = async () => {
    if (!courses) {
      toast.error('Please enter your course information');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await generateChatResponse([
        {
          role: 'system',
          content: `You are an AI time management coach for international students. Provide 5 specific and detailed study techniques that would be most effective for the student's courses.`
        },
        {
          role: 'user',
          content: `Recommend study techniques for these courses: ${courses}. 
          My preferences: ${studyPreference || 'No specific preference'}.`
        }
      ]);
      
      // Extract study tips from response
      const tips = response.split(/\d\./).filter(Boolean).map(tip => tip.trim());
      setStudyTips(tips);
      setResult(response);
      
      toast.success('Study techniques generated!');
    } catch (error) {
      console.error('Error generating study tips:', error);
      toast.error('Failed to generate study tips. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const processScheduleResponse = (response: string) => {
    // In a real implementation, you would parse the response
    // to extract the schedule and study tips
    // For now, we'll just set some sample data
    setWeeklySchedule({
      monday: [
        { time: '9:00 AM', activity: 'Math 101', duration: '1h', priority: 'high' },
        { time: '11:00 AM', activity: 'Study Group', duration: '2h', priority: 'medium' },
        { time: '2:00 PM', activity: 'Essay Writing', duration: '1.5h', priority: 'high' },
      ],
      tuesday: [
        { time: '10:00 AM', activity: 'Physics Lab', duration: '2h', priority: 'high' },
        { time: '1:00 PM', activity: 'Research', duration: '2h', priority: 'medium' },
      ],
      wednesday: [
        { time: '9:00 AM', activity: 'Math 101', duration: '1h', priority: 'high' },
        { time: '12:00 PM', activity: 'Lunch with Friends', duration: '1h', priority: 'low' },
        { time: '3:00 PM', activity: 'Study Session', duration: '2h', priority: 'medium' },
      ],
      thursday: [
        { time: '11:00 AM', activity: 'Literature Review', duration: '1.5h', priority: 'medium' },
        { time: '2:00 PM', activity: 'Group Project', duration: '2h', priority: 'high' },
      ],
      friday: [
        { time: '9:00 AM', activity: 'Math 101', duration: '1h', priority: 'high' },
        { time: '12:00 PM', activity: 'Exercise', duration: '1h', priority: 'low' },
        { time: '4:00 PM', activity: 'Social Event', duration: '2h', priority: 'low' },
      ],
      saturday: [
        { time: '10:00 AM', activity: 'Review Notes', duration: '2h', priority: 'medium' },
        { time: '3:00 PM', activity: 'Free Time', duration: '4h', priority: 'low' },
      ],
      sunday: [
        { time: '11:00 AM', activity: 'Prepare for Week', duration: '2h', priority: 'medium' },
        { time: '2:00 PM', activity: 'Relaxation', duration: '3h', priority: 'low' },
      ],
    });
    
    setStudyTips([
      'Use the Pomodoro Technique: 25 minutes of focused study followed by a 5-minute break.',
      'Create concept maps to visualize relationships between ideas for complex subjects.',
      'Use spaced repetition for memorization tasks, especially for language learning.',
      'Form a study group with classmates to discuss challenging concepts.',
      'Try teaching the material to someone else to solidify your understanding.'
    ]);
    
    return response;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-background">
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
          <Clock className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-display font-bold">Time Management Coach</h1>
        </div>
        
        <div className="mb-8">
          <ApiKeySetup />
        </div>
        
        {!selectedTask ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">How can I help you manage your time?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer border-green-200/50" onClick={() => handleTaskSelect('weekly-schedule')}>
                <CardHeader className="pb-2">
                  <Calendar className="h-6 w-6 text-green-600 mb-2" />
                  <CardTitle className="text-lg">Weekly Schedule Generator</CardTitle>
                  <CardDescription>Create a personalized weekly schedule based on your courses and commitments</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer border-green-200/50" onClick={() => handleTaskSelect('study-techniques')}>
                <CardHeader className="pb-2">
                  <Timer className="h-6 w-6 text-green-600 mb-2" />
                  <CardTitle className="text-lg">Study Techniques</CardTitle>
                  <CardDescription>Get recommended study methods tailored to your learning style</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer border-green-200/50" onClick={() => handleTaskSelect('work-life-balance')}>
                <CardHeader className="pb-2">
                  <BarChart className="h-6 w-6 text-green-600 mb-2" />
                  <CardTitle className="text-lg">Work-Life Balance Tips</CardTitle>
                  <CardDescription>Learn how to balance academics, social life, and self-care</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer border-green-200/50" onClick={() => handleTaskSelect('deadline-tracker')}>
                <CardHeader className="pb-2">
                  <BellRing className="h-6 w-6 text-green-600 mb-2" />
                  <CardTitle className="text-lg">Deadline Tracker</CardTitle>
                  <CardDescription>Organize your assignment due dates and create a completion plan</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer border-green-200/50" onClick={() => handleTaskSelect('productivity-coach')}>
                <CardHeader className="pb-2">
                  <AlarmClock className="h-6 w-6 text-green-600 mb-2" />
                  <CardTitle className="text-lg">Productivity Coach</CardTitle>
                  <CardDescription>Get personalized advice to overcome procrastination and stay focused</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer border-green-200/50" onClick={() => handleTaskSelect('exam-period-planner')}>
                <CardHeader className="pb-2">
                  <BookText className="h-6 w-6 text-green-600 mb-2" />
                  <CardTitle className="text-lg">Exam Period Planner</CardTitle>
                  <CardDescription>Create a structured study plan for your exam period</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="shadow-sm border-green-200/50">
            <CardHeader>
              <CardTitle>{getTaskTitle(selectedTask)}</CardTitle>
              <CardDescription>{getTaskDescription(selectedTask)}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="courses">Your Courses</Label>
                  <Textarea
                    id="courses"
                    placeholder="List your courses with their schedules (e.g., Math 101: Mon/Wed/Fri 9-10AM, Physics 202: Tue/Thu 2-4PM)"
                    value={courses}
                    onChange={(e) => setCourses(e.target.value)}
                    className="min-h-20"
                  />
                </div>
                
                {(selectedTask === 'weekly-schedule' || selectedTask === 'deadline-tracker' || selectedTask === 'exam-period-planner') && (
                  <div className="space-y-2">
                    <Label htmlFor="deadlines">Important Deadlines</Label>
                    <Textarea
                      id="deadlines"
                      placeholder="List your upcoming assignments, projects, and exams with due dates"
                      value={deadlines}
                      onChange={(e) => setDeadlines(e.target.value)}
                      className="min-h-20"
                    />
                  </div>
                )}
                
                {(selectedTask === 'study-techniques' || selectedTask === 'productivity-coach') && (
                  <div className="space-y-2">
                    <Label htmlFor="study-preference">Study Preferences</Label>
                    <Textarea
                      id="study-preference"
                      placeholder="Describe how you prefer to study (e.g., visual learner, need background noise, prefer studying in groups)"
                      value={studyPreference}
                      onChange={(e) => setStudyPreference(e.target.value)}
                      className="min-h-20"
                    />
                  </div>
                )}
                
                {(selectedTask === 'weekly-schedule' || selectedTask === 'work-life-balance') && (
                  <div className="space-y-2">
                    <Label htmlFor="balance-preference">Academic/Social Balance</Label>
                    <Select value={balancePreference} onValueChange={setBalancePreference}>
                      <SelectTrigger id="balance-preference">
                        <SelectValue placeholder="Select your preferred balance" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic-focused">Academic-focused (80% study, 20% social)</SelectItem>
                        <SelectItem value="balanced">Balanced (60% study, 40% social)</SelectItem>
                        <SelectItem value="social-focused">Social-focused (40% study, 60% social)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <Button 
                  onClick={selectedTask === 'study-techniques' ? generateStudyTips : generateSchedule} 
                  disabled={isLoading || !courses}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? 'Processing...' : getButtonText(selectedTask)}
                </Button>
              </div>
            </CardContent>
            
            {(weeklySchedule || studyTips.length > 0) && (
              <div className="px-6 pb-6">
                <Tabs defaultValue="schedule" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                    <TabsTrigger value="techniques">Study Techniques</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="schedule" className="space-y-4">
                    {weeklySchedule && Object.entries(weeklySchedule).map(([day, activities]) => (
                      <Card key={day} className="overflow-hidden border-green-100">
                        <CardHeader className="py-3 bg-green-50">
                          <CardTitle className="text-lg capitalize">{day}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="divide-y divide-gray-100">
                            {activities.map((activity, index) => (
                              <div 
                                key={index} 
                                className="p-3 flex justify-between items-center"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="text-sm font-medium text-gray-900">{activity.time}</div>
                                  <div>{activity.activity}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">{activity.duration}</span>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(activity.priority)}`}>
                                    {activity.priority}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="techniques" className="space-y-4">
                    <Card className="border-green-100">
                      <CardHeader>
                        <CardTitle className="text-lg">Recommended Study Techniques</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {studyTips.map((tip, index) => (
                            <li key={index} className="flex gap-2">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-medium">
                                {index + 1}
                              </div>
                              <p>{tip}</p>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
            
            {isLoading && (
              <CardFooter className="flex-col items-stretch border-t px-6 py-5">
                <h3 className="font-semibold text-lg mb-2">Creating your plan...</h3>
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
    case 'weekly-schedule':
      return 'Weekly Schedule Generator';
    case 'study-techniques':
      return 'Personalized Study Techniques';
    case 'work-life-balance':
      return 'Work-Life Balance Recommendations';
    case 'deadline-tracker':
      return 'Deadline Management System';
    case 'productivity-coach':
      return 'Productivity Coach';
    case 'exam-period-planner':
      return 'Exam Period Planner';
    default:
      return 'Time Management Coach';
  }
}

function getTaskDescription(task: string): string {
  switch (task) {
    case 'weekly-schedule':
      return 'Create a customized weekly schedule based on your courses and commitments';
    case 'study-techniques':
      return 'Get personalized study techniques that match your learning style and courses';
    case 'work-life-balance':
      return 'Receive tips for balancing academics, social life, and self-care';
    case 'deadline-tracker':
      return 'Organize your assignment deadlines and create a completion plan';
    case 'productivity-coach':
      return 'Get advice to overcome procrastination and maintain focus';
    case 'exam-period-planner':
      return 'Create an optimal study plan for your upcoming exams';
    default:
      return 'AI-powered time management assistance for students';
  }
}

function getButtonText(task: string): string {
  switch (task) {
    case 'weekly-schedule':
      return 'Generate Weekly Schedule';
    case 'study-techniques':
      return 'Get Study Techniques';
    case 'work-life-balance':
      return 'Get Balance Recommendations';
    case 'deadline-tracker':
      return 'Create Deadline Plan';
    case 'productivity-coach':
      return 'Get Productivity Advice';
    case 'exam-period-planner':
      return 'Create Exam Study Plan';
    default:
      return 'Generate';
  }
}

function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default TimeManagementCoach;
