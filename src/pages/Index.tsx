import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, ArrowRight, Search, Plus, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';
import CommunityCard from '@/components/CommunityCard';
import Hero from '@/components/Hero';
import { getAllCommunities, createCommunity } from '@/lib/community-service';
import { CommunityDataType } from '@/lib/post-service';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import SemanticSearch from '@/components/SemanticSearch';
import RecommendedCommunities from '@/components/RecommendedCommunities';
import PostSummary from '@/components/PostSummary';
import AIToolsButtons from '@/components/AIToolsButtons';
import UniversityFinder from '@/components/UniversityFinder';

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [searchItems, setSearchItems] = useState<any[]>([]);
  const [showCreateCommunityDialog, setShowCreateCommunityDialog] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState('');
  const [newCommunityDescription, setNewCommunityDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchTerm = searchParams.get('search');
    if (searchTerm) {
      setSearchQuery(searchTerm);
    }
  }, [location.search]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const communitiesData = await getAllCommunities() as CommunityDataType;
        
        const communitiesList = Object.values(communitiesData).map(community => ({
          id: community.id,
          name: community.name,
          description: community.description || '',
          members: community.members || 0,
          logo: community.logo || '',
          coverImage: community.coverImage || ''
        }));
        setCommunities(communitiesList);
        
        const allPostsList: any[] = [];
        Object.values(communitiesData).forEach(community => {
          if (community.posts) {
            community.posts.forEach(post => {
              allPostsList.push(post);
            });
          }
          
          if (community.pinnedPosts) {
            community.pinnedPosts.forEach(post => {
              allPostsList.push(post);
            });
          }
        });
        
        allPostsList.sort((a, b) => b.upvotes - a.upvotes);
        
        setAllPosts(allPostsList);
        
        const searchItems = [
          ...communitiesList.map(community => ({
            id: community.id,
            title: community.name,
            text: `${community.name} ${community.description}`,
            type: 'community' as const
          })),
          
          ...allPostsList.map(post => ({
            id: post.id,
            title: post.title,
            text: `${post.title} ${post.content}`,
            type: 'post' as const,
            communityId: post.community.id,
            communityName: post.community.name
          }))
        ];
        
        setSearchItems(searchItems);
        
        if (searchQuery) {
          filterPosts(searchQuery, allPostsList);
        } else {
          setFilteredPosts(allPostsList);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load content. Please try again.');
      }
    };
    
    loadData();
  }, [searchQuery]);

  const filterPosts = (query: string, posts: any[] = allPosts) => {
    if (query.trim() === '') {
      setFilteredPosts(posts);
      return;
    }
    
    const filtered = posts.filter(post => 
      post.title.toLowerCase().includes(query.toLowerCase()) || 
      post.content.toLowerCase().includes(query.toLowerCase()) ||
      post.community.name.toLowerCase().includes(query.toLowerCase()) ||
      post.author.username.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredPosts(filtered);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterPosts(query);
    
    const searchParams = new URLSearchParams(location.search);
    if (query) {
      searchParams.set('search', query);
      
      const recentSearches = JSON.parse(localStorage.getItem('recent_searches') || '[]');
      if (query.length > 3 && !recentSearches.includes(query)) {
        recentSearches.unshift(query);
        localStorage.setItem('recent_searches', JSON.stringify(recentSearches.slice(0, 10)));
      }
    } else {
      searchParams.delete('search');
    }
    
    const newUrl = `${location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  };

  const handlePostSelect = (postId: string) => {
    const viewedPosts = JSON.parse(localStorage.getItem('viewed_posts') || '[]');
    const post = allPosts.find(p => p.id === postId);
    
    if (post && !viewedPosts.includes(post.title)) {
      viewedPosts.unshift(post.title);
      localStorage.setItem('viewed_posts', JSON.stringify(viewedPosts.slice(0, 10)));
    }
    
    navigate(`/post/${postId}`);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  const handleStartExploring = () => {
    setShowOnboarding(false);
    localStorage.setItem('hideOnboarding', 'true');
  };

  const handleCreateCommunity = async () => {
    if (!newCommunityName.trim()) {
      toast.error('Community name is required');
      return;
    }
    
    setIsCreating(true);
    
    try {
      const newCommunity = await createCommunity(
        newCommunityName.trim(),
        newCommunityDescription.trim() || `A community for ${newCommunityName}`
      );
      
      toast.success(`r/${newCommunity.name} community created!`);
      setShowCreateCommunityDialog(false);
      
      setNewCommunityName('');
      setNewCommunityDescription('');
      
      navigate(`/r/${newCommunity.id}`);
    } catch (error) {
      console.error('Error creating community:', error);
      toast.error('Failed to create community. Try a different name.');
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    const hideOnboarding = localStorage.getItem('hideOnboarding') === 'true';
    setShowOnboarding(!hideOnboarding);
  }, []);

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4 animate-fade-in">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-primary/10">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">Welcome to UniGlobe Hub</h1>
          <p className="text-center text-muted-foreground mb-8">
            Connect with students from over 4,000 U.S. universities and colleges.
          </p>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Which U.S. university are you curious about?
              </label>
              <Input 
                type="text" 
                placeholder="Search for a university..." 
                className="w-full"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            
            {searchQuery && (
              <div className="bg-card rounded-md p-3 max-h-40 overflow-y-auto border border-border/50 shadow-md">
                <ul className="space-y-1">
                  {communities
                    .filter(uni => uni.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(uni => (
                      <li key={uni.id} className="px-2 py-1 hover:bg-accent/10 rounded-md transition-colors">
                        <Link 
                          to={`/r/${uni.id}`} 
                          className="block"
                          onClick={() => setShowOnboarding(false)}
                        >
                          r/{uni.name}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            )}
            
            <div className="flex flex-col space-y-3">
              <Button onClick={handleStartExploring} className="w-full">
                Start Exploring
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setShowOnboarding(false);
                  setShowCreateCommunityDialog(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create a University Community
              </Button>
            </div>
            
            <p className="text-xs text-center text-muted-foreground">
              100% free. No account required to browse.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-transition">
      <Navbar />
      
      <Hero />
      
      <main className="pt-0 pb-16">
        <RecommendedCommunities className="max-w-7xl mx-auto px-4 md:px-6 mt-6 mb-4" />
        
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <AIToolsButtons />
          </div>
        </section>
        
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <UniversityFinder />
          </div>
        </section>
        
        <section id="university-feed" className="py-8 bg-gradient-to-b from-primary/5 to-background">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-7 w-7 text-primary" />
                <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">University Feed</h2>
              </div>
              
              <div className="w-full md:w-auto flex items-center gap-3">
                <SemanticSearch 
                  placeholder="Search posts..."
                  className="w-full md:w-72"
                  searchItems={searchItems}
                  onSearch={(query) => {
                    const recentSearches = JSON.parse(localStorage.getItem('recent_searches') || '[]');
                    if (!recentSearches.includes(query)) {
                      recentSearches.unshift(query);
                      localStorage.setItem('recent_searches', JSON.stringify(recentSearches.slice(0, 10)));
                    }
                  }}
                />
                <Button 
                  variant="outline" 
                  className="whitespace-nowrap gap-2 bg-white/80 backdrop-blur-sm border-primary/30 hover:border-primary/50 hover:bg-white/90 transition-all duration-300 animate-soft-pulse"
                  onClick={() => setShowCreateCommunityDialog(true)}
                >
                  <Plus className="h-4 w-4 text-primary" />
                  Add Community
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <div key={post.id} className={`appear-animation stagger-${index % 3 + 1}`}>
                  <PostCard 
                    {...post} 
                    className=""
                    isPinned={index === 0}
                  />
                  <div className="mt-2 pl-4 border-l-2 border-[#8EBBFF]/30">
                    <PostSummary postId={post.id} content={post.content} />
                  </div>
                </div>
              ))}
            </div>
            
            {filteredPosts.length === 0 && (
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <p className="text-muted-foreground">No posts match your search criteria.</p>
              </div>
            )}
            
            <div className="mt-12 text-center">
              <Button variant="outline" size="lg" asChild className="bg-white/80 backdrop-blur-sm hover:bg-white/90 border-primary/30 hover:border-primary/50">
                <Link to="/trending" className="flex items-center gap-2">
                  More Posts
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-display font-bold mb-2 tracking-tight text-foreground">Popular Communities</h2>
                <p className="text-muted-foreground">Join the conversation in these active university communities</p>
              </div>
              <Button 
                variant="outline"
                onClick={() => setShowCreateCommunityDialog(true)}
                className="gap-2 bg-white/80 backdrop-blur-sm border-primary/30 hover:border-primary/50 hover:bg-white/90 transition-all duration-300 animate-soft-pulse"
              >
                <Plus className="h-4 w-4 text-primary" />
                Add Community
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {communities.slice(0, 4).map((community, index) => (
                <CommunityCard 
                  key={community.id} 
                  {...community} 
                  className={`appear-animation stagger-${index % 4 + 1}`} 
                />
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Button variant="outline" size="lg" asChild className="bg-white/80 backdrop-blur-sm hover:bg-white/90 border-primary/30 hover:border-primary/50">
                <Link to="/explore" className="flex items-center gap-2">
                  Discover More Communities
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        <footer className="bg-gradient-to-t from-primary/5 to-background py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8">
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <Link to="/" className="flex items-center gap-2">
                  <span className="text-xl font-display font-semibold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">UniGlobe Hub</span>
                </Link>
                <span className="text-sm text-muted-foreground">© 2023</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-6">
                <Link to="/about" className="text-sm hover:text-accent transition-colors">About</Link>
                <Link to="/terms" className="text-sm hover:text-accent transition-colors">Terms</Link>
                <Link to="/privacy" className="text-sm hover:text-accent transition-colors">Privacy</Link>
                <Link to="/contact" className="text-sm hover:text-accent transition-colors">Contact</Link>
              </div>
            </div>
            
            <Separator className="bg-primary/10" />
            
            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground">
                Connecting students worldwide through meaningful conversations.
              </p>
              <p className="text-sm font-medium mt-2 text-primary/80">
                Made by Muskan Dhingra
              </p>
            </div>
          </div>
        </footer>
      </main>

      <Dialog open={showCreateCommunityDialog} onOpenChange={setShowCreateCommunityDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create University Community</DialogTitle>
            <DialogDescription>
              Start a new community for your university or college. This will create a dedicated space for discussions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="community-name">Community Name</Label>
              <div className="flex items-center">
                <span className="mr-2 text-muted-foreground">r/</span>
                <Input
                  id="community-name"
                  value={newCommunityName}
                  onChange={(e) => setNewCommunityName(e.target.value)}
                  placeholder="WashingtonUniversity"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                No spaces allowed. Use CamelCase (e.g., WashingtonUniversity).
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="community-description">Description (Optional)</Label>
              <Input
                id="community-description"
                value={newCommunityDescription}
                onChange={(e) => setNewCommunityDescription(e.target.value)}
                placeholder="A community for Washington University students and alumni"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateCommunityDialog(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCommunity}
              disabled={!newCommunityName.trim() || isCreating}
              className="gap-2"
            >
              <School className="h-4 w-4" />
              {isCreating ? 'Creating...' : 'Create Community'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;

