
import React, { useState, useEffect } from 'react';
import { Search, Filter, Briefcase, GraduationCap, Globe, Building, Database, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import { getAllCommunities } from '@/lib/community-service';
import { Link } from 'react-router-dom';

// Define types for our data structure
interface Author {
  username: string;
  avatar?: string;
}

interface Community {
  id: string;
  name: string;
}

interface Comment {
  id: string;
  author: Author;
  content: string;
  upvotes: number;
  createdAt: string;
  replies: Comment[];
}

interface Post {
  id: string;
  title: string;
  content: string;
  upvotes: number;
  comments: number;
  community: Community;
  author: Author;
  createdAt: string;
  commentsList: Comment[];
}

interface University {
  id: string;
  name: string;
  description: string;
  members: number;
  type: string;
  category: string;
  location: string;
  ranking: number;
  founded: string;
  logo: string;
  cover: string;
}

// Define type for community data from API
interface CommunityData {
  id: string;
  name: string;
  description?: string;
  members?: number;
  type?: string;
  category?: string;
  location?: string;
  ranking?: number;
  founded?: string;
  logo?: string;
  cover?: string;
}

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [communities, setCommunities] = useState<University[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadCommunities = async () => {
      setLoading(true);
      try {
        const allCommunities = await getAllCommunities();
        const communitiesArray = Object.values(allCommunities).map((community: any) => ({
          id: community.id,
          name: community.name,
          description: community.description || '',
          members: community.members || 0,
          type: community.type || 'public',
          category: community.category || 'general',
          location: community.location || 'United States',
          ranking: community.ranking || Math.floor(Math.random() * 100) + 1,
          founded: community.founded || `${1800 + Math.floor(Math.random() * 200)}`,
          logo: community.logo || '',
          cover: community.cover || ''
        }));
        setCommunities(communitiesArray as University[]);
        setFilteredCommunities(communitiesArray as University[]);
      } catch (error) {
        console.error('Error loading communities:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCommunities();
  }, []);
  
  useEffect(() => {
    let result = communities;
    
    // Filter by search query
    if (searchQuery) {
      result = result.filter(
        (university) => 
          university.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          university.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          university.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory) {
      result = result.filter((university) => university.category === selectedCategory);
    }
    
    setFilteredCommunities(result);
  }, [searchQuery, selectedCategory, communities]);
  
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };
  
  const getRandomLocation = () => {
    const states = [
      'California', 'Massachusetts', 'New York', 'Texas', 'Illinois',
      'Pennsylvania', 'Michigan', 'North Carolina', 'Georgia', 'Ohio'
    ];
    return `${states[Math.floor(Math.random() * states.length)]}`;
  };
  
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen page-transition bg-background">
        <Navbar />
        <div className="pt-20 pb-12 flex justify-center items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  const categories = [
    { id: 'ivy-league', name: 'Ivy League', icon: <GraduationCap className="h-4 w-4" /> },
    { id: 'public', name: 'Public Universities', icon: <Building className="h-4 w-4" /> },
    { id: 'liberal-arts', name: 'Liberal Arts', icon: <Database className="h-4 w-4" /> },
    { id: 'tech', name: 'Technical Institutes', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'international', name: 'International Programs', icon: <Globe className="h-4 w-4" /> }
  ];
  
  return (
    <div className="min-h-screen page-transition bg-background">
      <Navbar />
      <main className="container pt-20 pb-12">
        <div className="text-center mb-8 appear-animation">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">Explore Universities</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover top universities across the United States, connect with students and alumni, and find your perfect educational path
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-[280px_1fr]">
          {/* Filters sidebar */}
          <div className="space-y-6 appear-animation stagger-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search universities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="rounded-lg border shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Categories</h3>
                {(searchQuery || selectedCategory) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleClearFilters}
                    className="h-7 text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>
              
              <div className="space-y-1.5">
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "secondary" : "outline"}
                    size="sm"
                    className="justify-start w-full mb-1"
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    {category.icon}
                    <span>{category.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="space-y-6">
            <Tabs defaultValue="all" className="appear-animation stagger-2">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="all">All Universities</TabsTrigger>
                  <TabsTrigger value="top">Top Ranked</TabsTrigger>
                  <TabsTrigger value="trending">Trending</TabsTrigger>
                </TabsList>
                
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Filter className="h-4 w-4" />
                  <span>Sort</span>
                </Button>
              </div>
              
              <TabsContent value="all" className="space-y-4 mt-2">
                {filteredCommunities.length > 0 ? (
                  filteredCommunities.map((university) => (
                    <UniversityCard key={university.id} university={university} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <GraduationCap className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No universities found</h3>
                    <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
                    <Button onClick={handleClearFilters}>Clear all filters</Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="top" className="space-y-4 mt-2">
                {filteredCommunities
                  .sort((a, b) => (a.ranking || 100) - (b.ranking || 100))
                  .slice(0, 10)
                  .map((university) => (
                    <UniversityCard key={university.id} university={university} />
                  ))
                }
              </TabsContent>
              
              <TabsContent value="trending" className="space-y-4 mt-2">
                {filteredCommunities
                  .sort(() => Math.random() - 0.5) // Just for demo purposes
                  .slice(0, 8)
                  .map((university) => (
                    <UniversityCard key={university.id} university={university} />
                  ))
                }
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

// University Card Component
const UniversityCard = ({ university }: { university: University }) => {
  return (
    <Link to={`/r/${university.id}`} className="block">
      <Card className="overflow-hidden hover:shadow-md transition-all elegant-hover">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="p-4 md:p-6 flex-1">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                
                <div className="flex-1">
                  <CardTitle className="text-lg md:text-xl mb-1.5">{university.name}</CardTitle>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="soft">#{university.ranking || '—'} Ranked</Badge>
                    <Badge variant="outline">{university.location}</Badge>
                    <Badge variant="crystal">Est. {university.founded}</Badge>
                  </div>
                  
                  <CardDescription className="line-clamp-2">
                    {university.description || 'Join this university community to connect with students, alumni, and faculty from around the world.'}
                  </CardDescription>
                </div>
                
                <div className="hidden md:flex items-center text-muted-foreground">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default Explore;
