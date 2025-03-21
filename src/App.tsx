
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import Community from './pages/Community';
import CreateCommunity from './pages/CreateCommunity';
import Post from './pages/Post';
import Explore from './pages/Explore';
import Trending from './pages/Trending';
import Onboarding from './pages/Onboarding';
import NotFound from './pages/NotFound';
import ResearchAssistant from './pages/ResearchAssistant';
import TimeManagementCoach from './pages/TimeManagementCoach';
import ExamPreparationTool from './pages/ExamPreparationTool';
import PeerReviewSimulator from './pages/PeerReviewSimulator';
import ScholarshipEssayGenerator from './pages/ScholarshipEssayGenerator';
import './App.css';
import { initializeOpenAI } from './lib/openai-service';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check user's preferred color scheme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    
    // Add dark mode class if needed
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
    
    // Initialize OpenAI service with API key from environment
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (apiKey) {
      initializeOpenAI(apiKey);
    }
    
    // Simulate loading time (you can remove this in production)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-[#f8f9fa] via-[#e9ecef] to-[#dee2e6] dark:from-[#1a2e4c] dark:via-[#0f172a] dark:to-[#0c1524]">
        <div className="flex flex-col items-center">
          <div className="animate-pulse">
            <div className="h-16 w-16 bg-[#4682B4]/30 rounded-full flex items-center justify-center">
              <div className="h-10 w-10 bg-[#4682B4] dark:bg-[#87CEFA] rounded-full"></div>
            </div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen w-full overflow-x-hidden bg-[#f8f9fa] dark:bg-[#0f172a] text-foreground transition-colors duration-300">
        <Routes>
          <Route path="/" element={<Navigate to="/index" replace />} />
          <Route path="/index" element={<Index />} />
          <Route path="/r/:communityId" element={<Community />} />
          <Route path="/create-community" element={<CreateCommunity />} />
          <Route path="/post/:postId" element={<Post />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/research-assistant" element={<ResearchAssistant />} />
          <Route path="/time-management-coach" element={<TimeManagementCoach />} />
          <Route path="/exam-preparation-tool" element={<ExamPreparationTool />} />
          <Route path="/peer-review-simulator" element={<PeerReviewSimulator />} />
          <Route path="/scholarship-essay-generator" element={<ScholarshipEssayGenerator />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
