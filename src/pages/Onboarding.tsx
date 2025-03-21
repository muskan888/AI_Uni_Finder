
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Globe, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getAllCommunities } from '@/lib/community-service';

const Onboarding = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [communities, setCommunities] = useState<any[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadCommunities = async () => {
      setLoading(true);
      try {
        const allCommunities = await getAllCommunities();
        const communitiesArray = Object.values(allCommunities);
        setCommunities(communitiesArray as any[]);
        setFilteredCommunities(communitiesArray as any[]);
      } catch (error) {
        console.error('Error loading communities:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCommunities();
    
    // Check if user has already been onboarded
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
    if (hasCompletedOnboarding === 'true') {
      navigate('/');
    }
  }, [navigate]);
  
  useEffect(() => {
    // Filter communities based on search query
    if (searchQuery.trim() === '') {
      setFilteredCommunities(communities);
    } else {
      const filtered = communities.filter(
        (community) => 
          community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          community.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCommunities(filtered);
    }
  }, [searchQuery, communities]);
  
  const handleCommunitySelect = (communityId: string) => {
    // Mark as onboarded
    localStorage.setItem('hasCompletedOnboarding', 'true');
    
    // Navigate to selected community
    navigate(`/r/${communityId}`);
  };
  
  const handleSkip = () => {
    // Mark as onboarded
    localStorage.setItem('hasCompletedOnboarding', 'true');
    
    // Navigate to home
    navigate('/');
  };
  
  const handleCreateNew = () => {
    // Mark as onboarded
    localStorage.setItem('hasCompletedOnboarding', 'true');
    
    // Navigate to create community page
    navigate('/create-community');
  };
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 appear-animation">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
            <Globe className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome to EduPath USA</h1>
          <p className="text-muted-foreground">
            Which U.S. university are you curious about?
          </p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search for a university..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border max-h-[400px] overflow-y-auto">
            {filteredCommunities.length > 0 ? (
              filteredCommunities.map((community) => (
                <button
                  key={community.id}
                  className="w-full p-4 flex items-center gap-3 hover:bg-secondary/30 transition-colors border-b last:border-b-0 text-left"
                  onClick={() => handleCommunitySelect(community.id)}
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {community.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">r/{community.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {community.members.toLocaleString()} members
                    </p>
                  </div>
                  
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-muted-foreground mb-4">No universities found matching "{searchQuery}"</p>
                <Button onClick={handleCreateNew} size="sm" className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  <span>Create this community</span>
                </Button>
              </div>
            )}
          </div>
        )}
        
        <Card className="bg-secondary/20 border-dashed">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex-1">
              <h3 className="font-medium">Can't find your university?</h3>
              <p className="text-sm text-muted-foreground">Create a new community for your university</p>
            </div>
            <Button onClick={handleCreateNew} size="sm" variant="secondary" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Create</span>
            </Button>
          </CardContent>
        </Card>
        
        <div className="flex justify-between">
          <Button variant="ghost" onClick={handleSkip}>
            Skip for now
          </Button>
          <Button onClick={() => navigate('/')} className="gap-2">
            <span>Browse all</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
