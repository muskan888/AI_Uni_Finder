
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Pin, MessageSquare, Users, Bell, PlusCircle, Filter, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';
import CreatePostForm from '@/components/CreatePostForm';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { getCommunityData, joinCommunity } from '@/lib/community-service';

const Community = () => {
  const { communityId } = useParams();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [community, setCommunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [hasJoined, setHasJoined] = useState(false);
  
  useEffect(() => {
    const loadCommunity = async () => {
      setLoading(true);
      try {
        const data = await getCommunityData(communityId);
        if (data) {
          setCommunity(data);
          // Check if user has joined this community from localStorage
          const joinedCommunities = JSON.parse(localStorage.getItem('joinedCommunities') || '[]');
          setHasJoined(joinedCommunities.includes(communityId));
        }
      } catch (error) {
        console.error('Error loading community:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCommunity();
  }, [communityId]);
  
  if (loading) {
    return (
      <div className="min-h-screen page-transition bg-background">
        <Navbar />
        <div className="pt-20 flex justify-center items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen flex items-center justify-center page-transition">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Community not found</h1>
          <p className="text-muted-foreground mb-6">The community you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleJoinCommunity = async () => {
    try {
      await joinCommunity(community.id);
      setHasJoined(true);
      
      toast({
        title: hasJoined ? "Left community" : "Joined community",
        description: hasJoined 
          ? `You have left r/${community.name}` 
          : `Welcome to r/${community.name}! You'll now see posts from this community in your feed.`,
      });
      
      // Toggle joined state
      setHasJoined(!hasJoined);
    } catch (error) {
      console.error('Error joining community:', error);
      toast({
        title: "Error",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen page-transition">
      <Navbar />
      
      <main className="pt-16">
        {/* Community header */}
        <div 
          className="h-36 md:h-48 bg-gradient-to-r from-primary/20 to-primary/5 relative"
          style={community.coverImage ? { backgroundImage: `url(${community.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="max-w-7xl mx-auto px-4 md:px-6 relative h-full flex items-end">
            <div className="pb-4 flex items-end gap-4">
              <Avatar className="h-16 md:h-24 w-16 md:w-24 ring-4 ring-white">
                <AvatarImage src={community.logo} alt={community.name} />
                <AvatarFallback className="text-xl md:text-2xl bg-primary text-primary-foreground">
                  {community.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="mb-2">
                <h1 className="text-xl md:text-3xl font-bold text-white drop-shadow-sm">
                  r/{community.name}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-white/90 text-sm">
                    <Users className="h-4 w-4" />
                    <span>{community.members.toLocaleString()} members</span>
                  </div>
                  <span className="text-white/90 hidden sm:inline">•</span>
                  <div className="flex items-center gap-1 text-white/90 text-sm hidden sm:flex">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>{community.online} online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="py-3 flex items-center justify-between">
              <Tabs defaultValue="posts" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-transparent h-9">
                  <TabsTrigger value="posts" className="data-[state=active]:bg-secondary">Posts</TabsTrigger>
                  <TabsTrigger value="about" className="data-[state=active]:bg-secondary">About</TabsTrigger>
                  <TabsTrigger value="rules" className="data-[state=active]:bg-secondary">Rules</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex items-center gap-3">
                <Button 
                  size="sm" 
                  variant={hasJoined ? "default" : "outline"} 
                  className="gap-1.5"
                  onClick={handleJoinCommunity}
                >
                  {hasJoined ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span className="hidden sm:inline">Joined</span>
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4" />
                      <span className="hidden sm:inline">Join</span>
                    </>
                  )}
                </Button>
                <Button 
                  size="sm" 
                  className="gap-1.5"
                  onClick={() => setShowCreatePost(!showCreatePost)}
                >
                  {showCreatePost ? (
                    <>
                      <X className="h-4 w-4" />
                      <span className="hidden sm:inline">Cancel</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Create Post</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {showCreatePost && (
                <div className="mb-6 appear-animation">
                  <CreatePostForm 
                    communityId={community.id} 
                    onSuccess={() => setShowCreatePost(false)}
                  />
                </div>
              )}
              
              {activeTab === "posts" && (
                <>
                  {/* Filter controls */}
                  <div className="bg-white rounded-lg shadow-sm border p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground whitespace-nowrap">
                        Latest
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground whitespace-nowrap">
                        Top
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground whitespace-nowrap">
                        Hot
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5 whitespace-nowrap">
                      <Filter className="h-4 w-4" />
                      <span className="hidden sm:inline">Filter</span>
                    </Button>
                  </div>
                  
                  {/* Pinned posts */}
                  {community.pinnedPosts && community.pinnedPosts.length > 0 && (
                    <div className="space-y-4">
                      {community.pinnedPosts.map((post: any) => (
                        <div key={post.id} className="relative appear-animation">
                          <div className="absolute top-3 right-3 z-10">
                            <Badge variant="secondary" className="gap-1">
                              <Pin className="h-3 w-3" />
                              <span>Pinned</span>
                            </Badge>
                          </div>
                          <PostCard {...post} />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Regular posts */}
                  <div className="space-y-4">
                    {community.posts && community.posts.length > 0 ? (
                      community.posts.map((post: any, index: number) => (
                        <PostCard 
                          key={post.id} 
                          {...post} 
                          className={`appear-animation stagger-${index % 3 + 1}`} 
                        />
                      ))
                    ) : (
                      <div className="bg-white rounded-xl shadow-sm border border-border/50 p-6 text-center">
                        <p className="text-muted-foreground mb-4">No posts in this community yet</p>
                        <Button onClick={() => setShowCreatePost(true)}>
                          Create the first post
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {activeTab === "about" && (
                <div className="bg-white rounded-lg shadow-sm border p-6 appear-animation">
                  <h3 className="text-xl font-semibold mb-4">About r/{community.name}</h3>
                  <p className="mb-6">{community.description}</p>
                  
                  <Separator className="my-6" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
                      <p>{community.createdAt}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Members</h4>
                      <p>{community.members.toLocaleString()}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Online</h4>
                      <p>{community.online}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === "rules" && (
                <div className="bg-white rounded-lg shadow-sm border p-6 appear-animation">
                  <h3 className="text-xl font-semibold mb-4">Community Rules</h3>
                  <ul className="space-y-4">
                    <li className="pb-4 border-b">
                      <h4 className="font-medium">1. Be respectful to fellow members</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Treat others with respect. No personal attacks, hate speech, or harassment.
                      </p>
                    </li>
                    <li className="pb-4 border-b">
                      <h4 className="font-medium">2. No spam or self-promotion</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Don't flood the community with repetitive content or excessive self-promotion.
                      </p>
                    </li>
                    <li className="pb-4 border-b">
                      <h4 className="font-medium">3. Keep content relevant to the university</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        All posts should be related to {community.name} or university life.
                      </p>
                    </li>
                    <li>
                      <h4 className="font-medium">4. No selling of academic materials or services</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Don't sell or buy academic papers, essays, or services that violate academic integrity.
                      </p>
                    </li>
                  </ul>
                </div>
              )}
            </div>
            
            {!isMobile && (
              <div className="space-y-6">
                {/* About community */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">About r/{community.name}</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <p className="text-sm">{community.description}</p>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Created</span>
                        <span>{community.createdAt}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Members</span>
                        <span>{community.members.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full gap-1.5"
                      onClick={handleJoinCommunity}
                      variant={hasJoined ? "outline" : "default"}
                    >
                      {hasJoined ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Joined</span>
                        </>
                      ) : (
                        "Join Community"
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full gap-1.5"
                      onClick={() => setShowCreatePost(!showCreatePost)}
                    >
                      {showCreatePost ? <X className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
                      <span>{showCreatePost ? 'Cancel Post' : 'Create Post'}</span>
                    </Button>
                  </div>
                </div>
                
                {/* Community rules */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">Community Rules</h3>
                  </div>
                  <div className="p-4">
                    <ul className="space-y-3 text-sm">
                      <li className="flex gap-2">
                        <div className="font-medium">1.</div>
                        <div>Be respectful to fellow members</div>
                      </li>
                      <li className="flex gap-2">
                        <div className="font-medium">2.</div>
                        <div>No spam or self-promotion</div>
                      </li>
                      <li className="flex gap-2">
                        <div className="font-medium">3.</div>
                        <div>Keep content relevant to the university</div>
                      </li>
                      <li className="flex gap-2">
                        <div className="font-medium">4.</div>
                        <div>No selling of academic materials or services</div>
                      </li>
                    </ul>
                  </div>
                </div>
                
                {/* Related communities */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">Related Communities</h3>
                  </div>
                  <div className="p-4">
                    <ul className="space-y-4">
                      <li className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>PU</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <Link to="/r/purdue" className="text-sm font-medium hover:text-primary truncate block">
                            r/PurdueUniversity
                          </Link>
                          <div className="text-xs text-muted-foreground">12.3k members</div>
                        </div>
                        <Button size="sm" variant="outline" className="whitespace-nowrap">
                          Join
                        </Button>
                      </li>
                      <li className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>UM</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <Link to="/r/umich" className="text-sm font-medium hover:text-primary truncate block">
                            r/UMich
                          </Link>
                          <div className="text-xs text-muted-foreground">18.7k members</div>
                        </div>
                        <Button size="sm" variant="outline" className="whitespace-nowrap">
                          Join
                        </Button>
                      </li>
                      <li className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>OS</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <Link to="/r/ohiostate" className="text-sm font-medium hover:text-primary truncate block">
                            r/OhioState
                          </Link>
                          <div className="text-xs text-muted-foreground">21.1k members</div>
                        </div>
                        <Button size="sm" variant="outline" className="whitespace-nowrap">
                          Join
                        </Button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Community;
