
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';
import { getAllCommunities } from '@/lib/community-service';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CommunityDataType } from '@/lib/post-service';

const Trending = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortFilter, setSortFilter] = useState<'trending' | 'hot' | 'top'>('trending');
  
  const availableTags = ['visa', 'gre', 'housing', 'campus', 'academics', 'social'];

  // Load posts data
  useEffect(() => {
    const loadData = async () => {
      try {
        const communitiesData = await getAllCommunities() as CommunityDataType;
        
        // Extract all posts
        const allPostsList: any[] = [];
        Object.values(communitiesData).forEach(community => {
          // Add regular posts
          if (community.posts) {
            community.posts.forEach(post => {
              // Add a random tag to each post for demo purposes
              const randomTag = availableTags[Math.floor(Math.random() * availableTags.length)];
              allPostsList.push({...post, tags: [randomTag]});
            });
          }
          
          // Add pinned posts
          if (community.pinnedPosts) {
            community.pinnedPosts.forEach(post => {
              // Add a random tag to each post for demo purposes
              const randomTag = availableTags[Math.floor(Math.random() * availableTags.length)];
              allPostsList.push({...post, tags: [randomTag]});
            });
          }
        });
        
        setPosts(allPostsList);
        applyFilters(allPostsList, searchQuery, selectedTags, sortFilter);
      } catch (error) {
        console.error('Error loading posts:', error);
        toast.error('Failed to load posts. Please try again.');
      }
    };
    
    loadData();
  }, []);

  // Apply filters
  const applyFilters = (allPosts: any[], query: string, tags: string[], sort: string) => {
    // Filter by search query
    let filtered = allPosts;
    
    if (query.trim()) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase()) || 
        post.content.toLowerCase().includes(query.toLowerCase()) ||
        post.community.name.toLowerCase().includes(query.toLowerCase()) ||
        post.author.username.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Filter by tags
    if (tags.length > 0) {
      filtered = filtered.filter(post => 
        post.tags && tags.some(tag => post.tags.includes(tag))
      );
    }
    
    // Sort posts
    switch (sort) {
      case 'trending':
        filtered.sort((a, b) => b.upvotes * 0.7 + b.comments * 0.3 - (a.upvotes * 0.7 + a.comments * 0.3));
        break;
      case 'hot':
        // Sort by recency (for demo purposes using createdAt string)
        filtered.sort((a, b) => a.createdAt.includes('hour') ? -1 : 1);
        break;
      case 'top':
        filtered.sort((a, b) => b.upvotes - a.upvotes);
        break;
    }
    
    setFilteredPosts(filtered);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters(posts, query, selectedTags, sortFilter);
  };

  // Toggle tag filter
  const toggleTag = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newSelectedTags);
    applyFilters(posts, searchQuery, newSelectedTags, sortFilter);
  };

  // Change sort method
  const changeSortMethod = (method: 'trending' | 'hot' | 'top') => {
    setSortFilter(method);
    applyFilters(posts, searchQuery, selectedTags, method);
  };

  return (
    <div className="min-h-screen page-transition">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold">Trending Posts</h1>
            
            <div className="w-full md:w-auto flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="text" 
                  placeholder="Search posts..." 
                  className="pl-9 w-full"
                  value={searchQuery}
                  onChange={handleSearch}
                />
                
                {/* Search Autosuggest (appears when typing) */}
                {searchQuery && (
                  <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-border/50 max-h-60 overflow-auto">
                    {filteredPosts.slice(0, 5).map(post => (
                      <div 
                        key={post.id}
                        className="px-4 py-2 hover:bg-secondary/30 cursor-pointer"
                        onClick={() => navigate(`/post/${post.id}`)}
                      >
                        <div className="text-sm font-medium">{post.title}</div>
                        <div className="text-xs text-muted-foreground">r/{post.community.name}</div>
                      </div>
                    ))}
                    {filteredPosts.length === 0 && (
                      <div className="px-4 py-2 text-sm text-muted-foreground">No results found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {availableTags.map(tag => (
                <Badge 
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="capitalize">{sortFilter}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeSortMethod('trending')}>Trending</DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeSortMethod('hot')}>Hot</DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeSortMethod('top')}>Top</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="space-y-6">
            {filteredPosts.map((post, index) => (
              <PostCard 
                key={post.id} 
                {...post} 
                className={`appear-animation stagger-${index % 3 + 1}`} 
              />
            ))}
          </div>
          
          {filteredPosts.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-border/50 p-8 text-center">
              <p className="text-muted-foreground">No posts match your search criteria.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Trending;
