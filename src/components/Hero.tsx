
import React, { useEffect, useState } from 'react';
import { GraduationCap, BookOpen, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Set visibility after a short delay for animation purposes
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleJoinJourney = () => {
    // Navigate to onboarding or registration page
    navigate('/onboarding');
  };

  const handleLearnMore = () => {
    // Scroll to the university feed section smoothly
    const feedSection = document.querySelector('#university-feed');
    if (feedSection) {
      feedSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Generate a smaller number of particles for a cleaner look
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: 1 + Math.random() * 2,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 4,
    color: [
      'rgba(173, 216, 230, 0.5)', // Light Blue
      'rgba(135, 206, 250, 0.5)', // Sky Blue
      'rgba(100, 149, 237, 0.5)', // Cornflower Blue
      'rgba(70, 130, 180, 0.5)', // Steel Blue
      'rgba(240, 248, 255, 0.5)', // Alice Blue
    ][Math.floor(Math.random() * 5)]
  }));

  return (
    <div className="relative w-full min-h-screen py-16 md:py-24 px-6 md:px-10 overflow-hidden bg-gradient-to-br from-[#f8f9fa] via-[#e9ecef] to-[#dee2e6] dark:bg-gradient-to-br dark:from-[#1a2e4c] dark:via-[#0f172a] dark:to-[#0c1524]">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f8f9fa] via-[#e9ecef] to-[#dee2e6] dark:from-[#1a2e4c] dark:via-[#0f172a] dark:to-[#0c1524] opacity-90 pointer-events-none" />
      
      {/* Soft animated particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full opacity-60 animate-twinkle pointer-events-none"
          style={{
            top: particle.top,
            left: particle.left,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size}px ${particle.size / 2}px ${particle.color}`,
          }}
        />
      ))}
      
      {/* Scattered icons with subtle floating animation */}
      <div className="absolute top-[15%] left-[10%] transition-transform duration-300 hover:scale-110">
        <GraduationCap className="h-10 w-10 md:h-12 md:w-12 text-[#4682B4] dark:text-[#87CEFA] animate-float-custom" 
          style={{ animationDelay: '0s', filter: 'drop-shadow(0 0 4px rgba(70, 130, 180, 0.4))' }} />
      </div>
      
      <div className="absolute bottom-[25%] left-[15%] transition-transform duration-300 hover:scale-110">
        <BookOpen className="h-8 w-8 md:h-10 md:w-10 text-[#1E90FF] dark:text-[#ADD8E6] animate-float-custom" 
          style={{ animationDelay: '1s', filter: 'drop-shadow(0 0 4px rgba(30, 144, 255, 0.4))' }} />
      </div>
      
      <div className="absolute top-[40%] right-[10%] transition-transform duration-300 hover:scale-110">
        <User className="h-8 w-8 md:h-10 md:w-10 text-[#6495ED] dark:text-[#B0E0E6] animate-float-custom" 
          style={{ animationDelay: '2s', filter: 'drop-shadow(0 0 4px rgba(100, 149, 237, 0.4))' }} />
      </div>
      
      {/* Main content */}
      <div className="relative h-full flex flex-col items-center justify-center max-w-4xl mx-auto text-center z-10 py-10">
        <h1 
          className={`text-3xl md:text-4xl xl:text-5xl font-display font-bold mb-6 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ 
            color: 'hsl(var(--foreground))',
            letterSpacing: '-0.02em',
          }}
        >
          Welcome to UniGlobe Hub
        </h1>
        
        <p 
          className={`text-lg md:text-xl font-sans text-gray-600 dark:text-gray-300 mb-4 max-w-3xl tracking-wide transition-opacity duration-500 delay-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
          Explore the Universe of U.S. Universities
        </p>
        
        <p 
          className={`text-sm md:text-base font-sans text-gray-500 dark:text-gray-400 mb-10 transition-opacity duration-500 delay-400 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
          AI-powered University Search
        </p>
        
        <div 
          className={`flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 transition-opacity duration-500 delay-600 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
          <Button 
            onClick={handleJoinJourney}
            variant="default"
            className="py-2 px-4 rounded-md shadow-sm hover:shadow-md transition-all duration-300 text-base font-medium"
          >
            Join the Journey
          </Button>
          
          <Button 
            onClick={handleLearnMore}
            variant="outline"
            className="py-2 px-4 rounded-md transition-all duration-300 text-base font-medium"
          >
            Learn More
          </Button>
        </div>

        {/* Footer credit */}
        <div className="absolute bottom-5 w-full text-center text-sm text-gray-500 dark:text-gray-400">
          Made with ❤️ by Muskan Dhingra
        </div>
      </div>
    </div>
  );
};

export default Hero;
