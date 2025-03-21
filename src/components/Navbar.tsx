
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Globe, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { getAllCommunities } from '@/lib/community-service';
import { CommunityDataType } from '@/lib/post-service';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [communities, setCommunities] = useState<any[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Load communities for search
  useEffect(() => {
    const loadCommunities = async () => {
      try {
        const communitiesData = await getAllCommunities() as CommunityDataType;
        
        // Extract all communities
        const communitiesList = Object.values(communitiesData).map(community => ({
          id: community.id,
          name: community.name,
          description: community.description || '',
          members: community.members || 0,
          logo: community.logo || ''
        }));
        
        setCommunities(communitiesList);
      } catch (error) {
        console.error('Error loading communities:', error);
      }
    };
    
    loadCommunities();
  }, []);

  // Filter communities as user types
  useEffect(() => {
    if (searchInput.trim() === '') {
      setFilteredCommunities([]);
      return;
    }

    const filtered = communities.filter(community => 
      community.name.toLowerCase().includes(searchInput.toLowerCase())
    );
    
    setFilteredCommunities(filtered.slice(0, 5)); // Limit to 5 results
  }, [searchInput, communities]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchInput)}`);
      setSearchInput('');
      setIsSearching(false);
    }
  };

  const handleCommunityClick = (communityId: string) => {
    navigate(`/r/${communityId}`);
    setSearchInput('');
    setIsSearching(false);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out py-4 px-4 md:px-6',
        isScrolled
          ? 'bg-primary/10 backdrop-blur-xl shadow-md border-b border-primary/10'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-accent" />
            <span className="text-xl font-display font-semibold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">UniGlobe Hub</span>
          </Link>
          
          <div className="hidden md:block relative">
            <Popover open={isSearching && filteredCommunities.length > 0} onOpenChange={setIsSearching}>
              <PopoverTrigger asChild>
                <div>
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input 
                      className="pl-10 w-64 bg-secondary/30 border-primary/10 focus-visible:ring-accent" 
                      placeholder="Search communities..." 
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onFocus={() => setIsSearching(true)}
                    />
                  </form>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                <div className="py-2">
                  {filteredCommunities.map(community => (
                    <div 
                      key={community.id}
                      className="px-4 py-2 hover:bg-accent/10 cursor-pointer"
                      onClick={() => handleCommunityClick(community.id)}
                    >
                      <div className="flex items-center gap-2">
                        {community.logo ? (
                          <img src={community.logo} alt="" className="w-6 h-6 rounded-full" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs">{community.name.charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">r/{community.name}</p>
                          <p className="text-xs text-muted-foreground">{community.members} members</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="px-4 py-2 border-t border-border/50">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-sm h-auto py-1"
                      onClick={handleSearch}
                    >
                      <Search className="mr-2 h-3.5 w-3.5" />
                      Search for "{searchInput}"
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <nav className="flex items-center gap-6">
            <Link to="/" className={cn("text-sm font-medium transition-colors hover:text-accent", location.pathname === "/" ? "text-accent" : "text-foreground")}>
              Home
            </Link>
            <Link to="/explore" className={cn("text-sm font-medium transition-colors hover:text-accent", location.pathname === "/explore" ? "text-accent" : "text-foreground")}>
              Explore
            </Link>
            <Link to="/trending" className={cn("text-sm font-medium transition-colors hover:text-accent", location.pathname === "/trending" ? "text-accent" : "text-foreground")}>
              Trending
            </Link>
          </nav>
        </div>

        <button 
          className="md:hidden" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl shadow-lg animate-slide-in-right border-b border-primary/10">
          <div className="p-4 flex flex-col gap-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  className="pl-10 bg-secondary/30 border-primary/10 focus-visible:ring-accent" 
                  placeholder="Search communities..." 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              
              {searchInput && filteredCommunities.length > 0 && (
                <div className="mt-2 bg-card shadow-md rounded-md overflow-hidden border border-border/50">
                  {filteredCommunities.map(community => (
                    <div 
                      key={community.id}
                      className="px-4 py-2 hover:bg-accent/10 cursor-pointer"
                      onClick={() => handleCommunityClick(community.id)}
                    >
                      <p className="text-sm font-medium">r/{community.name}</p>
                      <p className="text-xs text-muted-foreground">{community.members} members</p>
                    </div>
                  ))}
                </div>
              )}
            </form>
            
            <nav className="flex flex-col gap-3">
              <Link 
                to="/" 
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors", 
                  location.pathname === "/" 
                    ? "bg-accent/10 text-accent" 
                    : "hover:bg-secondary/50"
                )}
              >
                Home
              </Link>
              <Link 
                to="/explore" 
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors", 
                  location.pathname === "/explore" 
                    ? "bg-accent/10 text-accent" 
                    : "hover:bg-secondary/50"
                )}
              >
                Explore
              </Link>
              <Link 
                to="/trending" 
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors", 
                  location.pathname === "/trending" 
                    ? "bg-accent/10 text-accent" 
                    : "hover:bg-secondary/50"
                )}
              >
                Trending
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
