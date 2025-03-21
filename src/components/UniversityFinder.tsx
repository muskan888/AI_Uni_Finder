
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUniversityRecommendations, searchUniversityInfo, initializeOpenAI } from '@/lib/openai-service';
import { School, MapPin, DollarSign, Search, Loader2, ExternalLink, BookOpen, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface University {
  name: string;
  description: string;
  location: string;
  tuition: string;
  majorStrengths: string[];
  website?: string;
}

interface SearchResult {
  title: string;
  content: string;
  url?: string;
}

// Create a custom hook to handle API key
export const useApiKey = () => {
  const [apiKey, setApiKey] = useLocalStorage<string | null>('openai-api-key', null);
  const [isEnvKeyAvailable, setIsEnvKeyAvailable] = useState(false);
  
  useEffect(() => {
    // Check if environment variable is available
    const envKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (envKey && typeof envKey === 'string' && envKey.trim() !== '') {
      setIsEnvKeyAvailable(true);
      // Initialize OpenAI with environment variable
      initializeOpenAI(envKey);
    } else if (apiKey) {
      // Fall back to stored key if available
      initializeOpenAI(apiKey);
    }
  }, [apiKey]);
  
  return {
    apiKey,
    setApiKey,
    hasKey: isEnvKeyAvailable || !!apiKey,
    isEnvKeyAvailable
  };
};

const UniversityFinder: React.FC = () => {
  // Recommendation state
  const [major, setMajor] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [recommendations, setRecommendations] = useState<University[]>([]);

  // Information search state
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [sources, setSources] = useState<{url: string, title: string}[]>([]);
  const [isInfoSearching, setIsInfoSearching] = useState(false);
  
  // API key state
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const { apiKey, setApiKey, hasKey, isEnvKeyAvailable } = useApiKey();

  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }
    
    setApiKey(apiKeyInput);
    setShowApiKeyInput(false);
    setApiKeyInput('');
    toast.success('API key saved successfully');
    
    // Initialize OpenAI with the new key
    initializeOpenAI(apiKeyInput);
  };

  const handleRecommendations = async () => {
    if (!hasKey) {
      if (isEnvKeyAvailable) {
        // Directly use the environment variable
        toast.info('Using API key from environment variable');
      } else {
        setShowApiKeyInput(true);
        toast.error('OpenAI API key required', {
          description: 'Please enter your OpenAI API key to use this feature',
          duration: 5000,
        });
        return;
      }
    }

    if (!major || !budget || !location) {
      toast.error('Please fill in all fields', {
        duration: 3000,
      });
      return;
    }

    setIsSearching(true);
    setRecommendations([]);

    try {
      const results = await getUniversityRecommendations(major, budget, location);
      setRecommendations(results);
      
      if (results.length === 0) {
        toast.info('No recommendations found for your criteria', {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Recommendation error:', error);
      toast.error('Failed to get recommendations', {
        description: 'Please check your API key and try again',
        duration: 5000,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleInfoSearch = async () => {
    if (!hasKey) {
      if (isEnvKeyAvailable) {
        // Directly use the environment variable
        toast.info('Using API key from environment variable');
      } else {
        setShowApiKeyInput(true);
        toast.error('OpenAI API key required', {
          description: 'Please enter your OpenAI API key to use this feature',
          duration: 5000,
        });
        return;
      }
    }

    if (!query.trim()) {
      toast.error('Please enter a search query', {
        duration: 3000,
      });
      return;
    }

    setIsInfoSearching(true);
    setSearchResults([]);
    setSources([]);

    try {
      const results = await searchUniversityInfo(query);
      setSearchResults(results.results);
      setSources(results.sources || []);
      
      if (results.results.length === 0) {
        toast.info('No results found for your search', {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Info search error:', error);
      toast.error('Failed to search for information', {
        description: 'Please check your API key and try again',
        duration: 5000,
      });
    } finally {
      setIsInfoSearching(false);
    }
  };

  return (
    <Card className="w-full shadow-sm border-[#8EBBFF]/20">
      <CardHeader className="bg-gradient-to-r from-[#F4F5FC] to-[#E9EFFD] border-b border-[#8EBBFF]/20">
        <CardTitle className="text-xl text-[#24293E] flex items-center gap-2">
          <School className="h-5 w-5 text-primary" />
          University Finder
        </CardTitle>
        <CardDescription className="text-[#24293E]/70">
          Find the perfect university based on your preferences or search for specific information
        </CardDescription>
      </CardHeader>
      
      {!isEnvKeyAvailable && showApiKeyInput ? (
        <CardContent className="p-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              OpenAI API Key Required
            </h3>
            <p className="text-xs text-blue-700 mb-3">
              To use the University Finder, you need to provide your OpenAI API key. 
              This key will be stored locally in your browser and never sent to our servers.
            </p>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Enter your OpenAI API key"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="flex-1 text-sm"
              />
              <Button size="sm" onClick={handleSaveApiKey}>Save Key</Button>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Don't have an API key? Get one from{" "}
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-blue-800"
              >
                OpenAI's website
              </a>.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowApiKeyInput(false)}
            className="w-full"
          >
            Cancel
          </Button>
        </CardContent>
      ) : (
        <Tabs defaultValue="recommendations" className="w-full">
          <div className="px-6 pt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="information">Information Search</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="recommendations" className="pt-2 pb-6">
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <label htmlFor="major" className="block text-sm font-medium text-[#24293E]">
                    <BookOpen className="h-4 w-4 inline mr-1" /> Field of Study / Major
                  </label>
                  <Input
                    id="major"
                    placeholder="e.g., Computer Science"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="budget" className="block text-sm font-medium text-[#24293E]">
                    <DollarSign className="h-4 w-4 inline mr-1" /> Budget Range
                  </label>
                  <Select value={budget} onValueChange={setBudget}>
                    <SelectTrigger id="budget">
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Under $15,000/year)</SelectItem>
                      <SelectItem value="moderate">Moderate ($15,000 - $30,000/year)</SelectItem>
                      <SelectItem value="high">High ($30,000 - $50,000/year)</SelectItem>
                      <SelectItem value="very high">Very High (Above $50,000/year)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="location" className="block text-sm font-medium text-[#24293E]">
                    <MapPin className="h-4 w-4 inline mr-1" /> Preferred Location
                  </label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger id="location">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Northeast US">Northeast US</SelectItem>
                      <SelectItem value="Southeast US">Southeast US</SelectItem>
                      <SelectItem value="Midwest US">Midwest US</SelectItem>
                      <SelectItem value="Southwest US">Southwest US</SelectItem>
                      <SelectItem value="West Coast US">West Coast US</SelectItem>
                      <SelectItem value="Rural Areas">Rural Areas</SelectItem>
                      <SelectItem value="Urban Cities">Urban Cities</SelectItem>
                      <SelectItem value="Anywhere in US">Anywhere in US</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              {hasKey && !isEnvKeyAvailable && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowApiKeyInput(true)}
                  className="text-xs"
                >
                  Change API Key
                </Button>
              )}
              <div className="flex-grow"></div>
              <Button 
                onClick={handleRecommendations} 
                disabled={isSearching || !major || !budget || !location}
                className="bg-[#8EBBFF] hover:bg-[#7DAEFF] text-white"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finding universities...
                  </>
                ) : (
                  <>
                    <School className="mr-2 h-4 w-4" />
                    Find Universities
                  </>
                )}
              </Button>
            </CardFooter>
            
            {recommendations.length > 0 && (
              <div className="px-6 pt-4 space-y-4">
                <h3 className="text-lg font-semibold text-[#24293E]">Recommended Universities</h3>
                <div className="grid grid-cols-1 gap-4">
                  {recommendations.map((university, index) => (
                    <Card key={index} className="overflow-hidden border-[#8EBBFF]/20">
                      <div className="p-6">
                        <h4 className="text-lg font-semibold text-[#24293E] mb-2 break-words">{university.name}</h4>
                        <p className="text-sm text-[#24293E]/70 mb-4 break-words">{university.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-start space-x-2">
                            <MapPin className="h-4 w-4 text-[#8EBBFF] mt-0.5 flex-shrink-0" />
                            <span className="text-[#24293E]/80 break-words">{university.location}</span>
                          </div>
                          
                          <div className="flex items-start space-x-2">
                            <DollarSign className="h-4 w-4 text-[#8EBBFF] mt-0.5 flex-shrink-0" />
                            <span className="text-[#24293E]/80 break-words">{university.tuition}</span>
                          </div>
                          
                          <div className="flex items-start space-x-2">
                            <BookOpen className="h-4 w-4 text-[#8EBBFF] mt-0.5 flex-shrink-0" />
                            <span className="text-[#24293E]/80 break-words">
                              {university.majorStrengths?.join(', ') || 'Various majors available'}
                            </span>
                          </div>
                        </div>
                        
                        {university.website && (
                          <Button 
                            variant="link" 
                            className="px-0 text-[#8EBBFF] hover:text-[#7DAEFF] mt-2"
                            onClick={() => window.open(university.website, '_blank')}
                          >
                            Visit Website <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="information" className="pt-2 pb-6">
            <CardContent>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label htmlFor="query" className="block text-sm font-medium text-[#24293E]">
                    <Search className="h-4 w-4 inline mr-1" /> Search for University Information
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="query"
                      placeholder="e.g., Scholarship opportunities for international students"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleInfoSearch} 
                      disabled={isInfoSearching || !query.trim()}
                      className="bg-[#8EBBFF] hover:bg-[#7DAEFF] text-white whitespace-nowrap"
                    >
                      {isInfoSearching ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        'Search'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="justify-start pt-0">
              {hasKey && !isEnvKeyAvailable && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowApiKeyInput(true)}
                  className="text-xs"
                >
                  Change API Key
                </Button>
              )}
            </CardFooter>
            
            {searchResults.length > 0 && (
              <div className="px-6 pt-2 space-y-6">
                <div className="space-y-4">
                  {searchResults.map((result, index) => (
                    <Card key={index} className="overflow-hidden border-[#8EBBFF]/20">
                      <div className="p-6">
                        <h4 className="text-lg font-semibold text-[#24293E] mb-2 break-words">{result.title}</h4>
                        <p className="text-sm text-[#24293E]/70 mb-2 break-words whitespace-normal overflow-auto max-h-[200px]">{result.content}</p>
                        
                        {result.url && (
                          <Button 
                            variant="link" 
                            className="px-0 text-[#8EBBFF] hover:text-[#7DAEFF]"
                            onClick={() => window.open(result.url, '_blank')}
                          >
                            Read More <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
                
                {sources.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-[#24293E] mb-2">Sources</h3>
                    <ul className="text-xs text-[#24293E]/70 space-y-1 break-words">
                      {sources.map((source, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="flex-shrink-0">{index + 1}.</span>
                          <a 
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#8EBBFF] hover:underline hover:text-[#7DAEFF] break-words"
                          >
                            {source.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </Card>
  );
};

export default UniversityFinder;
