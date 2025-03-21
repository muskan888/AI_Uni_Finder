
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { initializeOpenAI } from '@/lib/openai-service';
import { toast } from 'sonner';
import { Sparkles, AlertCircle, Check } from 'lucide-react';

const ApiKeySetup: React.FC = () => {
  const [isKeySet, setIsKeySet] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [envKeyAvailable, setEnvKeyAvailable] = useState(false);

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        // Check for env variable
        const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
        
        if (envApiKey && typeof envApiKey === 'string' && envApiKey.trim() !== '') {
          try {
            const instance = initializeOpenAI(envApiKey);
            if (instance) {
              setIsKeySet(true);
              setEnvKeyAvailable(true);
              console.log('API key from .env is valid and working');
            } else {
              console.warn('API key from .env was found but initialization failed');
            }
          } catch (error) {
            console.error('Error initializing OpenAI with env var:', error);
          }
        } else {
          console.log('No env API key found');
          
          // Check for localStorage key as fallback
          const localStorageKey = localStorage.getItem('openai-api-key');
          if (localStorageKey) {
            try {
              const parsedKey = JSON.parse(localStorageKey);
              if (parsedKey && typeof parsedKey === 'string' && parsedKey.trim() !== '') {
                const instance = initializeOpenAI(parsedKey);
                if (instance) {
                  setIsKeySet(true);
                  console.log('API key from localStorage is valid and working');
                }
              }
            } catch (error) {
              console.error('Error checking localStorage API key:', error);
            }
          } else {
            toast.error('Please set your OpenAI API key in the .env file');
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    checkApiKey();
  }, []);

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto bg-[#F4F5FC] border-[#8EBBFF]/30">
        <CardContent className="py-6">
          <div className="flex justify-center items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#8EBBFF]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isKeySet) {
    return (
      <Card className="w-full max-w-md mx-auto bg-[#F4F5FC] border-[#8EBBFF]/30">
        <CardHeader>
          <CardTitle className="text-[#24293E] flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#8EBBFF]" /> 
            AI Features Enabled
          </CardTitle>
          <CardDescription className="text-[#24293E]/70">
            {envKeyAvailable 
              ? "Using API key from environment variable (.env file)" 
              : "Using API key from browser storage"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-[#8EBBFF]/10 text-[#24293E]/80 text-sm p-3 rounded-md border border-[#8EBBFF]/20">
            <p className="font-['Montserrat'] flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              You now have access to advanced AI features:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Post summarization</li>
              <li>Content generation for post suggestions</li>
              <li>Semantic search for communities and posts</li>
              <li>Personalized community recommendations</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-[#F4F5FC] border-[#8EBBFF]/30">
      <CardHeader>
        <CardTitle className="text-[#24293E] flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" /> 
          API Key Not Found
        </CardTitle>
        <CardDescription className="text-[#24293E]/70">
          Please set your OpenAI API key in the .env file
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-[#8EBBFF]/10 text-[#24293E]/80 text-sm p-3 rounded-md border border-[#8EBBFF]/20">
          <p className="font-['Montserrat']">
            To enable AI features, follow these steps:
          </p>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>Create a copy of .env.example named .env in the root of your project</li>
            <li>Add your OpenAI API key to the .env file:</li>
            <div className="bg-gray-100 p-2 rounded mt-1 mb-2 font-mono text-sm overflow-auto whitespace-pre-wrap break-words">
              VITE_OPENAI_API_KEY=your_openai_api_key_here
            </div>
            <li>Replace "your_openai_api_key_here" with your actual OpenAI API key</li>
            <li>Restart your development server</li>
          </ol>
          <p className="mt-2 text-xs text-red-500">
            Note: For deployment, add the API key to your Vercel environment variables.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeySetup;
