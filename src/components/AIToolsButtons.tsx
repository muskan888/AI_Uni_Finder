
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
  ClipboardCheck, 
  Clock, 
  FileEdit, 
  ScrollText,
  ArrowRight,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AIToolButtonProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  path: string;
  isImplemented?: boolean;
}

const AIToolButton: React.FC<AIToolButtonProps> = ({ 
  icon, 
  title, 
  description, 
  color,
  bgColor,
  path,
  isImplemented = false,
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (isImplemented) {
      navigate(path);
    } else {
      toast.info(`${title} will be available soon!`, {
        description: "We're currently implementing this feature.",
        duration: 3000,
      });
    }
  };
  
  return (
    <Button
      variant="outline"
      className={cn(
        "relative h-full w-full flex flex-col items-start p-6 gap-4 hover:border-opacity-50 hover:shadow-lg transition-all duration-300 backdrop-blur-sm border border-border/50 group overflow-hidden",
        `hover:border-${color}/50 hover:bg-${bgColor}/10`
      )}
      onClick={handleClick}
    >
      <div className={cn(
        "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
        `bg-${bgColor}/20 text-${color} group-hover:bg-${bgColor}/30 group-hover:scale-110`
      )}>
        {icon}
      </div>
      <div className="text-left space-y-2 z-10 w-full">
        <h3 className="font-medium text-lg flex items-center gap-2 break-words line-clamp-1">
          {title}
          {!isImplemented && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full whitespace-nowrap">Coming Soon</span>}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 break-words">{description}</p>
      </div>
      <div className={cn(
        "absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0",
        `text-${color}`
      )}>
        <ArrowRight size={20} />
      </div>
      {isImplemented && (
        <div className="absolute top-4 right-4">
          <Sparkles className="h-4 w-4 text-yellow-400" />
        </div>
      )}
      <div className={cn(
        "absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-all duration-500",
        `bg-${color}`
      )} />
    </Button>
  );
};

const AIToolsButtons: React.FC = () => {  
  const tools = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Research Assistant",
      description: "Generate topic ideas, summarize articles, find sources, and format citations.",
      color: "blue-600",
      bgColor: "blue-200",
      path: "/research-assistant",
      isImplemented: true
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Time Management Coach",
      description: "Get personalized schedules, study techniques, and balance academics with social life.",
      color: "green-600",
      bgColor: "green-200",
      path: "/time-management-coach",
      isImplemented: true
    },
    {
      icon: <ClipboardCheck className="h-6 w-6" />,
      title: "Exam Preparation Tool",
      description: "Create practice questions, mock exams, and study guides based on your courses.",
      color: "orange-600",
      bgColor: "orange-200",
      path: "/exam-preparation-tool",
      isImplemented: true
    },
    {
      icon: <FileEdit className="h-6 w-6" />,
      title: "Peer Review Simulator",
      description: "Get constructive feedback on your drafts before submission.",
      color: "purple-600",
      bgColor: "purple-200",
      path: "/peer-review-simulator",
      isImplemented: true
    },
    {
      icon: <ScrollText className="h-6 w-6" />,
      title: "Scholarship Essay Generator",
      description: "Craft compelling scholarship essays with AI assistance.",
      color: "pink-600",
      bgColor: "pink-200",
      path: "/scholarship-essay-generator",
      isImplemented: true
    }
  ];

  return (
    <Card className="shadow-md border-[#8EBBFF]/20 bg-white/80 backdrop-blur-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-[#F4F5FC] to-[#E9EFFD] border-b border-[#8EBBFF]/20">
        <CardTitle className="flex items-center gap-2 text-xl text-[#24293E]">
          <GraduationCap className="h-6 w-6 text-primary" />
          AI-Powered Student Tools
        </CardTitle>
        <CardDescription className="text-[#24293E]/70 truncate">
          Enhance your academic journey with these AI-powered assistants
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool, index) => (
            <AIToolButton
              key={index}
              icon={tool.icon}
              title={tool.title}
              description={tool.description}
              color={tool.color}
              bgColor={tool.bgColor}
              path={tool.path}
              isImplemented={tool.isImplemented}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIToolsButtons;
